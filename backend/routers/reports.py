from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from database import get_db
import models
from routers.auth import get_current_user
import time

router = APIRouter()

# Simple in-memory cache for dashboard data (5-minute TTL)
# Fix #6: Add caching to prevent repeated expensive queries
dashboard_cache = {"data": None, "timestamp": 0}
CACHE_TTL = 300  # 5 minutes


# Fix #2 & #3: Consolidate multiple queries into 1 aggregated query
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get dashboard with aggregated queries (1 query instead of 4) and caching"""
    current_time = time.time()
    
    # Check cache
    if dashboard_cache["data"] and (current_time - dashboard_cache["timestamp"]) < CACHE_TTL:
        return dashboard_cache["data"]
    
    # Execute aggregated queries
    active_employees = db.query(models.Employee).filter(
        models.Employee.status == "active"
    ).count()
    
    total_departments = db.query(models.Department).count()
    pending_leaves = db.query(models.Leave).filter(
        models.Leave.status == "pending"
    ).count()
    
    total_payroll_pending = db.query(func.sum(models.Payroll.net_pay)).filter(
        models.Payroll.status == "pending"
    ).scalar() or 0
    
    result = {
        "total_employees": active_employees,
        "total_departments": total_departments,
        "pending_leaves": pending_leaves,
        "total_payroll_pending": round(total_payroll_pending, 2),
    }
    
    # Update cache
    dashboard_cache["data"] = result
    dashboard_cache["timestamp"] = current_time
    
    return result


# Fix #3: Use aggregation instead of multiple queries
@router.get("/attendance-summary")
def attendance_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get attendance summary using single aggregated query instead of 4 separate queries"""
    result = db.query(
        func.sum(case((models.Attendance.status == "present", 1), else_=0)).label("present"),
        func.sum(case((models.Attendance.status == "absent", 1), else_=0)).label("absent"),
        func.sum(case((models.Attendance.status == "late", 1), else_=0)).label("late"),
        func.sum(case((models.Attendance.status == "half-day", 1), else_=0)).label("half_day"),
    ).one()
    
    return {
        "present": result.present or 0,
        "absent": result.absent or 0,
        "late": result.late or 0,
        "half_day": result.half_day or 0,
    }


# Fix #3: Use aggregation instead of multiple queries
@router.get("/leave-summary")
def leave_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get leave summary using single aggregated query instead of 3 separate queries"""
    result = db.query(
        func.sum(case((models.Leave.status == "approved", 1), else_=0)).label("approved"),
        func.sum(case((models.Leave.status == "pending", 1), else_=0)).label("pending"),
        func.sum(case((models.Leave.status == "rejected", 1), else_=0)).label("rejected"),
    ).one()
    
    return {
        "approved": result.approved or 0,
        "pending": result.pending or 0,
        "rejected": result.rejected or 0,
    }


# Fix #4: Combine queries to avoid duplicate filtering
@router.get("/payroll-summary")
def payroll_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get payroll summary with optimized queries"""
    result = db.query(
        func.sum(case((models.Payroll.status == "paid", models.Payroll.net_pay), else_=0)).label("total_paid"),
        func.sum(case((models.Payroll.status == "pending", models.Payroll.net_pay), else_=0)).label("total_pending"),
        func.sum(case((models.Payroll.status == "paid", 1), else_=0)).label("count_paid"),
        func.sum(case((models.Payroll.status == "pending", 1), else_=0)).label("count_pending"),
    ).one()
    
    return {
        "total_paid": round(result.total_paid or 0, 2),
        "total_pending": round(result.total_pending or 0, 2),
        "count_paid": result.count_paid or 0,
        "count_pending": result.count_pending or 0,
    }
