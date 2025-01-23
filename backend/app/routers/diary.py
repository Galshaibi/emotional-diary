from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/diary", tags=["diary"])

@router.post("/entries", response_model=schemas.DiaryEntry)
async def create_diary_entry(
    entry: schemas.DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    # Check if entry already exists for this date
    existing_entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id,
        models.DiaryEntry.date == entry.date
    ).first()
    
    if existing_entry:
        raise HTTPException(
            status_code=400,
            detail="Entry already exists for this date"
        )
    
    db_entry = models.DiaryEntry(**entry.dict(), user_id=current_user.id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/entries", response_model=List[schemas.DiaryEntry])
async def get_diary_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    query = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id
    )
    
    if start_date:
        query = query.filter(models.DiaryEntry.date >= start_date)
    if end_date:
        query = query.filter(models.DiaryEntry.date <= end_date)
    
    return query.order_by(models.DiaryEntry.date.desc()).all()

@router.get("/entries/{entry_id}", response_model=schemas.DiaryEntry)
async def get_diary_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )
    
    return entry

@router.put("/entries/{entry_id}", response_model=schemas.DiaryEntry)
async def update_diary_entry(
    entry_id: int,
    entry_update: schemas.DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )
    
    for key, value in entry_update.dict().items():
        setattr(entry, key, value)
    
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found"
        )
    
    db.delete(entry)
    db.commit()
    return None
