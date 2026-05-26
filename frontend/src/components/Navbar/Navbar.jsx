// src/components/Navbar/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout }   = useAuth()
  const navigate            = useNavigate()
  const { pathname }        = useLocation()
  const [menuOpen, setMenu] = useState(false)
  const [dropOpen, setDrop] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setDrop(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'student') return '/student/dashboard'
    if (user.role === 'company') return '/company/dashboard'
    if (user.role === 'admin')   return '/admin/dashboard'
  }

  const navLinks = [
    { to: '/',          label: 'Home' },
    { to: '/jobs',      label: 'Jobs' },
    { to: '/companies', label: 'Companies' },
    { to: '/about',     label: 'About' },
    
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2563EB"/>
            <path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/>
          </svg>
          <span>JobPortal</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className={`navbar-link ${pathname === to ? 'active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <button className="navbar-avatar-btn" onClick={() => setDrop(!dropOpen)}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {(user.name || user.company_name || '?')[0].toUpperCase()}
                </div>
                <span className="navbar-username">{user.name || user.company_name}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>

              {dropOpen && (
                <div className="navbar-dropdown">
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDrop(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>
                    Dashboard
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenu(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="mobile-link" onClick={() => setMenu(false)}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link to={getDashboardLink()} className="mobile-link" onClick={() => setMenu(false)}>Dashboard</Link>
              <button className="mobile-link" style={{ textAlign:'left', color:'var(--red)' }} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="mobile-auth">
              <Link to="/login"    className="btn btn-outline" onClick={() => setMenu(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenu(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
