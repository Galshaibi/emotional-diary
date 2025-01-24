from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from .models import UserType

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    user_type: UserType

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "user_type": "PATIENT"
            }
        }

class UserCreate(UserBase):
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123",
                "first_name": "John",
                "last_name": "Doe",
                "user_type": "PATIENT"
            }
        }

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: UserType
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class PatientBase(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class TherapistBase(BaseModel):
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None

class TherapistCreate(TherapistBase):
    pass

class Therapist(TherapistBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DiaryEntryBase(BaseModel):
    mood: int
    content: str
    activities: str
    thoughts: str
    emotions: List[str]

class DiaryEntryCreate(DiaryEntryBase):
    pass

class DiaryEntry(DiaryEntryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
