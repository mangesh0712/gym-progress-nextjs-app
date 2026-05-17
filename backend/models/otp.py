from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=13, le=120)
    weight: float = Field(..., gt=0)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class OTPResponse(BaseModel):
    message: str
    expires_in: int


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    token_type: str = "bearer"


class OTPRecord(BaseModel):
    id: str
    phone: str
    code: str
    created_at: datetime
    expires_at: datetime
    verified: bool

    class Config:
        orm_mode = True
