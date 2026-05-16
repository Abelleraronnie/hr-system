from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_attendance(
    date_filter: str = None,
    employee_id: int = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(models.Attendance)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    records = query.order_by(models.Attendance.date.desc()).all()
    result = []
    for r in records:
        emp = r.employee
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "date": r.date,
            "time_in": r.time_in,
            "time_out": r.time_out,
            "status": r.status,
            "notes": r.notes,
        })
    return result


@router.post("/time-in")
def time_in(data: schemas.TimeIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    today = date.today()
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == data.employee_id,
        models.Attendance.date == today,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already timed in today")
    now = datetime.now()
    status = "late" if now.hour >= 9 else "present"
    record = models.Attendance(
        employee_id=data.employee_id,
        date=today,
        time_in=now,
        status=status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": "Time in recorded", "time": now, "id": record.id, "status": status}


@router.put("/time-out/{attendance_id}")
def time_out(attendance_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if record.time_out:
        raise HTTPException(status_code=400, detail="Already timed out")
    record.time_out = datetime.now()
    db.commit()
    return {"message": "Time out recorded", "time": record.time_out}


@router.post("/manual", status_code=201)
def manual_attendance(data: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = models.Attendance(**data.dict())
    db.add(record)
    db.commit()
    return {"message": "Attendance recorded manually"}


@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    record = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}
