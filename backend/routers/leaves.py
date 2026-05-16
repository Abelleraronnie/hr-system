from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter()


@router.get("/types")
def get_leave_types(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    types = db.query(models.LeaveType).all()
    return [{"id": t.id, "name": t.name, "max_days": t.max_days} for t in types]


@router.post("/types", status_code=201)
def create_leave_type(name: str, max_days: int = 5, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    lt = models.LeaveType(name=name, max_days=max_days)
    db.add(lt)
    db.commit()
    return {"message": "Leave type created"}


@router.get("/")
def get_leaves(
    status: str = None,
    employee_id: int = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(models.Leave)
    if status:
        query = query.filter(models.Leave.status == status)
    if employee_id:
        query = query.filter(models.Leave.employee_id == employee_id)
    leaves = query.order_by(models.Leave.created_at.desc()).all()
    result = []
    for l in leaves:
        emp = l.employee
        result.append({
            "id": l.id,
            "employee_id": l.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "leave_type": l.leave_type.name if l.leave_type else "",
            "leave_type_id": l.leave_type_id,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "days": l.days,
            "reason": l.reason,
            "status": l.status,
            "created_at": l.created_at,
        })
    return result


@router.post("/", status_code=201)
def create_leave(data: schemas.LeaveCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    leave = models.Leave(**data.dict())
    db.add(leave)
    db.commit()
    return {"message": "Leave request submitted successfully"}


@router.put("/{leave_id}/status")
def update_leave_status(leave_id: int, data: schemas.LeaveStatusUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = data.status
    leave.approved_by = current_user.id
    db.commit()
    return {"message": f"Leave {data.status} successfully"}


@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(leave)
    db.commit()
    return {"message": "Leave deleted"}
