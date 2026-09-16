import { useCallback, useState } from 'react'
import { Users, FileText, CreditCard, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useApiData } from '../hooks/useApiData'
import { previewImage } from '../components/GlobalImagePreview'
import PageHeader from '../components/PageHeader'
import AdminNav from '../components/AdminNav'

export default function AdminMembersPage() {
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [teacherDetails, setTeacherDetails] = useState(null)
  const [payments, setPayments] = useState([])

  const load = useCallback(() =>
    api.get('/admin/users').then((res) => res.data.users || []),
    []
  )
  const { data: users, setData: setUsers } = useApiData(load, [])

  const filteredUsers = users.filter(u => filter === 'all' || u.role === filter)

  const selectTeacher = async (id) => {
    try {
      const [tRes, pRes] = await Promise.all([
        api.get(`/admin/teachers/${id}`),
        api.get(`/admin/payments/${id}`)
      ])
      setTeacherDetails(tRes.data.teacher)
      setPayments(pRes.data.payments || [])
      setSelectedId(id)
    } catch (error) {
      toast.error('Could not fetch teacher details.')
    }
  }

  const deleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${name} from the system?`)) return
    try {
      await api.delete(`/admin/teachers/${id}`)
      toast.success('Teacher removed successfully.')
      setUsers(users.filter(u => u.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setTeacherDetails(null)
      }
    } catch (error) {
      toast.error('Failed to remove teacher.')
    }
  }

  return (
    <section className="section dashboard">
      <AdminNav />
      <PageHeader
        eyebrow="Admin · users"
        title="Account Management"
        description="Manage all user accounts, roles, and system access."
      />

      {!selectedId ? (
        <>
          <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn active' : 'btn'}>All</button>
            <button onClick={() => setFilter('teacher')} className={filter === 'teacher' ? 'btn active' : 'btn'}>Teachers</button>
            <button onClick={() => setFilter('admin')} className={filter === 'admin' ? 'btn active' : 'btn'}>Admins</button>
          </div>

          <div className="table-card">
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <div className="activity-row" key={user.id} style={{ cursor: 'pointer' }} onClick={() => user.role === 'teacher' && selectTeacher(user.id)}>
                  <span className="activity-icon">
                    <Users size={17} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{user.name}</strong>
                    <small>{user.email} · Role: {user.role} · Status: {user.status}</small>
                  </div>
                  {user.role === 'teacher' && <b style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user.verification_status || 'pending'}</b>}
                </div>
              ))
            ) : (
              <div className="empty-state">No user accounts found.</div>
            )}
          </div>
        </>
      ) : (
        <div className="teacher-detail-view">
          <button className="button secondary compact" onClick={() => setSelectedId(null)} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to list
          </button>

          {teacherDetails && (
            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="profile-card form-card" style={{ textAlign: 'center' }}>
                <img
                  src={teacherDetails.profile_photo_path ? `/api/${teacherDetails.profile_photo_path}` : '/assets/avatar.png'}
                  alt={teacherDetails.name}
                  onClick={() => previewImage(teacherDetails.profile_photo_path ? `/api/${teacherDetails.profile_photo_path}` : '/assets/avatar.png')}
                  style={{ width: '120px', height: '120px', minWidth: '120px', minHeight: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid #eee', cursor: 'pointer' }}
                />
                <h3>{teacherDetails.name}</h3>
                <p>{teacherDetails.email}</p>
                <div className="status-badge" style={{ padding: '0.2rem 0.8rem', borderRadius: '1rem', background: teacherDetails.status === 'active' ? '#dcfce7' : '#fee2e2', color: teacherDetails.status === 'active' ? '#166534' : '#991b1b', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '1rem' }}>
                  {teacherDetails.status.toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <p><strong>Phone:</strong> {teacherDetails.phone || 'N/A'}</p>
                  <p><strong>School:</strong> {teacherDetails.school_name || 'N/A'}</p>
                  <p><strong>Staff ID:</strong> {teacherDetails.staff_id || 'N/A'}</p>
                  <p><strong>National ID:</strong> {teacherDetails.national_id || 'N/A'}</p>
                </div>
                <button className="button danger full" style={{ marginTop: '1.5rem' }} onClick={() => deleteTeacher(teacherDetails.id, teacherDetails.name)}>Remove Teacher</button>
              </div>

              <div className="details-main">
                <div className="table-card">
                  <div className="table-heading"><h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Identity Documents</h3></div>
                  {teacherDetails.documents?.length ? (
                    teacherDetails.documents.map((doc, i) => (
                      <div className="activity-row" key={i} style={{ justifyContent: 'space-between' }}>
                        <span>{doc.document_type} ({doc.original_name})</span>
                        <a href={`/api/${doc.file_path}`} target="_blank" rel="noreferrer" className="link-small">View Document</a>
                      </div>
                    ))
                  ) : <div className="empty-state">No documents uploaded.</div>}
                </div>

                <div className="table-card" style={{ marginTop: '2rem' }}>
                  <div className="table-heading"><h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={18} /> Payment History</h3></div>
                  {payments.length ? (
                    payments.map((p, i) => (
                      <div className="activity-row" key={i} style={{ justifyContent: 'space-between' }}>
                        <div>
                          <strong>{p.reference}</strong>
                          <small style={{ marginLeft: '0.5rem' }}>{new Date(p.created_at).toLocaleDateString()}</small>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <b style={{ color: p.status === 'success' ? '#166534' : '#991b1b' }}>{p.status}</b>
                          <strong>GH₵ {Number(p.amount).toLocaleString()}</strong>
                        </div>
                      </div>
                    ))
                  ) : <div className="empty-state">No payments found for this teacher.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
