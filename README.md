# 🏢 HR System — FastAPI + React + MySQL

Full HR System with Employee Management, Attendance, Leave, Payroll, Reports & Dashboard.

---

## 📁 Project Structure

```
hr-system/
├── backend/                  ← FastAPI (Python)
│   ├── main.py               ← App entry point
│   ├── database.py           ← MySQL connection
│   ├── models.py             ← Database tables
│   ├── schemas.py            ← Request/response validation
│   ├── auth.py               ← JWT authentication
│   ├── .env                  ← Environment variables
│   ├── requirements.txt      ← Python dependencies
│   └── routers/
│       ├── auth.py           ← Login, register
│       ├── employees.py      ← Employee CRUD + Departments
│       ├── attendance.py     ← Time in/out, manual entry
│       ├── leaves.py         ← Leave requests & approval
│       ├── payroll.py        ← Payroll creation & payment
│       └── reports.py        ← Dashboard & analytics
│
├── frontend/                 ← React (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx           ← Routing
│       ├── main.jsx          ← Entry point
│       ├── index.css         ← Global styles
│       ├── api/axios.js      ← API client
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Sidebar.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Employees.jsx
│           ├── Attendance.jsx
│           ├── Leaves.jsx
│           ├── Payroll.jsx
│           └── Reports.jsx
│
└── database_seed.sql         ← Initial data (admin user, departments, etc.)
```

---

## 🚀 Setup Instructions

### Step 1 — Install Laragon
Download and install from https://laragon.org/
Start **Apache** and **MySQL** services.

---

### Step 2 — Setup Database
1. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Create a new database: `hr_system`
3. **Start the backend first** (Step 3) to auto-create tables
4. Then go back to phpMyAdmin → select `hr_system` → SQL tab
5. Paste and run the contents of `database_seed.sql`

---

### Step 3 — Setup Backend (FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs at:     http://localhost:8000/docs

---

### Step 4 — Setup Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔐 Default Login

| Field    | Value     |
|----------|-----------|
| Username | `admin`   |
| Password | `admin123`|
| Role     | Admin     |

---

## ✅ Features

| Module              | Features                                      |
|---------------------|-----------------------------------------------|
| 🔐 Auth             | Login, JWT tokens, role-based access          |
| 👥 Employees        | Add, edit, delete employees + departments     |
| 🕐 Attendance       | Time in/out, manual entry, date filter        |
| 📅 Leave Management | File requests, approve/reject, filter by status|
| 💰 Payroll          | Create payroll, net pay preview, mark as paid |
| 📊 Reports          | Dashboard stats, attendance/leave/payroll charts|

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, Vite, Axios   |
| Backend  | Python, FastAPI, SQLAlchemy |
| Database | MySQL (via Laragon)     |
| Auth     | JWT (python-jose)       |

---

## ⚙️ Environment Variables (backend/.env)

```env
DATABASE_URL=mysql+pymysql://root:@localhost:3306/hr_system
SECRET_KEY=hr-system-super-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

> If your MySQL has a password, update `root:@` to `root:yourpassword@`
