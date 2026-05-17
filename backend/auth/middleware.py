import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import os
from typing import Optional
from db.supabase_client import get_db

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthCredentials = Depends(security),
    db = Depends(get_db),
) -> str:
    """
    Extract and validate user_id from JWT token, checking blacklist.

    Args:
        credentials: HTTP Bearer token from request header
        db: Database client for blacklist check

    Returns:
        user_id extracted from JWT 'sub' claim

    Raises:
        HTTPException: 401 if token is invalid, missing user_id, or blacklisted
    """
    token = credentials.credentials

    try:
        # Decode JWT without verifying signature (Supabase token verification)
        # In production, verify signature using Supabase public key
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id: Optional[str] = payload.get("sub")
        jti: Optional[str] = payload.get("jti")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user_id",
            )

        # Check if token has been blacklisted (revoked)
        if jti and db.is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
            )

        return user_id

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )
