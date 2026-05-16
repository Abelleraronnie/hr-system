from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "employee"


class DepartmentCreate(BaseModel):
    name: str


class EmployeeCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department_id: Optional[int] = None
    date_hired: Optional[date] = None
    salary: Optional[float] = 0
    status: Optional[str] = "active"


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department_id: Optional[int] = None
    date_hired: Optional[date] = None
    salary: Optional[float] = None
    status: Optional[str] = None


class TimeIn(BaseModel):
    employee_id: int


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    time_in: Optional[datetime] = None
    time_out: Optional[datetime] = None
    status: str = "present"
    notes: Optional[str] = None


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    days: int
    reason: Optional[str] = None


class LeaveStatusUpdate(BaseModel):
    status: str  # approved, rejected


class PayrollCreate(BaseModel):
    employee_id: int
    period_start: date
    period_end: date
    basic_salary: float
    overtime_pay: float = 0
    deductions: float = 0
