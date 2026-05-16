import { useEffect, useState } from 'react'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [attend, setAttend] = useState(null)
  const [leave, setLeave]   = useState(null)
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/reports/dashboard'),
      API.get('/reports/attendance-summary'),
      API.get('/reports/leave-summary'),
      API.get('/reports/payroll-summary'),
    ]).then(([s, a, l, p]) => {
      setStats(s.data)
      setAttend(a.data)
      setLeave(l.data)
      setPayroll(p.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div>
      <p className="page-sub">Welcome back! Here's your HR overview.</p>

      {/* Main Stats */}
      <div className="stat-grid">


        <div className="stat-card"
            onClick={() => navigate('/employees')}
              style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#ede9fe' }}>👥</div>
          <div className="stat-info">
            <h3>{stats?.total_employees ?? 0}</h3>
            <p>Active Employees</p>
          </div>
        </div>
        <div className="stat-card"
            onClick={() => navigate('/departments')}
              style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#dbeafe' }}>🏢</div>
          <div className="stat-info">
            <h3>{stats?.total_departments ?? 0}</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="stat-card"
            onClick={() => navigate('/Pending Leaves')}
              style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#fef3c7' }}>📅</div>
          <div className="stat-info">
            <h3>{stats?.pending_leaves ?? 0}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>
        <div className="stat-card"
            onClick={() => navigate('/Payroll')}
              style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#dcfce7' }}>💰</div>
          <div className="stat-info">
            <h3>₱{(stats?.total_payroll_pending ?? 0).toLocaleString()}</h3>
            <p>Payroll Pending</p>
          </div>
        </div>
      </div>

      {/* Attendance + Leave + Payroll Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>📊 Attendance Summary</h3>
          {[
            { label: 'Present',  value: attend?.present,  color: '#22c55e' },
            { label: 'Absent',   value: attend?.absent,   color: '#ef4444' },
            { label: 'Late',     value: attend?.late,     color: '#f59e0b' },
            { label: 'Half Day', value: attend?.half_day, color: '#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#555', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.color }}>{item.value ?? 0}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>📅 Leave Summary</h3>
          {[
            { label: 'Approved', value: leave?.approved, color: '#22c55e' },
            { label: 'Pending',  value: leave?.pending,  color: '#f59e0b' },
            { label: 'Rejected', value: leave?.rejected, color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#555', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.color }}>{item.value ?? 0}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>💰 Payroll Summary</h3>
          {[
            { label: 'Total Paid',    value: `₱${(payroll?.total_paid ?? 0).toLocaleString()}`,    color: '#22c55e' },
            { label: 'Total Pending', value: `₱${(payroll?.total_pending ?? 0).toLocaleString()}`, color: '#f59e0b' },
            { label: 'Paid Records',    value: payroll?.count_paid ?? 0,    color: '#6c63ff' },
            { label: 'Pending Records', value: payroll?.count_pending ?? 0, color: '#888' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#555', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
