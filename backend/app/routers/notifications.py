from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from .. import models, schemas, security
from ..database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

fastmail = FastMail(conf)

async def send_email_notification(
    email_to: str,
    subject: str,
    body: str
):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype="html"
    )
    await fastmail.send_message(message)

@router.post("/settings")
async def update_notification_settings(
    reminder_time: str,
    email_notifications: bool,
    push_notifications: bool,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Update user's notification preferences."""
    settings = db.query(models.NotificationSettings).filter(
        models.NotificationSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = models.NotificationSettings(
            user_id=current_user.id,
            reminder_time=reminder_time,
            email_notifications=email_notifications,
            push_notifications=push_notifications
        )
        db.add(settings)
    else:
        settings.reminder_time = reminder_time
        settings.email_notifications = email_notifications
        settings.push_notifications = push_notifications
    
    db.commit()
    return {"message": "הגדרות ההתראות עודכנו בהצלחה"}

@router.get("/unread")
async def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Get user's unread notifications."""
    notifications = db.query(models.Notification).filter(
        and_(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False
        )
    ).order_by(models.Notification.created_at.desc()).all()
    
    return notifications

@router.post("/mark-read/{notification_id}")
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    """Mark a notification as read."""
    notification = db.query(models.Notification).filter(
        and_(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="התראה לא נמצאה")
    
    notification.is_read = True
    db.commit()
    return {"message": "ההתראה סומנה כנקראה"}

@router.post("/send-reminders")
async def send_daily_reminders(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send daily reminders to users who haven't filled their diary yet."""
    current_time = datetime.now().strftime("%H:%M")
    
    # Get users who have reminder set for current time
    settings = db.query(models.NotificationSettings).filter(
        models.NotificationSettings.reminder_time == current_time
    ).all()
    
    for setting in settings:
        user = db.query(models.User).filter(models.User.id == setting.user_id).first()
        
        # Check if user has already filled diary today
        today_entry = db.query(models.DiaryEntry).filter(
            and_(
                models.DiaryEntry.user_id == user.id,
                models.DiaryEntry.date >= datetime.now().date()
            )
        ).first()
        
        if not today_entry:
            # Create notification
            notification = models.Notification(
                user_id=user.id,
                type="reminder",
                message="אל תשכח/י למלא את היומן הרגשי היום"
            )
            db.add(notification)
            
            # Send email if enabled
            if setting.email_notifications:
                background_tasks.add_task(
                    send_email_notification,
                    user.email,
                    "תזכורת - יומן רגשי",
                    f"""
                    <h2>שלום {user.full_name},</h2>
                    <p>זוהי תזכורת ידידותית למלא את היומן הרגשי היומי שלך.</p>
                    <p>מילוי היומן באופן קבוע יעזור לך ולמטפל שלך לעקוב אחר ההתקדמות שלך.</p>
                    """
                )
    
    db.commit()
    return {"message": "התזכורות נשלחו בהצלחה"}

@router.post("/alert-therapist")
async def send_therapist_alert(
    background_tasks: BackgroundTasks,
    patient_id: int,
    alert_type: str,
    db: Session = Depends(get_db)
):
    """Send alert to therapist about concerning patient behavior."""
    # Get patient and therapist
    relationship = db.query(models.TherapistPatient).filter(
        models.TherapistPatient.patient_id == patient_id
    ).first()
    
    if not relationship:
        return
    
    therapist = db.query(models.User).filter(
        models.User.id == relationship.therapist_id
    ).first()
    
    patient = db.query(models.User).filter(
        models.User.id == patient_id
    ).first()
    
    # Create notification for therapist
    notification = models.Notification(
        user_id=therapist.id,
        type="alert",
        message=f"התראה: {alert_type} אצל המטופל/ת {patient.full_name}"
    )
    db.add(notification)
    
    # Send email to therapist
    background_tasks.add_task(
        send_email_notification,
        therapist.email,
        f"התראה דחופה - {patient.full_name}",
        f"""
        <h2>שלום {therapist.full_name},</h2>
        <p>התקבלה התראה חשובה לגבי המטופל/ת {patient.full_name}:</p>
        <p><strong>{alert_type}</strong></p>
        <p>אנא בדוק/י את המערכת בהקדם האפשרי.</p>
        """
    )
    
    db.commit()
    return {"message": "ההתראה נשלחה למטפל בהצלחה"}
