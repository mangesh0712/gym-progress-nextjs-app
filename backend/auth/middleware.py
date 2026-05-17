import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import os
from typing import Optional

security = HTTPBearer()


async def get_current_user_id(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """
    Extract and validate user_id from JWT token.

    Args:
        credentials: HTTP Bearer token from request header

    Returns:
        user_id extracted from JWT 'sub' claim

    Raises:
        HTTPException: 401 if token is invalid or missing user_id
    """
    token = credentials.credentials

    try:
        # Decode JWT without verifying signature (Supabase token verification)
        # In production, verify signature using Supabase public key
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id: Optional[str] = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user_id",
            )

        return user_id

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )
