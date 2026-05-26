// src/pages/CompanyDashboard/CompanyDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { jobsAPI, appAPI, companiesAPI } from '../../services/api'
import './CompanyDashboard.css'

const SIDEBAR_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',      icon: 'grid' },
  { key: 'jobs',        label: 'My Jobs',         icon: 'briefcase' },
  { key: 'post',        label: 'Post a Job',      icon: 'plus' },
  { key: 'applicants',  label: 'Applicants',      icon: 'users' },
  { key: 'profile',     label: 'Company Profile', icon: 'building' },
]

const STATUS_COLOR = { pending:'tag-yellow', reviewed:'tag-blue', shortlisted:'tag-blue', accepted:'tag-green', rejected:'tag-red' }
const JOB_TYPES    = ['full-time','part-time','remote','contract','internship']
const EXP_LEVELS   = ['entry','mid','senior','lead','any']
const SALARY_TYPES = ['monthly','yearly','hourly']
const INDUSTRIES   = ['Information Technology','Finance','Healthcare','Education','Retail','Manufacturing','Marketing','Other']

const defaultJob = { title:'', description:'', requirements:'', responsibilities:'', salary_min:'', salary_max:'', salary_type:'monthly', location:'', type:'full-time', experience_level:'any', category:'', deadline:'' }

