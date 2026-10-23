"""
Authentication Pydantic schemas for request validation and response serialization.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    handle: str
    user_id: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    handle: str = Field(..., min_length=3, max_length=50, description="Desired Career ID username without @")
    target_role: Optional[str] = "Full Stack Developer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
