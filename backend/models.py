from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="employee", index=True)  # admin, hr, employee
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    employee = relationship("Employee", back_populates="user", uselist=False)
    
    __table_args__ = (
        Index('ix_users_created_at', 'created_at'),
    )


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    employees = relationship("Employee", back_populates="department")
    
    __table_args__ = (
        Index('ix_departments_name', 'name'),
    )


class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    position = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    date_hired = Column(Date, index=True)
    salary = Column(Float, default=0)
    status = Column(String(20), default="active", index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employee")
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    payrolls = relationship("Payroll", back_populates="employee")
    
    __table_args__ = (
        Index('ix_employees_employee_id', 'employee_id'),
        Index('ix_employees_status', 'status'),
        Index('ix_employees_department_id', 'department_id'),
        Index('ix_employees_email', 'email'),
    )


class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True)
    date = Column(Date, nullable=False, index=True)
    time_in = Column(DateTime, index=True)
    time_out = Column(DateTime)
    status = Column(String(20), default="present", index=True)  # present, absent, late, half-day
    notes = Column(Text)

    employee = relationship("Employee", back_populates="attendances")
    
    __table_args__ = (
        Index('ix_attendances_employee_date', 'employee_id', 'date'),
        Index('ix_attendances_date', 'date'),
        Index('ix_attendances_status', 'status'),
    )


class LeaveType(Base):
    __tablename__ = "leave_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    max_days = Column(Integer, default=5)
    leaves = relationship("Leave", back_populates="leave_type")
    
    __table_args__ = (
        Index('ix_leave_types_name', 'name'),
    )


class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"), index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False)
    days = Column(Integer)
    reason = Column(Text)
    status = Column(String(20), default="pending", index=True)  # pending, approved, rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    employee = relationship("Employee", back_populates="leaves")
    leave_type = relationship("LeaveType", back_populates="leaves")
    
    __table_args__ = (
        Index('ix_leaves_employee_id', 'employee_id'),
        Index('ix_leaves_status', 'status'),
        Index('ix_leaves_start_date', 'start_date'),
    )


class Payroll(Base):
    __tablename__ = "payrolls"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True)
    period_start = Column(Date, nullable=False, index=True)
    period_end = Column(Date, nullable=False)
    basic_salary = Column(Float, default=0)
    overtime_pay = Column(Float, default=0)
    deductions = Column(Float, default=0)
    net_pay = Column(Float, default=0)
    status = Column(String(20), default="pending", index=True)  # pending, paid
    created_at = Column(DateTime, server_default=func.now(), index=True)

    employee = relationship("Employee", back_populates="payrolls")
    
    __table_args__ = (
        Index('ix_payrolls_employee_id', 'employee_id'),
        Index('ix_payrolls_status', 'status'),
        Index('ix_payrolls_period', 'period_start', 'period_end'),
    )
