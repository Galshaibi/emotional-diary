from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Any, Dict

from .. import models, schemas
from ..database import get_db
from ..auth import get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.User)
async def create_user(
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
) -> Any:
    try:
        print("Raw request body:", body)
        
        # Check if user exists
        db_user = db.query(models.User).filter(models.User.email == body["email"]).first()
        if db_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(body["password"])
        
        db_user = models.User(
            email=body["email"],
            hashed_password=hashed_password,
            first_name=body["first_name"],
            last_name=body["last_name"],
            user_type=body["user_type"],
            created_at=datetime.utcnow()
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create profile based on user type
        if body["user_type"] == "PATIENT":
            patient_profile = models.Patient(
                user_id=db_user.id,
                date_of_birth=None,  # Will be updated later
                gender=None,  # Will be updated later
                phone_number=None  # Will be updated later
            )
            db.add(patient_profile)
        else:  # THERAPIST
            therapist_profile = models.Therapist(
                user_id=db_user.id,
                license_number=None,  # Will be updated later
                specialization=None,  # Will be updated later
                years_of_experience=None  # Will be updated later
            )
            db.add(therapist_profile)
        
        db.commit()
        
        return db_user
        
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating user: {str(e)}"
        )

@router.get("/")
async def get_users(db: Session = Depends(get_db)):
    try:
        users = db.query(models.User).all()
        return [
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "user_type": user.user_type,
                "created_at": user.created_at
            }
            for user in users
        ]
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting users: {str(e)}"
        )

# Initialize demo users
@router.post("/init-demo-users")
async def init_demo_users(db: Session = Depends(get_db)):
    # Create demo patient
    patient_email = "patient@demo.com"
    if not db.query(models.User).filter(models.User.email == patient_email).first():
        await create_user(
            Body(
                {
                    "email": "patient@demo.com", 
                    "password": "Patient123!", 
                    "first_name": "Demo", 
                    "last_name": "Patient", 
                    "user_type": "PATIENT"
                }
            ),
            db=db
        )
    
    # Create demo therapist
    therapist_email = "therapist@demo.com"
    if not db.query(models.User).filter(models.User.email == therapist_email).first():
        await create_user(
            Body(
                {
                    "email": "therapist@demo.com", 
                    "password": "Therapist123!", 
                    "first_name": "Demo", 
                    "last_name": "Therapist", 
                    "user_type": "THERAPIST"
                }
            ),
            db=db
        )
    
    return {"message": "Demo users created successfully"}

# Initialize admin user
@router.post("/init-admin")
async def init_admin(db: Session = Depends(get_db)):
    admin_email = "admin@admin.com"
    if not db.query(models.User).filter(models.User.email == admin_email).first():
        try:
            # Create admin user
            hashed_password = get_password_hash("Admin123")
            admin_user = models.User(
                email=admin_email,
                hashed_password=hashed_password,
                first_name="Admin",
                last_name="User",
                user_type="THERAPIST",  # Admin will be a therapist
                created_at=datetime.utcnow()
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Create therapist profile for admin
            therapist_profile = models.Therapist(
                user_id=admin_user.id,
                license_number="ADMIN-LICENSE",
                specialization="System Administrator",
                years_of_experience=99
            )
            db.add(therapist_profile)
            db.commit()
            
            return {"message": "Admin user created successfully"}
        except Exception as e:
            db.rollback()
            print(f"Error creating admin user: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating admin user: {str(e)}"
            )
    return {"message": "Admin user already exists"}
