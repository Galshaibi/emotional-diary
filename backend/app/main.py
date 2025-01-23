from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
from .routers import users, auth
from .database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Emotional Diary API")

# Configure CORS - allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
