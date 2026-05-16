import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',     icon: '📊' },
  { path: '/employees',    label: 'Employees',     icon: '👥' },
  { path: '/departments',  label: 'Departments',   icon: '🏢' },
  { path: '/attendance',   label: 'Attendance',    icon: '🕐' },
  { path: '/leaves',       label: 'Leave Mgmt',    icon: '📅' },
  { path: '/for-approval', label: 'For Approval',  icon: '✅' },
  { path: '/payroll',      label: 'Payroll',       icon: '💰' },
  { path: '/reports',      label: 'Reports',       icon: '📈' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🏢 HR System</h2>
        <p>Human Resources</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 13, color: '#aab4c8', marginBottom: 10 }}>
          <div style={{ fontWeight: 600, color: '#fff' }}>{user?.username}</div>
          <div style={{ textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={logout}
          style={{ width: '100%' }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
