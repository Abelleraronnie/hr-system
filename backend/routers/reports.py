from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from routers.auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_employees = db.query(models.Employee).filter(models.Employee.status == "active").count()
    total_departments = db.query(models.Department).count()
    pending_leaves = db.query(models.Leave).filter(models.Leave.status == "pending").count()
    total_payroll_pending = db.query(func.sum(models.Payroll.net_pay)).filter(
        models.Payroll.status == "pending"
    ).scalar() or 0

    return {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "pending_leaves": pending_leaves,
        "total_payroll_pending": round(total_payroll_pending, 2),
    }


@router.get("/attendance-summary")
def attendance_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    present = db.query(models.Attendance).filter(models.Attendance.status == "present").count()
    absent  = db.query(models.Attendance).filter(models.Attendance.status == "absent").count()
    late    = db.query(models.Attendance).filter(models.Attendance.status == "late").count()
    halfday = db.query(models.Attendance).filter(models.Attendance.status == "half-day").count()
    return {"present": present, "absent": absent, "late": late, "half_day": halfday}


@router.get("/leave-summary")
def leave_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    approved = db.query(models.Leave).filter(models.Leave.status == "approved").count()
    pending  = db.query(models.Leave).filter(models.Leave.status == "pending").count()
    rejected = db.query(models.Leave).filter(models.Leave.status == "rejected").count()
    return {"approved": approved, "pending": pending, "rejected": rejected}


@router.get("/payroll-summary")
def payroll_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_paid    = db.query(func.sum(models.Payroll.net_pay)).filter(models.Payroll.status == "paid").scalar() or 0
    total_pending = db.query(func.sum(models.Payroll.net_pay)).filter(models.Payroll.status == "pending").scalar() or 0
    count_paid    = db.query(models.Payroll).filter(models.Payroll.status == "paid").count()
    count_pending = db.query(models.Payroll).filter(models.Payroll.status == "pending").count()
    return {
        "total_paid": round(total_paid, 2),
        "total_pending": round(total_pending, 2),
        "count_paid": count_paid,
        "count_pending": count_pending,
    }
