import { useEffect, useState } from 'react'
import API from '../api/axios'

const EMPTY = { employee_id: '', period_start: '', period_end: '', basic_salary: '', overtime_pay: '0', deductions: '0' }

export default function Payroll() {
  const [payrolls, setPayrolls]   = useState([])
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [p, e] = await Promise.all([API.get('/payroll/'), API.get('/employees/')])
    setPayrolls(p.data)
    setEmployees(e.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    await API.post('/payroll/', {
      employee_id:  Number(form.employee_id),
      period_start: form.period_start,
      period_end:   form.period_end,
      basic_salary: Number(form.basic_salary),
      overtime_pay: Number(form.overtime_pay || 0),
      deductions:   Number(form.deductions || 0),
    })
    setModal(false)
    load()
  }

  const markPaid = async (id) => {
    await API.put(`/payroll/${id}/pay`)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete payroll record?')) return
    await API.delete(`/payroll/${id}`)
    load()
  }

  const netPreview = () => {
    const b = Number(form.basic_salary || 0)
    const o = Number(form.overtime_pay || 0)
    const d = Number(form.deductions || 0)
    return (b + o - d).toLocaleString()
  }

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Create Payroll</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading payroll records...</div>
        ) : payrolls.length === 0 ? (
          <div className="empty-state">💰<p>No payroll records found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Period</th><th>Basic</th><th>OT Pay</th>
                  <th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.employee_name}</strong></td>
                    <td style={{ fontSize: 13 }}>{p.period_start} → {p.period_end}</td>
                    <td>₱{p.basic_salary.toLocaleString()}</td>
                    <td>₱{p.overtime_pay.toLocaleString()}</td>
                    <td style={{ color: '#ef4444' }}>-₱{p.deductions.toLocaleString()}</td>
                    <td><strong style={{ color: '#22c55e' }}>₱{p.net_pay.toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      {p.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(p.id)}>✅ Pay</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>🗑️</button>
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
              <h2>💰 Create Payroll</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Employee</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">— Select Employee —</option>
                  {employees.filter(e => e.status === 'active').map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} — ₱{(e.salary || 0).toLocaleString()}/mo</option>
                  ))}
                </select>
              </div>
              {[
                { key: 'period_start', label: 'Period Start', type: 'date' },
                { key: 'period_end',   label: 'Period End',   type: 'date' },
                { key: 'basic_salary', label: 'Basic Salary', type: 'number' },
                { key: 'overtime_pay', label: 'Overtime Pay', type: 'number' },
                { key: 'deductions',   label: 'Deductions',   type: 'number' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#555' }}>Net Pay Preview: </span>
              <strong style={{ fontSize: 18, color: '#16a34a' }}>₱{netPreview()}</strong>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>💾 Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
