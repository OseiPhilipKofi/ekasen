import { useCallback } from 'react'
import api from '../lib/api'
import { useApiData } from '../hooks/useApiData'
import PageHeader from '../components/PageHeader'
import AdminNav from '../components/AdminNav'
import ActivityList from '../components/ActivityList'
export default function AdminPaymentsPage() { const load = useCallback(() => api.get('/admin/payments').then((res) => res.data.payments || []), []); const { data: payments } = useApiData(load, []); return <section className="section dashboard"><AdminNav /><PageHeader eyebrow="Admin · payments" title="Payment history." description="Review successful, pending, and failed Paystack records across teacher accounts." /><div className="table-card"><ActivityList rows={payments} empty="No payment records are available yet." /></div></section> }
