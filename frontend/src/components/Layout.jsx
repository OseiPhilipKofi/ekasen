import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, UserRound } from 'lucide-react'

export default function Layout({ user, onLogout, children }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/plans', 'Plans'],
    ['/contact', 'Contact']
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">T</span>
          <span>TiFund</span>
        </Link>

        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'nav open' : 'nav'}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}

          {user && (
            <NavLink to="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
          )}

          {user && (
            <NavLink to="/account" onClick={() => setOpen(false)}>
              Account
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}

          {user ? (
            <button className="nav-action" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link className="nav-action" to="/login" onClick={() => setOpen(false)}>
              <UserRound size={16} /> Sign in
            </Link>
          )}
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <div>
          <strong>TiFund</strong>
          <span>Building secure futures for Ghanaian teachers.</span>
        </div>
        <span>
          © {new Date().getFullYear()} Teacher Investment Fund · Kumasi, Ghana
        </span>
      </footer>
    </div>
  )
}
