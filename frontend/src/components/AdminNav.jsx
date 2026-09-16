import { NavLink } from 'react-router-dom'
export default function AdminNav() {
  return <nav className="admin-nav"><NavLink to="/admin">Overview</NavLink><NavLink to="/admin/members">Teachers</NavLink><NavLink to="/admin/register">Register teacher</NavLink><NavLink to="/admin/payments">Payments</NavLink><NavLink to="/admin/activity">Activity</NavLink><NavLink to="/admin/content">Content</NavLink><NavLink to="/admin/plans">Plans</NavLink></nav>
}
