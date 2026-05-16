import { useEffect, useState } from 'react'
import API from '../api/axios'

const EMPTY = { employee_id: '', date: '', time_in: '', time_out: '', status: 'present', notes: '' }

export default function Attendance() {
  const [records, setRecords]     = useState([])
  const [employees, setEmployees] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [modal, setModal]   = useState(false)
  const [timeInModal, setTimeInModal] = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [selEmp, setSelEmp] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const params = {}
    if (dateFilter) params.date_filter = dateFilter
    const [r, e] = await Promise.all([API.get('/attendance/', { params }), API.get('/employees/')])
    setRecords(r.data)
    setEmployees(e.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [dateFilter])

  const doTimeIn = async () => {
    if (!selEmp) return alert('Select an employee')
    try {
      await API.post('/attendance/time-in', { employee_id: Number(selEmp) })
      setTimeInModal(false)
      setSelEmp('')
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error')
    }
  }

  const doTimeOut = async (id) => {
    try {
      await API.put(`/attendance/time-out/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error')
    }
  }

  const saveManual = async () => {
    await API.post('/attendance/manual', { ...form, employee_id: Number(form.employee_id) })
    setModal(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete record?')) return
    await API.delete(`/attendance/${id}`)
    load()
  }

  const statusBadge = (s) => {
    const map = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', 'half-day': 'badge-info' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <div>
      <div className="toolbar">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        {dateFilter && <button className="btn btn-outline btn-sm" onClick={() => setDateFilter('')}>Clear</button>}
        <div className="toolbar-right">
          <button className="btn btn-success" onClick={() => setTimeInModal(true)}>🟢 Time In</button>
          <button className="btn btn-outline" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Manual Entry</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">🕐<p>No attendance records found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Date</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.employee_name}</strong></td>
                    <td>{r.date}</td>
                    <td>{r.time_in ? new Date(r.time_in).toLocaleTimeString() : '—'}</td>
                    <td>{r.time_out ? new Date(r.time_out).toLocaleTimeString() : (
                      r.time_in && <button className="btn btn-warning btn-sm" onClick={() => doTimeOut(r.id)}>🔴 Time Out</button>
                    )}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 13, color: '#888' }}>{r.notes || '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Time In Modal */}
      {timeInModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2>🟢 Time In</h2>
              <button className="modal-close" onClick={() => setTimeInModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Select Employee</label>
              <select value={selEmp} onChange={e => setSelEmp(e.target.value)}>
                <option value="">— Select Employee —</option>
                {employees.filter(e => e.status === 'active').map(e => (
                  <option key={e.id} value={e.id}>{e.employee_id} — {e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setTimeInModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={doTimeIn}>✅ Confirm Time In</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>📝 Manual Attendance Entry</h2>
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
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time In</label>
                <input type="datetime-local" value={form.time_in} onChange={e => setForm({ ...form, time_in: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time Out</label>
                <input type="datetime-local" value={form.time_out} onChange={e => setForm({ ...form, time_out: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['present','absent','late','half-day'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveManual}>💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
