from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from .database import Base

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
    user_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    therapist_profile = relationship("Therapist", back_populates="user", uselist=False)
    diary_entries = relationship("DiaryEntry", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    therapist_relationships = relationship("TherapistPatient", back_populates="patient")

class Therapist(Base):
    __tablename__ = "therapists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="therapist_profile")
    patient_relationships = relationship("TherapistPatient", back_populates="therapist")

class TherapistPatient(Base):
    __tablename__ = "therapist_patients"
    
    id = Column(Integer, primary_key=True, index=True)
    therapist_id = Column(Integer, ForeignKey("therapists.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    therapist = relationship("Therapist", back_populates="patient_relationships")
    patient = relationship("Patient", back_populates="therapist_relationships")

class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mood = Column(Integer)
    content = Column(String)
    activities = Column(String)
    thoughts = Column(String)
    emotions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="diary_entries")
