from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, employees, attendance, leaves, payroll, reports

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HR System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(employees.router,  prefix="/api/employees",  tags=["Employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(leaves.router,     prefix="/api/leaves",     tags=["Leaves"])
app.include_router(payroll.router,    prefix="/api/payroll",    tags=["Payroll"])
app.include_router(reports.router,    prefix="/api/reports",    tags=["Reports"])


@app.get("/")
def root():
    return {"message": "✅ HR System API is running!"}
