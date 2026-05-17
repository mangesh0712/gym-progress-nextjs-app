from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class OTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5)


class OTPVerify(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: str = Field(..., min_length=5)
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
