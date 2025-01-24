from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
from .routers import users, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Emotional Diary API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/diary-entries/", response_model=schemas.DiaryEntry)
def create_diary_entry(diary_entry: schemas.DiaryEntryCreate, user_id: int, db: Session = Depends(get_db)):
    return crud.create_diary_entry(db=db, diary_entry=diary_entry, user_id=user_id)

@app.get("/diary-entries/", response_model=List[schemas.DiaryEntry])
def read_diary_entries(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    diary_entries = crud.get_diary_entries(db, user_id=user_id, skip=skip, limit=limit)
    return diary_entries

@app.get("/diary-entries/{diary_entry_id}", response_model=schemas.DiaryEntry)
def read_diary_entry(diary_entry_id: int, db: Session = Depends(get_db)):
    db_diary_entry = crud.get_diary_entry(db, diary_entry_id=diary_entry_id)
    if db_diary_entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    return db_diary_entry

@app.put("/diary-entries/{diary_entry_id}", response_model=schemas.DiaryEntry)
def update_diary_entry(diary_entry_id: int, diary_entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    db_diary_entry = crud.update_diary_entry(db, diary_entry_id=diary_entry_id, diary_entry=diary_entry)
    if db_diary_entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    return db_diary_entry

@app.delete("/diary-entries/{diary_entry_id}")
def delete_diary_entry(diary_entry_id: int, db: Session = Depends(get_db)):
    success = crud.delete_diary_entry(db, diary_entry_id=diary_entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    return {"message": "Diary entry deleted successfully"}

# Include routers
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Emotional Diary API", "timestamp": datetime.now().isoformat()}

# Initialize admin user on startup
@app.on_event("startup")
async def startup_event():
    from .database import get_db
    db = next(get_db())
    await users.init_admin(db)

if __name__ == "__main__":
    # Run on all interfaces (0.0.0.0) to allow external access
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=4
    )
