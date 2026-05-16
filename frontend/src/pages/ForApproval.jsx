import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function ForApproval() {
  const [leaves, setLeaves]   = useState([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts]   = useState({ pending: 0, approved: 0, rejected: 0 })

  const load = async () => {
    setLoading(true)
    const [all, pending] = await Promise.all([
      API.get('/leaves/'),
      API.get('/leaves/', { params: { status: 'pending' } }),
    ])
    setLeaves(pending.data)
    const approved = all.data.filter(l => l.status === 'approved').length
    const rejected = all.data.filter(l => l.status === 'rejected').length
    setCounts({ pending: pending.data.length, approved, rejected })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    await API.put(`/leaves/${id}/status`, { status: 'approved' })
    load()
  }

  const reject = async (id) => {
    await API.put(`/leaves/${id}/status`, { status: 'rejected' })
    load()
  }

  return (
    <div>
      <p className="page-sub">Review and act on pending leave requests.</p>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
          <div className="stat-info">
            <h3>{counts.pending}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
          <div className="stat-info">
            <h3>{counts.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>❌</div>
          <div className="stat-info">
            <h3>{counts.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>
            📋 Pending Leave Requests
            {counts.pending > 0 && (
              <span style={{
                marginLeft: 10, background: '#ef4444', color: '#fff',
                borderRadius: 20, padding: '2px 10px', fontSize: 13
              }}>{counts.pending}</span>
            )}
          </h3>
          <button className="btn btn-outline btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            🎉
            <p>Walang pending na leave requests!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Filed On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 50,
                          background: '#ede9fe', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: '#6c63ff', fontSize: 14
                        }}>
                          {l.employee_name?.charAt(0)}
                        </div>
                        <strong>{l.employee_name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{l.leave_type}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {l.start_date} → {l.end_date}
                    </td>
                    <td>
                      <span className="badge badge-warning">{l.days} day{l.days > 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ maxWidth: 180, fontSize: 13, color: '#666' }}>
                      {l.reason || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#999' }}>
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('en-PH') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => approve(l.id)}
                          title="Approve"
                        >
                          ✅ Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => reject(l.id)}
                          title="Reject"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
