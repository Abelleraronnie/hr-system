from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="employee")  # admin, hr, employee
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    employee = relationship("Employee", back_populates="user", uselist=False)


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True)
    phone = Column(String(20))
    position = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    date_hired = Column(Date)
    salary = Column(Float, default=0)
    status = Column(String(20), default="active")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employee")
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    payrolls = relationship("Payroll", back_populates="employee")


class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    time_in = Column(DateTime)
    time_out = Column(DateTime)
    status = Column(String(20), default="present")  # present, absent, late, half-day
    notes = Column(Text)

    employee = relationship("Employee", back_populates="attendances")


class LeaveType(Base):
    __tablename__ = "leave_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    max_days = Column(Integer, default=5)
    leaves = relationship("Leave", back_populates="leave_type")


class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Integer)
    reason = Column(Text)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="leaves")
    leave_type = relationship("LeaveType", back_populates="leaves")


class Payroll(Base):
    __tablename__ = "payrolls"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    basic_salary = Column(Float, default=0)
    overtime_pay = Column(Float, default=0)
    deductions = Column(Float, default=0)
    net_pay = Column(Float, default=0)
    status = Column(String(20), default="pending")  # pending, paid
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="payrolls")
