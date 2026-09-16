import { CircleDollarSign } from 'lucide-react'

export default function ActivityList({ rows, empty = 'No activity found yet.' }) {
  if (!rows.length) return <div className="empty-state">{empty}</div>
  return <div className="activity-list">{rows.map((row) => <div className="activity-row" key={row.id}><span className="activity-icon"><CircleDollarSign size={17} /></span><div><strong>{row.description || 'Contribution'}</strong><small>{row.created_at} · {row.status || 'recorded'}</small></div><b className="positive">GH₵ {Number(row.amount || 0).toLocaleString()}</b></div>)}</div>
}
