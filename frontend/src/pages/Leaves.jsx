import { useEffect, useState } from 'react'
import API from '../api/axios'

const EMPTY = { employee_id: '', leave_type_id: '', start_date: '', end_date: '', days: '', reason: '' }

export default function Leaves() {
  const [leaves, setLeaves]       = useState([])
  const [employees, setEmployees] = useState([])
  const [types, setTypes]         = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const params = {}
    if (statusFilter) params.status = statusFilter
    const [l, e, t] = await Promise.all([
      API.get('/leaves/', { params }),
      API.get('/employees/'),
      API.get('/leaves/types'),
    ])
    setLeaves(l.data)
    setEmployees(e.data)
    setTypes(t.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter])

  const save = async () => {
    await API.post('/leaves/', { ...form, employee_id: Number(form.employee_id), leave_type_id: Number(form.leave_type_id), days: Number(form.days) })
    setModal(false)
    load()
  }

  const updateStatus = async (id, status) => {
    await API.put(`/leaves/${id}/status`, { status })
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this leave request?')) return
    await API.delete(`/leaves/${id}`)
    load()
  }

  const statusBadge = (s) => {
    const map = { approved: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <div>
      <div className="toolbar">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ File Leave</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading leaves...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">📅<p>No leave requests found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.employee_name}</strong></td>
                    <td>{l.leave_type}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td>{l.days}</td>
                    <td style={{ maxWidth: 160, fontSize: 13, color: '#666' }}>{l.reason || '—'}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {l.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(l.id, 'approved')}>✅</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(l.id, 'rejected')}>❌</button>
                        </>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(l.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📅 File Leave Request</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">— Select —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Leave Type</label>
                <select value={form.leave_type_id} onChange={e => setForm({ ...form, leave_type_id: e.target.value })}>
                  <option value="">— Select —</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} (max {t.max_days} days)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Number of Days</label>
                <input type="number" min="1" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Reason</label>
                <textarea rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  style={{ padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>📤 Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
