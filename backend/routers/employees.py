from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter()


def emp_to_dict(emp):
    return {
        "id": emp.id,
        "employee_id": emp.employee_id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "full_name": f"{emp.first_name} {emp.last_name}",
        "email": emp.email,
        "phone": emp.phone,
        "position": emp.position,
        "department": emp.department.name if emp.department else None,
        "department_id": emp.department_id,
        "date_hired": emp.date_hired,
        "salary": emp.salary,
        "status": emp.status,
        "created_at": emp.created_at,
    }


@router.get("/")
def get_employees(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    employees = db.query(models.Employee).all()
    return [emp_to_dict(e) for e in employees]


@router.post("/", status_code=201)
def create_employee(data: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if db.query(models.Employee).filter(models.Employee.employee_id == data.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    emp = models.Employee(**data.dict())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return {"message": "Employee created successfully", "id": emp.id}


@router.get("/{emp_id}")
def get_employee(emp_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp_to_dict(emp)


@router.put("/{emp_id}")
def update_employee(emp_id: int, data: schemas.EmployeeUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(emp, key, value)
    db.commit()
    return {"message": "Employee updated successfully"}


@router.delete("/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"message": "Employee deleted successfully"}


# --- Departments ---
@router.get("/departments/all")
def get_departments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    depts = db.query(models.Department).all()
    return [{"id": d.id, "name": d.name, "count": len(d.employees)} for d in depts]


@router.post("/departments/create", status_code=201)
def create_department(data: schemas.DepartmentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if db.query(models.Department).filter(models.Department.name == data.name).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    dept = models.Department(name=data.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"message": "Department created", "id": dept.id}
