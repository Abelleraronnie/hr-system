-- ============================================
-- HR System Database Setup
-- Run this in phpMyAdmin or MySQL Workbench
-- ============================================

CREATE DATABASE IF NOT EXISTS hr_system;
USE hr_system;

-- ⚠️ Tables are auto-created by FastAPI (SQLAlchemy)
-- Run this AFTER starting the backend at least once.

-- ── Default Admin User ──
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (username, email, hashed_password, role, is_active)
VALUES (
  'admin',
  'admin@hrsystem.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGiuBp9V5VTzfGkFSjYkEW.GR9.',
  'admin',
  1
) ON DUPLICATE KEY UPDATE username=username;

-- ── Default Departments ──
INSERT INTO departments (name) VALUES
  ('Human Resources'),
  ('Engineering'),
  ('Finance'),
  ('Marketing'),
  ('Operations')
ON DUPLICATE KEY UPDATE name=name;

-- ── Default Leave Types ──
INSERT INTO leave_types (name, max_days) VALUES
  ('Sick Leave', 10),
  ('Vacation Leave', 15),
  ('Emergency Leave', 3),
  ('Maternity Leave', 105),
  ('Paternity Leave', 7)
ON DUPLICATE KEY UPDATE name=name;

-- ── Sample Employees ──
INSERT INTO employees (employee_id, first_name, last_name, email, phone, position, department_id, date_hired, salary, status)
VALUES
  ('EMP-001', 'Juan',   'Dela Cruz', 'juan@company.com',   '09171234567', 'HR Manager',       1, '2022-01-15', 45000, 'active'),
  ('EMP-002', 'Maria',  'Santos',    'maria@company.com',  '09181234567', 'Senior Developer', 2, '2021-06-01', 65000, 'active'),
  ('EMP-003', 'Pedro',  'Reyes',     'pedro@company.com',  '09191234567', 'Accountant',       3, '2023-03-10', 40000, 'active'),
  ('EMP-004', 'Ana',    'Gomez',     'ana@company.com',    '09201234567', 'Marketing Lead',   4, '2022-09-20', 50000, 'active'),
  ('EMP-005', 'Carlos', 'Lopez',     'carlos@company.com', '09211234567', 'Operations Head',  5, '2020-11-05', 55000, 'active')
ON DUPLICATE KEY UPDATE employee_id=employee_id;

SELECT '✅ HR System database seeded successfully!' AS result;
