from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .. import models, schemas, security
from ..database import get_db
from collections import defaultdict

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/emotions/summary")
async def get_emotions_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get summary of emotions over time."""
    query = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id
    )
    
    if start_date:
        query = query.filter(models.DiaryEntry.date >= start_date)
    if end_date:
        query = query.filter(models.DiaryEntry.date <= end_date)
    
    entries = query.order_by(models.DiaryEntry.date).all()
    
    # Process emotions data
    emotion_trends = defaultdict(list)
    dates = []
    
    for entry in entries:
        dates.append(entry.date)
        for emotion, intensity in entry.emotions.items():
            emotion_trends[emotion].append(intensity)
    
    return {
        "dates": dates,
        "emotions": dict(emotion_trends)
    }

@router.get("/behaviors/summary")
async def get_behaviors_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get summary of behavioral patterns."""
    query = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id
    )
    
    if start_date:
        query = query.filter(models.DiaryEntry.date >= start_date)
    if end_date:
        query = query.filter(models.DiaryEntry.date <= end_date)
    
    entries = query.all()
    
    behaviors_count = {
        "self_harm": sum(1 for entry in entries if entry.self_harm),
        "suicidal_thoughts": sum(1 for entry in entries if entry.suicidal_thoughts),
        "stressful_events": sum(1 for entry in entries if entry.stressful_events),
        "medications_taken": sum(1 for entry in entries if entry.medications_taken),
    }
    
    total_entries = len(entries)
    
    return {
        "counts": behaviors_count,
        "total_entries": total_entries
    }

@router.get("/therapist/patients/summary")
async def get_patients_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get summary of all patients' data (for therapists only)."""
    if not current_user.is_therapist:
        raise HTTPException(status_code=403, detail="Only therapists can access this endpoint")
    
    # Get all patients for the therapist
    patients = db.query(models.TherapistPatient).filter(
        models.TherapistPatient.therapist_id == current_user.id
    ).all()
    
    patient_summaries = []
    
    for patient_relation in patients:
        patient = db.query(models.User).filter(
            models.User.id == patient_relation.patient_id
        ).first()
        
        # Get latest entry
        latest_entry = db.query(models.DiaryEntry).filter(
            models.DiaryEntry.user_id == patient.id
        ).order_by(models.DiaryEntry.date.desc()).first()
        
        # Get entries from last week
        week_ago = datetime.now() - timedelta(days=7)
        recent_entries = db.query(models.DiaryEntry).filter(
            and_(
                models.DiaryEntry.user_id == patient.id,
                models.DiaryEntry.date >= week_ago
            )
        ).all()
        
        # Calculate risk factors
        risk_factors = []
        if any(entry.self_harm for entry in recent_entries):
            risk_factors.append("פגיעה עצמית")
        if any(entry.suicidal_thoughts for entry in recent_entries):
            risk_factors.append("מחשבות אובדניות")
        
        patient_summaries.append({
            "patient_id": patient.id,
            "name": patient.full_name,
            "last_entry_date": latest_entry.date if latest_entry else None,
            "entries_last_week": len(recent_entries),
            "risk_factors": risk_factors,
            "needs_attention": len(risk_factors) > 0
        })
    
    return patient_summaries

@router.get("/therapist/patient/{patient_id}/details")
async def get_patient_details(
    patient_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get detailed analysis for a specific patient (for therapists only)."""
    if not current_user.is_therapist:
        raise HTTPException(status_code=403, detail="Only therapists can access this endpoint")
    
    # Verify therapist-patient relationship
    relationship = db.query(models.TherapistPatient).filter(
        and_(
            models.TherapistPatient.therapist_id == current_user.id,
            models.TherapistPatient.patient_id == patient_id
        )
    ).first()
    
    if not relationship:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get patient's entries
    query = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == patient_id
    )
    
    if start_date:
        query = query.filter(models.DiaryEntry.date >= start_date)
    if end_date:
        query = query.filter(models.DiaryEntry.date <= end_date)
    
    entries = query.order_by(models.DiaryEntry.date).all()
    
    # Process data
    emotion_trends = defaultdict(list)
    dates = []
    behaviors = {
        "self_harm": [],
        "suicidal_thoughts": [],
        "stressful_events": [],
        "medications_taken": []
    }
    
    for entry in entries:
        dates.append(entry.date)
        for emotion, intensity in entry.emotions.items():
            emotion_trends[emotion].append(intensity)
        
        behaviors["self_harm"].append(entry.self_harm)
        behaviors["suicidal_thoughts"].append(entry.suicidal_thoughts)
        behaviors["stressful_events"].append(entry.stressful_events)
        behaviors["medications_taken"].append(entry.medications_taken)
    
    return {
        "dates": dates,
        "emotions": dict(emotion_trends),
        "behaviors": behaviors
    }
