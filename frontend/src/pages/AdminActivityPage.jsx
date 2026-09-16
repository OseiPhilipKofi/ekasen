import { useCallback } from 'react'
import api from '../lib/api'
import { useApiData } from '../hooks/useApiData'
import PageHeader from '../components/PageHeader'
import AdminNav from '../components/AdminNav'
export default function AdminActivityPage() { const load = useCallback(() => api.get('/admin/activities').then((res) => res.data.activities || []), []); const { data: activities } = useApiData(load, []); return <section className="section dashboard"><AdminNav /><PageHeader eyebrow="Admin · audit trail" title="Page and account activity." description="See sign-ins, profile changes, registrations, payments, and content updates." /><div className="table-card">{activities.length ? activities.map((item) => <div className="activity-row" key={item.id}><div><strong>{item.action}</strong><small>{item.email || 'System'} · {item.created_at}</small></div><b>{item.entity_type || 'activity'}</b></div>) : <div className="empty-state">No audit activity recorded yet.</div>}</div></section> }
