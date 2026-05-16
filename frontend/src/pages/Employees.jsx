import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const EMPTY = { employee_id: '', first_name: '', last_name: '', email: '', phone: '', position: '', department_id: '', date_hired: '', salary: '', street: '', barangay: '', city: '', province: '', status: 'active' }

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [deptModal, setDeptModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [deptName, setDeptName] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [e, d] = await Promise.all([API.get('/employees/'), API.get('/employees/departments/all')])
    setEmployees(e.data)
    setDepartments(d.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (emp) => { setForm({ ...emp, department_id: emp.department_id || '' }); setEditing(emp.id); setModal(true) }

  const save = async () => {
    const data = { ...form, salary: Number(form.salary), department_id: form.department_id ? Number(form.department_id) : null }
    if (editing) await API.put(`/employees/${editing}`, data)
    else await API.post('/employees/', data)
    setModal(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this employee?')) return
    await API.delete(`/employees/${id}`)
    load()
  }

  const addDept = async () => {
    await API.post('/employees/departments/create', { name: deptName })
    setDeptName('')
    setDeptModal(false)
    load()
  }

  const filtered = employees.filter(e => {
  const matchSearch = `${e.first_name} ${e.last_name} ${e.employee_id} ${e.position}`
    .toLowerCase().includes(search.toLowerCase())
  const matchDept = deptFilter === '' || e.department === deptFilter
  return matchSearch && matchDept
})

  return (
    <div>
      <div className="toolbar">
        <input placeholder="🔍 Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
       
          <select 
            value={deptFilter} 
            onChange={e => setDeptFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14 }}
          >
            <option value="">All Departments</option>
              {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          <div className="toolbar-right">
          <button className="btn btn-outline btn-sm" onClick={() => setDeptModal(true)}>+ Department</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">👥<p>No employees found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Position</th><th>Department</th>
                  <th>Date Hired</th><th>Salary</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.employee_id}</strong></td>
                    <td onClick={() => navigate(`/employees/${emp.id}`)} style={{ cursor: 'pointer' }}>
                      <div style={{ fontWeight: 500, color: '#6c63ff' }}>
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#888' }}>{emp.email}</div>
                    </td>
                    <td>{emp.position || '—'}</td>
                    <td>{emp.department || '—'}</td>
                    <td>{emp.date_hired || '—'}</td>
                    <td>₱{(emp.salary || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(emp)} style={{ marginRight: 6 }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(emp.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Employee' : '➕ Add Employee'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-grid">
              {[
                { key: 'employee_id', label: 'Employee ID', type: 'text' },
                { key: 'first_name',  label: 'First Name',  type: 'text' },
                { key: 'last_name',   label: 'Last Name',   type: 'text' },
                { key: 'email',       label: 'Email',       type: 'email' },
                { key: 'phone',       label: 'Phone',       type: 'text' },
                { key: 'position',    label: 'Position',    type: 'text' },
                { key: 'date_hired',  label: 'Date Hired',  type: 'date' },
                { key: 'street',   label: 'Street',   type: 'text' },
                { key: 'barangay', label: 'Barangay', type: 'text' },
                { key: 'city',     label: 'City',     type: 'text' },
                { key: 'province', label: 'Province', type: 'text' },
                { key: 'salary',      label: 'Salary',      type: 'number' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label>Department</label>
                <select value={form.department_id || ''} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">— Select —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>💾 Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {deptModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2>🏢 Add Department</h2>
              <button className="modal-close" onClick={() => setDeptModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Department Name</label>
              <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeptModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addDept}>➕ Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
