import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emp, setEmp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get(`/employees/${id}`)
      .then(res => setEmp(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading profile...</div>
  if (!emp) return <div className="loading">Employee not found.</div>

  return (
    <div>
      {/* Back button */}
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/employees')}
        style={{ marginBottom: 20 }}
      >
        ← Back to Employees
      </button>

      {/* Profile Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#6c63ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 32, color: '#fff', fontWeight: 700,
          flexShrink: 0
        }}>
          {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{emp.first_name} {emp.last_name}</h2>
          <p style={{ color: '#888', marginTop: 4 }}>{emp.position || '—'}</p>
          <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-gray'}`}
            style={{ marginTop: 8, display: 'inline-block' }}>
            {emp.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

        {/* Personal Info */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>👤 Personal Information</h3>
          {[
            { label: 'Employee ID', value: emp.employee_id },
            { label: 'Email',       value: emp.email },
            { label: 'Phone',       value: emp.phone },
            { label: 'Date Hired',  value: emp.date_hired },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{item.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Work Info */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>🏢 Work Information</h3>
          {[
            { label: 'Department', value: emp.department },
            { label: 'Position',   value: emp.position },
            { label: 'Salary',     value: emp.salary ? `₱${emp.salary.toLocaleString()}` : '—' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{item.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>📍 Address</h3>
          {[
            { label: 'Street',   value: emp.street },
            { label: 'Barangay', value: emp.barangay },
            { label: 'City',     value: emp.city },
            { label: 'Province', value: emp.province },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888', fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{item.value || '—'}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
