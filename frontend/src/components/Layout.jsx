import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/employees':    'Employee Management',
  '/departments':  'Department Management',
  '/attendance':   'Attendance Tracking',
  '/leaves':       'Leave Management',
  '/for-approval': 'For Approval',
  '/payroll':      'Payroll',
  '/reports':      'Reports & Analytics',
}

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'HR System'

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="topbar-right">
            <span style={{ fontSize: 13, color: '#888' }}>
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="user-badge">👤 {user?.username}</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
