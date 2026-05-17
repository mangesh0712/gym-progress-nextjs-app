from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
import random
import string
import logging
from datetime import datetime, timedelta
import jwt

from models.otp import OTPRequest, OTPVerify, OTPResponse, AuthResponse
from db.supabase_client import SupabaseDB, get_db
from services.email_service import get_email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret key for JWT - should be in environment variables in production
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_MINUTES = 7 * 24 * 60  # 7 days


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return "".join(random.choices(string.digits, k=6))




@router.post("/send-otp", response_model=OTPResponse, status_code=status.HTTP_200_OK)
async def send_otp(
    request: OTPRequest,
    db: SupabaseDB = Depends(get_db),
    email_service=Depends(get_email_service),
) -> OTPResponse:
    """
    Send OTP to email address.

    Args:
        request: OTP request with phone number and email
        db: Database client
        email_service: Email service instance

    Returns:
        Response with message and expiry time
    """
    try:
        # Generate OTP
        code = generate_otp()

        # Store OTP in database
        db.store_otp(request.phone, code)

        # Send OTP via email
        email_sent = await email_service.send_otp_email(
            email=request.email, phone=request.phone, otp_code=code
        )

        if not email_sent:
            logger.warning(f"Failed to send OTP email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email. Please try again.",
            )

        logger.info(f"OTP sent to {request.email} for phone {request.phone}")

        return OTPResponse(
            message="OTP sent to your email. Please check your inbox.",
            expires_in=600,  # 10 minutes in seconds
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP",
        )


@router.post("/verify-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_otp(request: OTPVerify, db: SupabaseDB = Depends(get_db)) -> AuthResponse:
    """
    Verify OTP and return authentication tokens.

    Args:
        request: OTP verification request with phone, email, and code
        db: Database client

    Returns:
        AuthResponse with access token and refresh token
    """
    try:
        # Verify OTP
        otp_record = db.verify_otp(request.phone, request.code)

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP",
            )

        # Get or create user
        user = db.get_or_create_user(request.phone)

        # Generate JWT tokens
        user_id = user.get("id", "")

        # Access token
        access_payload = {
            "sub": user_id,
            "phone": request.phone,
            "email": request.email,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES),
        }
        access_token = jwt.encode(
            access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        # Refresh token (longer expiry)
        refresh_payload = {
            "sub": user_id,
            "phone": request.phone,
            "email": request.email,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=30),
        }
        refresh_token = jwt.encode(
            refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        logger.info(f"User authenticated: {user_id} ({request.email})")

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP",
        )
