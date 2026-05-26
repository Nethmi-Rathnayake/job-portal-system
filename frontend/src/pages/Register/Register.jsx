// src/pages/Register/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import './Auth.css'

export default function Register() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [role,  setRole]   = useState('student')
  const [error, setError]  = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const [studentForm, setStudentForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', location:'' })
  const [companyForm, setCompanyForm] = useState({ company_name:'', email:'', password:'', confirmPassword:'', description:'', website:'', location:'', industry:'' })

  const form = role === 'student' ? studentForm : companyForm
  const setForm = role === 'student' ? setStudentForm : setCompanyForm
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    try {
      const { confirmPassword, ...payload } = form
      if (role === 'student') await authAPI.registerStudent(payload)
      else                    await authAPI.registerCompany(payload)

      await login(form.email, form.password, role)
      navigate(role === 'student' ? '/student/dashboard' : '/company/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const INDUSTRIES = ['Information Technology','Finance','Healthcare','Education','Retail','Manufacturing','Marketing','Other']

  return (
    <div className="auth-page">
      <div className="auth-left" style={{maxWidth: 560}}>
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563EB"/><path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/></svg>
            JobPortal
          </Link>
          <h1>Create Account ✨</h1>
          <p>Join JobPortal today</p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Role toggle */}
          <div className="role-tabs" style={{marginBottom:24}}>
            <button type="button" className={`role-tab ${role==='student'?'active':''}`} onClick={() => setRole('student')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-4 6-4s6 .686 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Student
            </button>
            <button type="button" className={`role-tab ${role==='company'?'active':''}`} onClick={() => setRole('company')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {role === 'student' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-input" placeholder="Enter your name" value={studentForm.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" className="form-input" placeholder="+1 234 567" value={studentForm.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input name="email" type="email" className="form-input" placeholder="your@email.com" value={studentForm.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" className="form-input" placeholder="City, Country" value={studentForm.location} onChange={handleChange} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input name="company_name" className="form-input" placeholder="Your company name" value={companyForm.company_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input name="email" type="email" className="form-input" placeholder="company@email.com" value={companyForm.email} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select name="industry" className="form-select" value={companyForm.industry} onChange={handleChange}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input name="location" className="form-input" placeholder="City, Country" value={companyForm.location} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input name="website" className="form-input" placeholder="https://yourcompany.com" value={companyForm.website} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="pw-wrap">
                  <input name="password" type={showPw?'text':'password'} className="form-input" placeholder="Create password" value={form.password} onChange={handleChange} required minLength={8} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5S2 8 2 8z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input name="confirmPassword" type="password" className="form-input" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Creating account...</> : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-illus">
          <svg viewBox="0 0 340 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:300}}>
            <circle cx="170" cy="120" r="70" fill="rgba(255,255,255,.1)"/>
            <circle cx="170" cy="100" r="40" fill="rgba(255,255,255,.2)"/>
            <path d="M120 200c0-28 22.4-36 50-36s50 8 50 36" fill="rgba(255,255,255,.15)"/>
            <rect x="90" y="220" width="160" height="100" rx="14" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
            <rect x="105" y="235" width="70" height="10" rx="5" fill="rgba(255,255,255,.2)"/>
            <rect x="105" y="252" width="130" height="8" rx="4" fill="rgba(255,255,255,.12)"/>
            <rect x="105" y="267" width="100" height="8" rx="4" fill="rgba(255,255,255,.12)"/>
            <rect x="105" y="290" width="130" height="20" rx="6" fill="rgba(255,255,255,.9)"/>
            <text x="142" y="304" fill="#2563EB" fontSize="11" fontWeight="700">Join Now →</text>
          </svg>
          <div className="auth-illus-text">
            <h3>Start Your Journey Today</h3>
            <p>Create your profile and get discovered by top employers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
