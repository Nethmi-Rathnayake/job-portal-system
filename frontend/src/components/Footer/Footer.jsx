// src/components/Footer/Footer.jsx
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#3B82F6"/>
                <path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/>
              </svg>
              <span>JobPortal</span>
            </Link>
            <p className="footer-tagline">
              Connecting talent with opportunity. Your career starts here.
            </p>
            <div className="footer-socials">
              {['facebook','twitter','linkedin','instagram'].map(s => (
                <a key={s} href="#" className="social-icon" aria-label={s}>
                  {s === 'facebook'  && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>}
                  {s === 'twitter'   && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>}
                  {s === 'linkedin'  && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>}
                  {s === 'instagram' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              {[['/', 'Home'], ['/jobs', 'Jobs'], ['/companies', 'Companies'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* For candidates */}
          <div className="footer-col">
            <h4>For Candidates</h4>
            <ul>
              {['/jobs', '/register', '/student/dashboard', '/student/dashboard', '/student/dashboard'].map((to, i) => (
                <li key={i}><Link to={to}>{['Browse Jobs','Upload CV','Career Advice','Dashboard','Settings'][i]}</Link></li>
              ))}
            </ul>
          </div>

          {/* For employers */}
          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              {['/register', '/company/dashboard', '/company/dashboard', '/register'].map((to, i) => (
                <li key={i}><Link to={to}>{['Post a Job','Find Candidates','Pricing','Dashboard'][i]}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <svg viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 013.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5A4.5 4.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                123 JobPortal Street, New York, USA
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.2"/></svg>
                info@jobportal.com
              </li>
              <li>
                <svg viewBox="0 0 16 16" fill="none"><path d="M14 10.9l-2.7-1.2a.75.75 0 00-.8.15l-1.2 1.2a9.55 9.55 0 01-4.5-4.5l1.2-1.2a.75.75 0 00.15-.8L4.9 2a.75.75 0 00-.8-.45L2 2A.75.75 0 001.5 2.7 12.5 12.5 0 0013.3 14.5a.75.75 0 00.7-.5l.45-2.1a.75.75 0 00-.45-.8z" stroke="currentColor" strokeWidth="1.2"/></svg>
                +1 234 567 8900
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 JobPortal. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
