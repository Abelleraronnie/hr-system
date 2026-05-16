import { useEffect, useState } from 'react'
import API from '../api/axios'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await API.get('/employees/departments/all')
    setDepartments(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setName(''); setEditing(null); setModal(true) }
  const openEdit = (dept) => { setName(dept.name); setEditing(dept); setModal(true) }

  const save = async () => {
    if (!name.trim()) return alert('Enter department name')
    try {
      if (editing) {
        await API.put(`/employees/departments/${editing.id}`, { name })
      } else {
        await API.post('/employees/departments/create', { name })
      }
      setModal(false)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this department?')) return
    await API.delete(`/employees/departments/${id}`)
    load()
  }

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <input
          placeholder="🔍 Search departments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Department</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>🏢</div>
          <div className="stat-info">
            <h3>{departments.length}</h3>
            <p>Total Departments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>👥</div>
          <div className="stat-info">
            <h3>{departments.reduce((sum, d) => sum + (d.count || 0), 0)}</h3>
            <p>Total Employees</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading departments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">🏢<p>No departments found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Department Name</th>
                  <th>No. of Employees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept, idx) => (
                  <tr key={dept.id}>
                    <td style={{ color: '#888', fontSize: 13 }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: '#ede9fe', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>🏢</div>
                        <strong>{dept.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{dept.count || 0} employees</span>
                    </td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(dept)} style={{ marginRight: 6 }}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(dept.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Department' : '🏢 Add Department'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Department Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Engineering"
                onKeyDown={e => e.key === 'Enter' && save()}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}