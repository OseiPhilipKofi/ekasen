import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "./icons/SocialIcons";

export default function Layout({ user, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    ["/", "Home"],
    ["/about", "About"],
    ["/plans", "Plans"],
    ["/contact", "Contact"],
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <div className="header-wrapper">
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

          <nav className={open ? "nav open" : "nav"}>
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

            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}

            {user ? (
              <button className="nav-action" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link
                className="nav-action"
                to="/login"
                onClick={() => setOpen(false)}
              >
                <UserRound size={16} /> Sign in
              </Link>
            )}
          </nav>
        </header>
      </div>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <strong className="footer-logo">TiFund</strong>
            <p>Building secure futures for Ghanaian teachers through sustainable investment and financial security.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><FacebookIcon size={18} /></a>
              <a href="#" aria-label="Twitter"><TwitterIcon size={18} /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon size={18} /></a>
              <a href="#" aria-label="LinkedIn"><LinkedinIcon size={18} /></a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-link-group">
              <h4>Platform</h4>
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/plans">Investment Plans</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-link-group">
              <h4>Support</h4>
              <Link to="/faq">FAQ</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="footer-partners">
          <span className="partners-label">Our Trusted Partners</span>
          <div className="partners-grid">
            <div className="partner-logo">Ghana Education Service</div>
            <div className="partner-logo">Teacher Pension Fund</div>
            <div className="partner-logo">National Trust</div>
            <div className="partner-logo">Paystack</div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Teacher Investment Fund · Kumasi, Ghana
          </span>
          <span className="bottom-credit">Secured by SSL Encryption</span>
        </div>
      </footer>
    </div>
  );
}
