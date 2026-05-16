import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import Departments from './pages/Departments'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import ForApproval from './pages/ForApproval'
import Payroll from './pages/Payroll'
import Reports from './pages/Reports'



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="employees"    element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="departments"  element={<Departments />} />
            <Route path="attendance"   element={<Attendance />} />
            <Route path="leaves"       element={<Leaves />} />
            <Route path="for-approval" element={<ForApproval />} />
            <Route path="payroll"      element={<Payroll />} />
            <Route path="reports"      element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
