from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
from ..database import Base

class UserType(str, Enum):
    PATIENT = "PATIENT"
    THERAPIST = "THERAPIST"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    user_type = Column(SQLAlchemyEnum(UserType))
    created_at = Column(DateTime)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    therapist_profile = relationship("Therapist", back_populates="user", uselist=False)
    diary_entries = relationship("DiaryEntry", back_populates="user")
