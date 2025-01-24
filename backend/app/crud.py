from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_diary_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.DiaryEntry).filter(models.DiaryEntry.user_id == user_id)\
        .order_by(models.DiaryEntry.created_at.desc())\
        .offset(skip).limit(limit).all()

def create_diary_entry(db: Session, diary_entry: schemas.DiaryEntryCreate, user_id: int):
    db_diary_entry = models.DiaryEntry(
        user_id=user_id,
        mood=diary_entry.mood,
        content=diary_entry.content,
        activities=diary_entry.activities,
        thoughts=diary_entry.thoughts,
        emotions=diary_entry.emotions
    )
    db.add(db_diary_entry)
    db.commit()
    db.refresh(db_diary_entry)
    return db_diary_entry

def get_diary_entry(db: Session, diary_entry_id: int):
    return db.query(models.DiaryEntry).filter(models.DiaryEntry.id == diary_entry_id).first()

def update_diary_entry(db: Session, diary_entry_id: int, diary_entry: schemas.DiaryEntryCreate):
    db_diary_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == diary_entry_id).first()
    if db_diary_entry:
        for key, value in diary_entry.dict().items():
            setattr(db_diary_entry, key, value)
        db.commit()
        db.refresh(db_diary_entry)
    return db_diary_entry

def delete_diary_entry(db: Session, diary_entry_id: int):
    db_diary_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == diary_entry_id).first()
    if db_diary_entry:
        db.delete(db_diary_entry)
        db.commit()
        return True
    return False
