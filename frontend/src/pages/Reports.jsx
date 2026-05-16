import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function Reports() {
  const [stats,    setStats]    = useState(null)
  const [attend,   setAttend]   = useState(null)
  const [leave,    setLeave]    = useState(null)
  const [payroll,  setPayroll]  = useState(null)
  const [loading,  setLoading]  = useState(true)

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

  if (loading) return <div className="loading">Loading reports...</div>

  const Bar = ({ value, max, color }) => (
    <div style={{ background: '#f0f0f0', borderRadius: 6, height: 10, marginTop: 6 }}>
      <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, height: '100%', borderRadius: 6, transition: 'width 0.5s' }} />
    </div>
  )

  const attendTotal = (attend?.present || 0) + (attend?.absent || 0) + (attend?.late || 0) + (attend?.half_day || 0)
  const leaveTotal  = (leave?.approved || 0) + (leave?.pending || 0) + (leave?.rejected || 0)
  const payTotal    = (payroll?.total_paid || 0) + (payroll?.total_pending || 0)

  return (
    <div>
      <p className="page-sub">Overview of HR metrics and analytics.</p>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>👥</div>
          <div className="stat-info"><h3>{stats?.total_employees}</h3><p>Active Employees</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>🏢</div>
          <div className="stat-info"><h3>{stats?.total_departments}</h3><p>Departments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>💵</div>
          <div className="stat-info"><h3>₱{(payroll?.total_paid || 0).toLocaleString()}</h3><p>Total Payroll Released</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
          <div className="stat-info"><h3>₱{(payroll?.total_pending || 0).toLocaleString()}</h3><p>Payroll Pending</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Attendance */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📊 Attendance Breakdown</h3>
          {[
            { label: 'Present',  value: attend?.present,  color: '#22c55e' },
            { label: 'Absent',   value: attend?.absent,   color: '#ef4444' },
            { label: 'Late',     value: attend?.late,     color: '#f59e0b' },
            { label: 'Half Day', value: attend?.half_day, color: '#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>{item.label}</span>
                <strong style={{ color: item.color }}>{item.value ?? 0} <span style={{ color: '#aaa', fontWeight: 400 }}>/ {attendTotal}</span></strong>
              </div>
              <Bar value={item.value || 0} max={attendTotal} color={item.color} />
            </div>
          ))}
        </div>

        {/* Leave */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📅 Leave Requests</h3>
          {[
            { label: 'Approved', value: leave?.approved, color: '#22c55e' },
            { label: 'Pending',  value: leave?.pending,  color: '#f59e0b' },
            { label: 'Rejected', value: leave?.rejected, color: '#ef4444' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>{item.label}</span>
                <strong style={{ color: item.color }}>{item.value ?? 0} <span style={{ color: '#aaa', fontWeight: 400 }}>/ {leaveTotal}</span></strong>
              </div>
              <Bar value={item.value || 0} max={leaveTotal} color={item.color} />
            </div>
          ))}
        </div>

        {/* Payroll */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>💰 Payroll Status</h3>
          {[
            { label: 'Total Paid',    value: `₱${(payroll?.total_paid || 0).toLocaleString()}`,    raw: payroll?.total_paid || 0, color: '#22c55e' },
            { label: 'Total Pending', value: `₱${(payroll?.total_pending || 0).toLocaleString()}`, raw: payroll?.total_pending || 0, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#555' }}>{item.label}</span>
                <strong style={{ color: item.color }}>{item.value}</strong>
              </div>
              <Bar value={item.raw} max={payTotal} color={item.color} />
            </div>
          ))}
          <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8f9fc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#888' }}>Records: <strong style={{ color: '#22c55e' }}>{payroll?.count_paid} paid</strong> · <strong style={{ color: '#f59e0b' }}>{payroll?.count_pending} pending</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
