// src/pages/StudentDashboard/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appAPI, resumeAPI, savedAPI, usersAPI } from '../../services/api'
import './StudentDashboard.css'

const SIDEBAR_ITEMS = [
  { key:'dashboard',    label:'Dashboard',       icon:'grid' },
  { key:'applications', label:'My Applications', icon:'file' },
  { key:'saved',        label:'Saved Jobs',      icon:'bookmark' },
  { key:'resume',       label:'Upload CV',       icon:'upload' },
  { key:'profile',      label:'Profile',         icon:'user' },
]

const STATUS_COLOR = { pending:'tag-yellow', reviewed:'tag-blue', shortlisted:'tag-blue', accepted:'tag-green', rejected:'tag-red' }

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,    setTab]    = useState('dashboard')
  const [stats,  setStats]  = useState(null)
  const [apps,   setApps]   = useState([])
  const [saved,  setSaved]  = useState([])
  const [resumes,setResumes]= useState([])
  const [profile,setProfile]= useState(null)
  const [loading,setLoading]= useState(true)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [profileForm, setProfileForm] = useState({ name:'', phone:'', location:'', bio:'', skills:'' })

  useEffect(() => {
    Promise.all([
      appAPI.myStats(),
      appAPI.myApplications(),
      savedAPI.getAll(),
      resumeAPI.getAll(),
      usersAPI.getProfile(),
    ]).then(([sRes, aRes, svRes, rRes, pRes]) => {
      setStats(sRes.data.data?.stats)
      setApps(aRes.data.data?.applications || [])
      setSaved(svRes.data.data?.saved_jobs || [])
      setResumes(rRes.data.data?.resumes || [])
      const p = pRes.data.data?.user
      setProfile(p)
      setProfileForm({ name: p?.name||'', phone: p?.phone||'', location: p?.location||'', bio: p?.bio||'', skills: p?.skills||'' })
    }).finally(() => setLoading(false))
  }, [])

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadMsg(null)
    const form = new FormData()
    form.append('resume', file)
    try {
      const res = await resumeAPI.upload(form)
      setResumes(prev => [res.data.data.resume, ...prev])
      setUploadMsg({ type:'success', text:'Resume uploaded successfully!' })
    } catch (err) {
      setUploadMsg({ type:'error', text: err.response?.data?.message || 'Upload failed. Check uploads folder exists.' })
    }
  }

  const handleDeleteResume = async (id) => {
    await resumeAPI.delete(id)
    setResumes(prev => prev.filter(r => r.id !== id))
  }

  const handleUnsave = async (jobId) => {
    await savedAPI.unsave(jobId)
    setSaved(prev => prev.filter(j => j.id !== jobId))
  }

  const handleWithdraw = async (appId) => {
    try {
      await appAPI.withdraw(appId)
      setApps(prev => prev.filter(a => a.id !== appId))
    } catch {}
  }

  const handleProfileSave = async () => {
    try {
      await usersAPI.updateProfile(profileForm)
      setUploadMsg({ type:'success', text:'Profile updated successfully!' })
    } catch {
      setUploadMsg({ type:'error', text:'Failed to update profile.' })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarIcon = ({ name }) => {
    const icons = {
      grid:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>,
      file:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      bookmark: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2a1 1 0 011-1h8a1 1 0 011 1v13l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.4"/></svg>,
      upload:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      user:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-4 6-4s6 .686 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      home:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 7v7h4v-4h2v4h4V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      logout:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    }
    return icons[name] || null
  }

  if (loading) return <div className="page-loader" style={{minHeight:'100vh'}}><div className="spinner" /></div>

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563EB"/><path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/></svg>
          <span>JobPortal</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.key} className={`sidebar-link ${tab === item.key ? 'active' : ''}`} onClick={() => { setTab(item.key); setUploadMsg(null) }}>
              <SidebarIcon name={item.icon} />{item.label}
            </button>
          ))}
          <div style={{margin:'8px 0', height:1, background:'var(--border-light)'}} />
          <button className="sidebar-link" onClick={() => navigate('/')}>
            <SidebarIcon name="home" />Home
          </button>
          <button className="sidebar-link" style={{color:'var(--red)'}} onClick={handleLogout}>
            <SidebarIcon name="logout" />Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h2 style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>
              Welcome, {user?.name} 👋
            </h2>
            <p style={{fontSize:13,color:'var(--text-muted)'}}>Let's find your dream job today!</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Link to="/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>
            <div className="avatar" style={{width:40,height:40,fontSize:16,background:'var(--primary-light)',color:'var(--primary)'}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* ─── Dashboard Overview ─── */}
          {tab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-num" style={{color:'var(--primary)'}}>{stats?.total_applications || 0}</div>
                  <div className="stat-label">Applications</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{color:'var(--yellow)'}}>{stats?.pending || 0}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{color:'var(--green)'}}>{stats?.accepted || 0}</div>
                  <div className="stat-label">Accepted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{color:'var(--text-secondary)'}}>{saved.length}</div>
                  <div className="stat-label">Saved Jobs</div>
                </div>
              </div>

              <div className="card" style={{padding:24}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Recent Applications</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('applications')}>View all →</button>
                </div>
                {apps.length === 0 ? (
                  <div className="empty-state">
                    <div style={{fontSize:36,marginBottom:8}}>📋</div>
                    <h3>No applications yet</h3>
                    <p><Link to="/jobs" style={{color:'var(--primary)'}}>Browse jobs</Link> to get started</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Job Title</th><th>Company</th><th>Status</th><th>Applied On</th></tr></thead>
                      <tbody>
                        {apps.slice(0,5).map(a => (
                          <tr key={a.id}>
                            <td><Link to={`/jobs/${a.job_id}`} style={{color:'var(--primary)',fontWeight:600}}>{a.title}</Link></td>
                            <td>{a.company_name}</td>
                            <td><span className={`tag ${STATUS_COLOR[a.status]}`}>{a.status}</span></td>
                            <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(a.applied_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {resumes.length > 0 && (
                <div className="card" style={{padding:24,marginTop:20}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>My Resumes</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('resume')}>Manage →</button>
                  </div>
                  {resumes.slice(0,2).map(r => (
                    <div key={r.id} className="resume-item">
                      <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
                        <span style={{fontSize:20}}>📄</span>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{r.file_name}</div>
                          <div style={{fontSize:12,color:'var(--text-muted)'}}>{r.is_primary ? '⭐ Primary' : 'Secondary'}</div>
                        </div>
                      </div>
                      <a href={`http://localhost:8000/uploads/${r.file_path}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── My Applications ─── */}
          {tab === 'applications' && (
            <div className="card" style={{padding:24}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>My Applications</h3>
              {apps.length === 0 ? (
                <div className="empty-state">
                  <div style={{fontSize:40,marginBottom:12}}>📋</div>
                  <h3>No applications yet</h3>
                  <p><Link to="/jobs" style={{color:'var(--primary)'}}>Find jobs to apply</Link></p>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead><tr><th>Job Title</th><th>Company</th><th>Status</th><th>Applied On</th><th>Action</th></tr></thead>
                    <tbody>
                      {apps.map(a => (
                        <tr key={a.id}>
                          <td><Link to={`/jobs/${a.job_id}`} style={{color:'var(--primary)',fontWeight:600}}>{a.title}</Link></td>
                          <td>{a.company_name}</td>
                          <td><span className={`tag ${STATUS_COLOR[a.status]}`}>{a.status}</span></td>
                          <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(a.applied_at).toLocaleDateString()}</td>
                          <td>{a.status==='pending' && <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(a.id)}>Withdraw</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── Saved Jobs ─── */}
          {tab === 'saved' && (
            <div className="card" style={{padding:24}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Saved Jobs</h3>
              {saved.length === 0 ? (
                <div className="empty-state">
                  <div style={{fontSize:40,marginBottom:12}}>🔖</div>
                  <h3>No saved jobs</h3>
                  <p><Link to="/jobs" style={{color:'var(--primary)'}}>Browse and save jobs</Link></p>
                </div>
              ) : (
                <div className="saved-grid">
                  {saved.map(j => (
                    <div key={j.id} className="card saved-job-item">
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <div style={{width:40,height:40,borderRadius:8,background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16}}>{j.company_name?.[0]}</div>
                        <div>
                          <Link to={`/jobs/${j.id}`} style={{fontWeight:700,fontSize:15,display:'block',color:'var(--text-primary)'}}>{j.title}</Link>
                          <span style={{fontSize:13,color:'var(--text-muted)'}}>{j.company_name}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between'}}>
                        <span className="tag tag-blue">{j.type}</span>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => handleUnsave(j.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Upload CV ─── */}
          {tab === 'resume' && (
            <div className="card" style={{padding:24}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>My Resumes / CV</h3>
              {uploadMsg && <div className={`alert alert-${uploadMsg.type}`}>{uploadMsg.text}</div>}
              <label className="upload-area">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{display:'none'}} />
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#EFF6FF"/><path d="M20 27V17M15 22l5-5 5 5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 32h16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/></svg>
                <p><strong>Click to upload</strong> or drag and drop</p>
                <span>PDF, DOC, DOCX (max 5MB)</span>
              </label>

              {resumes.length > 0 && (
                <div style={{marginTop:24}}>
                  <h4 style={{marginBottom:14,fontWeight:600,fontSize:14}}>Uploaded Resumes ({resumes.length})</h4>
                  {resumes.map(r => (
                    <div key={r.id} className="resume-item">
                      <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
                        <span style={{fontSize:24}}>📄</span>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{r.file_name}</div>
                          <div style={{fontSize:12,color:'var(--text-muted)'}}>{r.is_primary ? '⭐ Primary' : 'Secondary'} • {new Date(r.uploaded_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <a href={`http://localhost:8000/uploads/${r.file_path}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📄 View</a>
                        {!r.is_primary && (
                          <button className="btn btn-ghost btn-sm" onClick={() => resumeAPI.setPrimary(r.id).then(() => window.location.reload())}>⭐ Set Primary</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteResume(r.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Profile ─── */}
          {tab === 'profile' && (
            <div className="card" style={{padding:28,maxWidth:600}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Edit Profile</h3>
              {uploadMsg && <div className={`alert alert-${uploadMsg.type}`}>{uploadMsg.text}</div>}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profileForm.name} onChange={e => setProfileForm({...profileForm,name:e.target.value})} />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm,phone:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={profileForm.location} onChange={e => setProfileForm({...profileForm,location:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={profileForm.bio} onChange={e => setProfileForm({...profileForm,bio:e.target.value})} placeholder="Tell us about yourself..." />
              </div>
              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input className="form-input" value={profileForm.skills} placeholder="React, PHP, MySQL, JavaScript..." onChange={e => setProfileForm({...profileForm,skills:e.target.value})} />
              </div>
              <button className="btn btn-primary" onClick={handleProfileSave}>Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
