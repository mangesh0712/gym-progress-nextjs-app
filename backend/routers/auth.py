from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from typing import Optional
import random
import string
import logging
from datetime import datetime, timedelta
import jwt
import uuid

from models.otp import SignupRequest, SignupVerifyRequest, OTPRequest, OTPVerify, OTPResponse, AuthResponse
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


@router.post("/signup", response_model=OTPResponse, status_code=status.HTTP_200_OK)
async def signup(
    request: SignupRequest,
    db: SupabaseDB = Depends(get_db),
    email_service=Depends(get_email_service),
) -> OTPResponse:
    """
    Sign up a new user and send OTP to email.

    Args:
        request: Signup request with user details
        db: Database client
        email_service: Email service instance

    Returns:
        Response with message and expiry time
    """
    try:
        # Check if user already exists
        if db.user_exists(request.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Generate OTP
        code = generate_otp()

        # Store OTP in database
        db.store_otp(request.email, code)

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

        # Store signup data in session/cache for verification (in production, use Redis)
        # For now, we'll create the user after OTP verification
        logger.info(f"Signup OTP sent to {request.email}")

        return OTPResponse(
            message="OTP sent to your email. Please verify to complete signup.",
            expires_in=600,  # 10 minutes in seconds
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sign up",
        )


@router.post("/verify-signup", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_signup(
    request: SignupVerifyRequest,
    db: SupabaseDB = Depends(get_db),
) -> AuthResponse:
    """
    Verify OTP during signup and create user account.

    Args:
        request: Signup request with user details and OTP code
        db: Database client

    Returns:
        AuthResponse with access token and refresh token
    """
    try:
        # Verify OTP
        otp_record = db.verify_otp(request.email, request.otp_code)

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP",
            )

        # Create user with all details
        user = db.create_user(
            name=request.name,
            age=request.age,
            weight=request.weight,
            email=request.email,
            phone=request.phone,
        )

        user_id = user.get("id", "")

        # Generate JWT tokens
        access_jti = str(uuid.uuid4())
        access_payload = {
            "sub": user_id,
            "email": request.email,
            "name": request.name,
            "jti": access_jti,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES),
        }
        access_token = jwt.encode(
            access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        refresh_jti = str(uuid.uuid4())
        refresh_payload = {
            "sub": user_id,
            "email": request.email,
            "jti": refresh_jti,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=30),
        }
        refresh_token = jwt.encode(
            refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        logger.info(f"User signed up: {user_id} ({request.email})")

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP",
        )


@router.post("/send-otp", response_model=OTPResponse, status_code=status.HTTP_200_OK)
async def send_otp(
    request: OTPRequest,
    db: SupabaseDB = Depends(get_db),
    email_service=Depends(get_email_service),
) -> OTPResponse:
    """
    Send OTP to email for login.

    Args:
        request: OTP request with email
        db: Database client
        email_service: Email service instance

    Returns:
        Response with message and expiry time
    """
    try:
        # Check if user exists
        if not db.user_exists(request.email):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not registered. Please sign up first.",
            )

        # Generate OTP
        code = generate_otp()

        # Store OTP in database
        db.store_otp(request.email, code)

        # Send OTP via email
        email_sent = await email_service.send_otp_email(
            email=request.email, phone="", otp_code=code
        )

        if not email_sent:
            logger.warning(f"Failed to send OTP email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email. Please try again.",
            )

        logger.info(f"Login OTP sent to {request.email}")

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
    Verify OTP and return authentication tokens for login.

    Args:
        request: OTP verification request with email and code
        db: Database client

    Returns:
        AuthResponse with access token and refresh token
    """
    try:
        # Verify OTP
        otp_record = db.verify_otp(request.email, request.code)

        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP",
            )

        # Get user
        user = db.get_or_create_user(request.email)
        user_id = user.get("id", "")

        # Generate JWT tokens
        access_jti = str(uuid.uuid4())
        access_payload = {
            "sub": user_id,
            "email": request.email,
            "jti": access_jti,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES),
        }
        access_token = jwt.encode(
            access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        refresh_jti = str(uuid.uuid4())
        refresh_payload = {
            "sub": user_id,
            "email": request.email,
            "jti": refresh_jti,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=30),
        }
        refresh_token = jwt.encode(
            refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        logger.info(f"User logged in: {user_id} ({request.email})")

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


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    credentials: HTTPBearer = Depends(HTTPBearer()),
    db: SupabaseDB = Depends(get_db),
) -> dict:
    """
    Logout user by blacklisting their token.

    Args:
        credentials: Bearer token from request header
        db: Database client

    Returns:
        Confirmation message
    """
    try:
        token = credentials.credentials

        # Decode token to get jti and expiry
        payload = jwt.decode(token, options={"verify_signature": False})
        jti = payload.get("jti")
        user_id = payload.get("sub")
        exp_timestamp = payload.get("exp")

        if not jti or not user_id or not exp_timestamp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token structure",
            )

        # Convert Unix timestamp to datetime
        expires_at = datetime.utcfromtimestamp(exp_timestamp)

        # Add token to blacklist
        db.blacklist_token(jti, user_id, expires_at)

        logger.info(f"User logged out: {user_id}")

        return {"message": "Logged out successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to logout",
        )


@router.post("/refresh", response_model=dict, status_code=status.HTTP_200_OK)
async def refresh_token(request: dict) -> dict:
    """
    Refresh an expired access token using a refresh token.

    Args:
        request: Request with refresh_token

    Returns:
        New access token
    """
    try:
        refresh_token_str = request.get("refresh_token")
        if not refresh_token_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token required",
            )

        # Decode refresh token (no signature verification for now)
        payload = jwt.decode(refresh_token_str, options={"verify_signature": False})
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Generate new access token
        new_payload = {
            "sub": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES),
            "jti": str(uuid.uuid4()),
        }

        new_access_token = jwt.encode(
            new_payload, JWT_SECRET, algorithm=JWT_ALGORITHM
        )

        logger.info(f"Token refreshed for user: {user_id}")

        return {"access_token": new_access_token}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
