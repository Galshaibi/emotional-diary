from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User, UserType
from app.models.patient import Patient
from app.models.therapist import Therapist

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database(db: Session):
    # Create a demo patient
    demo_patient = User(
        email="patient@demo.com",
        hashed_password=pwd_context.hash("Patient123!"),
        first_name="ישראל",
        last_name="ישראלי",
        user_type=UserType.PATIENT,
        created_at=datetime.utcnow()
    )
    db.add(demo_patient)
    db.flush()  # Flush to get the ID

    # Create patient profile
    patient_profile = Patient(
        user_id=demo_patient.id,
        date_of_birth=datetime(1990, 1, 1),
        gender="זכר",
        phone_number="050-1234567"
    )
    db.add(patient_profile)

    # Create a demo therapist
    demo_therapist = User(
        email="therapist@demo.com",
        hashed_password=pwd_context.hash("Therapist123!"),
        first_name="דנה",
        last_name="כהן",
        user_type=UserType.THERAPIST,
        created_at=datetime.utcnow()
    )
    db.add(demo_therapist)
    db.flush()  # Flush to get the ID

    # Create therapist profile
    therapist_profile = Therapist(
        user_id=demo_therapist.id,
        license_number="12345",
        specialization="פסיכולוגית קלינית",
        years_of_experience=10
    )
    db.add(therapist_profile)

    db.commit()
