// src/pages/Login/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'
import './Auth.css'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const from        = location.state?.from || null

  const [form,    setForm]    = useState({ email: '', password: '', role: 'student' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  // Forgot password states
  const [showForgot,  setShowForgot]  = useState(false)
  const [fpStep,      setFpStep]      = useState(1)
  const [fpEmail,     setFpEmail]     = useState('')
  const [fpRole,      setFpRole]      = useState('student')
  const [fpNewPw,     setFpNewPw]     = useState('')
  const [fpConfirmPw, setFpConfirmPw] = useState('')
  const [fpMsg,       setFpMsg]       = useState(null)
  const [fpLoading,   setFpLoading]   = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password, form.role)
      if (from) return navigate(from, { replace: true })
      if (user.role === 'student') navigate('/student/dashboard')
      else if (user.role === 'company') navigate('/company/dashboard')
      else if (user.role === 'admin')   navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  // Step 1 — verify email exists
  const handleFpStep1 = async (e) => {
    e.preventDefault()
    setFpMsg(null); setFpLoading(true)
    try {
      const res = await API.post('/auth/check-email', { email: fpEmail, role: fpRole })
      if (res.data.success) {
        setFpStep(2)
        setFpMsg({ type: 'success', text: '✅ Email verified! Set your new password.' })
      }
    } catch (err) {
      setFpMsg({ type: 'error', text: err.response?.data?.message || 'No account found with this email.' })
    } finally { setFpLoading(false) }
  }

  // Step 2 — set new password
  const handleFpStep2 = async (e) => {
    e.preventDefault()
    setFpMsg(null)
    if (fpNewPw.length < 8) {
      setFpMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (fpNewPw !== fpConfirmPw) {
      setFpMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setFpLoading(true)
    try {
      await API.post('/auth/reset-password', {
        email:        fpEmail,
        role:         fpRole,
        new_password: fpNewPw,
      })
      setFpMsg({ type: 'success', text: '🎉 Password reset successfully! You can now login.' })
      setTimeout(() => {
        setShowForgot(false)
        setFpStep(1)
        setFpEmail('')
        setFpNewPw('')
        setFpConfirmPw('')
        setFpMsg(null)
        setForm(prev => ({ ...prev, email: fpEmail }))
      }, 2500)
    } catch (err) {
      setFpMsg({ type: 'error', text: err.response?.data?.message || 'Reset failed. Try again.' })
    } finally { setFpLoading(false) }
  }

  const closeForgot = () => {
    setShowForgot(false)
    setFpStep(1)
    setFpEmail('')
    setFpNewPw('')
    setFpConfirmPw('')
    setFpMsg(null)
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563EB"/><path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/></svg>
            JobPortal
          </Link>
          <h1>Welcome Back 👋</h1>
          <p>Login to your account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="role-tabs">
              <button type="button" className={`role-tab ${form.role === 'student' ? 'active' : ''}`} onClick={() => setForm({...form, role:'student'})}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-4 6-4s6 .686 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Student
              </button>
              <button type="button" className={`role-tab ${form.role === 'company' ? 'active' : ''}`} onClick={() => setForm({...form, role:'company'})}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Company
              </button>
              <button type="button" className={`role-tab ${form.role === 'admin' ? 'active' : ''}`} onClick={() => setForm({...form, role:'admin'})}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.5 4 .6-2.9 2.8.7 3.9L8 10l-3.6 1.8.7-3.9L2.2 5.1l4-.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                Admin
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input name="email" type="email" className="form-input" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => { setShowForgot(true); setFpRole(form.role); setFpEmail(form.email) }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="pw-wrap">
                <input name="password" type={showPw ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5S2 8 2 8z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5S2 8 2 8z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Logging in...</> : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right illustration */}
      <div className="auth-right">
        <div className="auth-illus">
          <svg viewBox="0 0 340 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth:300}}>
            <ellipse cx="170" cy="350" rx="120" ry="20" fill="rgba(255,255,255,.1)"/>
            <rect x="60" y="120" width="220" height="180" rx="16" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/>
            <rect x="60" y="120" width="220" height="44" rx="16" fill="rgba(255,255,255,.15)"/>
            <text x="80" y="148" fill="white" fontSize="14" fontWeight="600">JobPortal</text>
            <rect x="80" y="182" width="180" height="12" rx="6" fill="rgba(255,255,255,.15)"/>
            <rect x="80" y="202" width="140" height="10" rx="5" fill="rgba(255,255,255,.1)"/>
            <rect x="80" y="228" width="180" height="32" rx="8" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
            <rect x="80" y="270" width="180" height="32" rx="8" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
            <rect x="80" y="312" width="180" height="36" rx="10" fill="rgba(255,255,255,.9)"/>
            <text x="140" y="335" fill="#2563EB" fontSize="13" fontWeight="700">Login →</text>
            <circle cx="280" cy="90" r="40" fill="rgba(255,255,255,.15)"/>
            <circle cx="280" cy="78" r="18" fill="rgba(255,255,255,.3)"/>
            <path d="M255 130c0-14 11.2-18 25-18s25 4 25 18" fill="rgba(255,255,255,.2)"/>
            <rect x="28" y="278" width="8" height="42" rx="2" fill="rgba(255,255,255,.2)"/>
            <ellipse cx="32" cy="260" rx="16" ry="22" fill="rgba(255,255,255,.2)"/>
            <ellipse cx="22" cy="280" rx="10" ry="14" fill="rgba(255,255,255,.15)"/>
          </svg>
          <div className="auth-illus-text">
            <h3>Find Your Perfect Career</h3>
            <p>Thousands of opportunities await. Join JobPortal today.</p>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div className="modal-overlay" onClick={closeForgot}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{fpStep === 1 ? '🔑 Forgot Password' : '🔒 Set New Password'}</h2>
              <button className="modal-close" onClick={closeForgot}>✕</button>
            </div>

            {fpMsg && <div className={`alert alert-${fpMsg.type}`}>{fpMsg.text}</div>}

            {/* Step indicator */}
            <div className="fp-steps">
              <div className={`fp-step ${fpStep >= 1 ? 'active' : ''}`}>
                <span>1</span> Verify Email
              </div>
              <div className="fp-step-line" />
              <div className={`fp-step ${fpStep >= 2 ? 'active' : ''}`}>
                <span>2</span> New Password
              </div>
            </div>

            {/* Step 1 */}
            {fpStep === 1 && (
              <form onSubmit={handleFpStep1}>
                <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:16}}>
                  Select your role and enter your email to verify your account.
                </p>

                <div className="role-tabs" style={{marginBottom:16}}>
                  {['student','company','admin'].map(r => (
                    <button key={r} type="button"
                      className={`role-tab ${fpRole===r?'active':''}`}
                      onClick={() => setFpRole(r)}
                    >
                      {r.charAt(0).toUpperCase()+r.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email" className="form-input"
                    placeholder="Enter your registered email"
                    value={fpEmail}
                    onChange={e => setFpEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={fpLoading}>
                  {fpLoading
                    ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Verifying...</>
                    : 'Verify Email →'
                  }
                </button>
              </form>
            )}

            {/* Step 2 */}
            {fpStep === 2 && (
              <form onSubmit={handleFpStep2}>
                <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:16}}>
                  Account found for <strong style={{color:'var(--primary)'}}>{fpEmail}</strong>. Enter your new password.
                </p>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password" className="form-input"
                    placeholder="Minimum 8 characters"
                    value={fpNewPw}
                    onChange={e => setFpNewPw(e.target.value)}
                    required minLength={8}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password" className="form-input"
                    placeholder="Re-enter new password"
                    value={fpConfirmPw}
                    onChange={e => setFpConfirmPw(e.target.value)}
                    required
                  />
                </div>

                <div style={{display:'flex',gap:10}}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setFpStep(1); setFpMsg(null) }}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={fpLoading}>
                    {fpLoading
                      ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Resetting...</>
                      : '✓ Reset Password'
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
