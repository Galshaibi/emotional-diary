from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Therapist(Base):
    __tablename__ = "therapists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    license_number = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    years_of_experience = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="therapist_profile")
