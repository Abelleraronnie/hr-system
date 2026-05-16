from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_payrolls(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payrolls = db.query(models.Payroll).order_by(models.Payroll.created_at.desc()).all()
    result = []
    for p in payrolls:
        emp = p.employee
        result.append({
            "id": p.id,
            "employee_id": p.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "period_start": p.period_start,
            "period_end": p.period_end,
            "basic_salary": p.basic_salary,
            "overtime_pay": p.overtime_pay,
            "deductions": p.deductions,
            "net_pay": p.net_pay,
            "status": p.status,
            "created_at": p.created_at,
        })
    return result


@router.post("/", status_code=201)
def create_payroll(data: schemas.PayrollCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    net_pay = data.basic_salary + data.overtime_pay - data.deductions
    payroll = models.Payroll(**data.dict(), net_pay=net_pay)
    db.add(payroll)
    db.commit()
    return {"message": "Payroll created successfully"}


@router.put("/{payroll_id}/pay")
def mark_paid(payroll_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    payroll.status = "paid"
    db.commit()
    return {"message": "Payroll marked as paid"}


@router.delete("/{payroll_id}")
def delete_payroll(payroll_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    db.delete(payroll)
    db.commit()
    return {"message": "Payroll deleted"}