export default function CompanyDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,        setTab]        = useState('dashboard')
  const [stats,      setStats]      = useState(null)
  const [jobs,       setJobs]       = useState([])
  const [applicants, setApplicants] = useState([])
  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [jobForm,    setJobForm]    = useState(defaultJob)
  const [editId,     setEditId]     = useState(null)
  const [msg,        setMsg]        = useState(null)
  const [profForm,   setProfForm]   = useState({})
  const [selJobId,   setSelJobId]   = useState(null)

  useEffect(() => {
    Promise.all([
      jobsAPI.getMyStats(),
      jobsAPI.getMyJobs(),
      appAPI.byCompany({ page:1 }),
      companiesAPI.getMyProfile(),
    ]).then(([sRes, jRes, aRes, pRes]) => {
      setStats(sRes.data.data?.stats)
      setJobs(jRes.data.data?.jobs || [])
      setApplicants(aRes.data.data?.applications || [])
      const p = pRes.data.data?.company
      setProfile(p)
      setProfForm({
        company_name:   p?.company_name   || '',
        description:    p?.description    || '',
        website:        p?.website        || '',
        location:       p?.location       || '',
        industry:       p?.industry       || '',
        phone:          p?.phone          || '',
        founded_year:   p?.founded_year   || '',
        employee_count: p?.employee_count || '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const handlePostJob = async (e) => {
    e.preventDefault(); setMsg(null)
    try {
      if (editId) {
        await jobsAPI.update(editId, jobForm)
        setMsg({ type:'success', text:'Job updated successfully!' })
        setEditId(null)
      } else {
        await jobsAPI.create(jobForm)
        setMsg({ type:'success', text:'Job posted successfully!' })
      }
      setJobForm(defaultJob)
      const res = await jobsAPI.getMyJobs()
      setJobs(res.data.data?.jobs || [])
      setTimeout(() => setTab('jobs'), 1000)
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to save job.' })
    }
  }

  const handleEditJob = (job) => {
    setJobForm({
      title: job.title, description: job.description||'',
      requirements: job.requirements||'', responsibilities: job.responsibilities||'',
      salary_min: job.salary_min||'', salary_max: job.salary_max||'',
      salary_type: job.salary_type||'monthly', location: job.location||'',
      type: job.type||'full-time', experience_level: job.experience_level||'any',
      category: job.category||'', deadline: job.deadline||'',
    })
    setEditId(job.id); setTab('post'); setMsg(null)
  }

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return
    try {
      await jobsAPI.delete(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch { alert('Failed to delete job.') }
  }

  const handleStatusUpdate = async (appId, status) => {
    try {
      await appAPI.updateStatus(appId, { status })
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    } catch { alert('Failed to update status.') }
  }

  const handleProfileSave = async () => {
    try {
      await companiesAPI.updateProfile(profForm)
      setMsg({ type:'success', text:'Profile updated successfully!' })
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Update failed.' })
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('logo', file)
    try {
      await companiesAPI.uploadLogo(form)
      setMsg({ type:'success', text:'Logo uploaded successfully!' })
      const res = await companiesAPI.getMyProfile()
      setProfile(res.data.data?.company)
    } catch {
      setMsg({ type:'error', text:'Logo upload failed. Check uploads/logos folder exists.' })
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const SidebarIcon = ({ name }) => {
    const icons = {
      grid:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>,
      briefcase:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1M2 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      plus:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      users:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 14c0-2.761 2.239-3.5 5-3.5s5 .739 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
      building: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h2M9 6h2M5 9h2M9 9h2M6 14v-3h4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      home:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 7v7h4v-4h2v4h4V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      logout:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    }
    return icons[name] || null
  }

  if (loading) return <div className="page-loader" style={{minHeight:'100vh'}}><div className="spinner" /></div>

  const filteredApps = selJobId ? applicants.filter(a => a.job_id === selJobId) : applicants

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563EB"/><path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/></svg>
          <span>JobPortal</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.key} className={`sidebar-link ${tab === item.key ? 'active' : ''}`} onClick={() => { setTab(item.key); setMsg(null) }}>
              <SidebarIcon name={item.icon} />{item.label}
            </button>
          ))}
          <div style={{margin:'8px 0',height:1,background:'var(--border-light)'}} />
          <button className="sidebar-link" onClick={() => navigate('/')}>
            <SidebarIcon name="home" />Home
          </button>
          <button className="sidebar-link" style={{color:'var(--red)'}} onClick={handleLogout}>
            <SidebarIcon name="logout" />Logout
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h2 style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>
              Welcome, {user?.company_name || user?.name} 👋
            </h2>
            <p style={{fontSize:13,color:'var(--text-muted)'}}>Here's what's happening with your jobs.</p>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button className="btn btn-primary btn-sm" onClick={() => { setTab('post'); setEditId(null); setJobForm(defaultJob); setMsg(null) }}>
              + Post a Job
            </button>
            <div className="avatar" style={{width:40,height:40,fontSize:16,background:'var(--primary-light)',color:'var(--primary)'}}>
              {(user?.company_name || user?.name || '?')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="dashboard-content">

          {/* ─── Dashboard ─── */}
          {tab === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-num" style={{color:'var(--primary)'}}>{stats?.total_jobs || 0}</div><div className="stat-label">Total Jobs</div></div>
                <div className="stat-card"><div className="stat-num" style={{color:'var(--green)'}}>{stats?.active_jobs || 0}</div><div className="stat-label">Active Jobs</div></div>
                <div className="stat-card"><div className="stat-num" style={{color:'var(--yellow)'}}>{stats?.total_applications || 0}</div><div className="stat-label">Total Applicants</div></div>
                <div className="stat-card"><div className="stat-num" style={{color:'var(--text-secondary)'}}>{applicants.filter(a=>a.status==='pending').length}</div><div className="stat-label">New Applications</div></div>
              </div>

              <div className="card" style={{padding:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Recent Jobs</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('jobs')}>View all →</button>
                </div>
                {jobs.length === 0 ? (
                  <div className="empty-state">
                    <div style={{fontSize:36,marginBottom:8}}>💼</div>
                    <h3>No jobs posted yet</h3>
                    <p><button className="btn btn-primary btn-sm" onClick={() => setTab('post')}>Post your first job</button></p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Job Title</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {jobs.slice(0,5).map(j => (
                        <tr key={j.id}>
                          <td style={{fontWeight:600}}>{j.title}</td>
                          <td>{applicants.filter(a=>a.job_id===j.id).length}</td>
                          <td><span className={`tag ${j.is_active ? 'tag-green' : 'tag-gray'}`}>{j.is_active ? 'Active' : 'Draft'}</span></td>
                          <td>
                            <div style={{display:'flex',gap:6}}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleEditJob(j)}>Edit</button>
                              <button className="btn btn-ghost btn-sm" style={{color:'var(--primary)'}} onClick={() => { setSelJobId(j.id); setTab('applicants') }}>View Apps</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ─── My Jobs ─── */}
          {tab === 'jobs' && (
            <div className="card" style={{padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>My Posted Jobs</h3>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setJobForm(defaultJob); setTab('post'); setMsg(null) }}>+ Post New Job</button>
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state"><h3>No jobs posted yet</h3><p>Post your first job to start receiving applications.</p></div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead><tr><th>Job Title</th><th>Location</th><th>Type</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
                    <tbody>
                      {jobs.map(j => (
                        <tr key={j.id}>
                          <td style={{fontWeight:600}}><Link to={`/jobs/${j.id}`} style={{color:'var(--primary)'}}>{j.title}</Link></td>
                          <td style={{color:'var(--text-secondary)'}}>{j.location || '—'}</td>
                          <td><span className="tag tag-blue">{j.type}</span></td>
                          <td><span className={`tag ${j.is_active?'tag-green':'tag-gray'}`}>{j.is_active?'Active':'Draft'}</span></td>
                          <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(j.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{display:'flex',gap:6}}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleEditJob(j)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── Post / Edit Job ─── */}
          {tab === 'post' && (
            <div className="card" style={{padding:28,maxWidth:700}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:24}}>{editId ? '✏️ Edit Job' : '+ Post a New Job'}</h3>
              {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
              <form onSubmit={handlePostJob}>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" placeholder="e.g. React.js Developer" value={jobForm.title} onChange={e => setJobForm({...jobForm,title:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea className="form-textarea" rows={5} placeholder="Describe the role..." value={jobForm.description} onChange={e => setJobForm({...jobForm,description:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea className="form-textarea" rows={3} placeholder="Required skills and experience..." value={jobForm.requirements} onChange={e => setJobForm({...jobForm,requirements:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Responsibilities</label>
                  <textarea className="form-textarea" rows={3} placeholder="Key responsibilities..." value={jobForm.responsibilities} onChange={e => setJobForm({...jobForm,responsibilities:e.target.value})} />
                </div>
                <div className="form-3col">
                  <div className="form-group">
                    <label className="form-label">Min Salary</label>
                    <input className="form-input" type="number" placeholder="e.g. 80000" value={jobForm.salary_min} onChange={e => setJobForm({...jobForm,salary_min:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Salary</label>
                    <input className="form-input" type="number" placeholder="e.g. 150000" value={jobForm.salary_max} onChange={e => setJobForm({...jobForm,salary_max:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary Type</label>
                    <select className="form-select" value={jobForm.salary_type} onChange={e => setJobForm({...jobForm,salary_type:e.target.value})}>
                      {SALARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-3col">
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select className="form-select" value={jobForm.type} onChange={e => setJobForm({...jobForm,type:e.target.value})}>
                      {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-',' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select className="form-select" value={jobForm.experience_level} onChange={e => setJobForm({...jobForm,experience_level:e.target.value})}>
                      {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="e.g. Colombo 03" value={jobForm.location} onChange={e => setJobForm({...jobForm,location:e.target.value})} />
                  </div>
                </div>
                <div className="form-3col">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" placeholder="e.g. Engineering" value={jobForm.category} onChange={e => setJobForm({...jobForm,category:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input className="form-input" type="date" value={jobForm.deadline} onChange={e => setJobForm({...jobForm,deadline:e.target.value})} />
                  </div>
                </div>
                <div style={{display:'flex',gap:12,marginTop:8}}>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update Job' : 'Post Job'}</button>
                  {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setJobForm(defaultJob); setTab('jobs') }}>Cancel</button>}
                </div>
              </form>
            </div>
          )}

          {/* ─── Applicants ─── */}
          {tab === 'applicants' && (
            <div className="card" style={{padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
                <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Applicants ({filteredApps.length})</h3>
                <select className="form-select" style={{width:'auto'}} value={selJobId||''} onChange={e => setSelJobId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">All Jobs</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              {filteredApps.length === 0 ? (
                <div className="empty-state">
                  <div style={{fontSize:40,marginBottom:12}}>👥</div>
                  <h3>No applicants yet</h3>
                  <p>Applications will appear here once candidates apply.</p>
                </div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th><th>CV</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredApps.map(a => (
                        <tr key={a.id}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div className="avatar" style={{width:34,height:34,fontSize:13,background:'var(--primary-light)',color:'var(--primary)',flexShrink:0}}>
                                {a.student_name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{fontWeight:600,fontSize:14}}>{a.student_name}</div>
                                <div style={{fontSize:12,color:'var(--text-muted)'}}>{a.student_email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{color:'var(--text-secondary)',fontSize:13}}>{a.job_title}</td>
                          <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(a.applied_at).toLocaleDateString()}</td>
                          <td><span className={`tag ${STATUS_COLOR[a.status]}`}>{a.status}</span></td>
                          <td>
                            {a.resume_path ? (
                              <a href={`http://localhost:8000/uploads/${a.resume_path}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                                📄 View CV
                              </a>
                            ) : (
                              <span style={{fontSize:12,color:'var(--text-muted)'}}>No CV</span>
                            )}
                          </td>
                          <td>
                            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                              {a.status !== 'accepted'    && <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(a.id,'accepted')}>Accept</button>}
                              {a.status !== 'rejected'    && <button className="btn btn-danger btn-sm"  onClick={() => handleStatusUpdate(a.id,'rejected')}>Reject</button>}
                              {a.status === 'pending'     && <button className="btn btn-outline btn-sm" onClick={() => handleStatusUpdate(a.id,'shortlisted')}>Shortlist</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── Company Profile ─── */}
          {tab === 'profile' && (
            <div className="card" style={{padding:28,maxWidth:640}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Company Profile</h3>
              {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
              <div className="logo-upload-row">
                <div className="company-logo-preview">
                  {profile?.logo
                    ? <img src={`http://localhost:8000/uploads/${profile.logo}`} alt="logo" />
                    : <span>{(profile?.company_name||'C')[0]}</span>}
                </div>
                <div>
                  <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>
                    Upload Logo
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={handleLogoUpload} />
                  </label>
                  <p style={{fontSize:12,color:'var(--text-muted)',marginTop:6}}>JPG, PNG, WEBP (max 2MB)</p>
                </div>
              </div>
              <div className="divider" />
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" value={profForm.company_name||''} onChange={e => setProfForm({...profForm,company_name:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={4} value={profForm.description||''} onChange={e => setProfForm({...profForm,description:e.target.value})} />
              </div>
              <div className="form-3col">
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" placeholder="https://" value={profForm.website||''} onChange={e => setProfForm({...profForm,website:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={profForm.location||''} onChange={e => setProfForm({...profForm,location:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select className="form-select" value={profForm.industry||''} onChange={e => setProfForm({...profForm,industry:e.target.value})}>
                    <option value="">Select</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-3col">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profForm.phone||''} onChange={e => setProfForm({...profForm,phone:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Founded Year</label>
                  <input className="form-input" type="number" value={profForm.founded_year||''} onChange={e => setProfForm({...profForm,founded_year:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Employees</label>
                  <select className="form-select" value={profForm.employee_count||''} onChange={e => setProfForm({...profForm,employee_count:e.target.value})}>
                    <option value="">Select</option>
                    {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleProfileSave}>Save Profile</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
