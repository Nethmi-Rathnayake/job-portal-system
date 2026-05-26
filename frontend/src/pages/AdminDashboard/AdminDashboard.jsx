// src/pages/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import './AdminDashboard.css'

const SIDEBAR_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',  icon: 'grid'      },
  { key: 'users',      label: 'Users',      icon: 'users'     },
  { key: 'companies',  label: 'Companies',  icon: 'building'  },
  { key: 'jobs',       label: 'Jobs',       icon: 'briefcase' },
  { key: 'reports',    label: 'Reports',    icon: 'chart'     },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab,        setTab]        = useState('dashboard')
  const [stats,      setStats]      = useState(null)
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [monthly,    setMonthly]    = useState([])
  const [users,      setUsers]      = useState([])
  const [companies,  setCompanies]  = useState([])
  const [jobs,       setJobs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')

  useEffect(() => {
    adminAPI.getStats().then(res => {
      const d = res.data.data
      setStats(d.stats)
      setRecentJobs(d.recent_jobs || [])
      setRecentApps(d.recent_apps || [])
      setMonthly(d.monthly_jobs  || [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'users')     adminAPI.getUsers({ search }).then(r => setUsers(r.data.data?.users || []))
    if (tab === 'companies') adminAPI.getCompanies().then(r => setCompanies(r.data.data?.companies || []))
    if (tab === 'jobs')      adminAPI.getJobs({ search }).then(r => setJobs(r.data.data?.jobs || []))
  }, [tab, search])

  const handleToggleUser    = async (id) => { await adminAPI.toggleUser(id);    setUsers(u => u.map(x => x.id===id ? {...x, is_active: x.is_active ? 0 : 1} : x)) }
  const handleDeleteUser    = async (id) => { if (!window.confirm('Delete this user?'))    return; await adminAPI.deleteUser(id);    setUsers(u => u.filter(x => x.id !== id)) }
  const handleVerifyCompany = async (id) => { await adminAPI.verifyCompany(id); setCompanies(c => c.map(x => x.id===id ? {...x, is_verified: x.is_verified ? 0 : 1} : x)) }
  const handleDeleteCompany = async (id) => { if (!window.confirm('Delete this company?')) return; await adminAPI.deleteCompany(id); setCompanies(c => c.filter(x => x.id !== id)) }
  const handleToggleJob     = async (id) => { await adminAPI.toggleJob(id);     setJobs(j => j.map(x => x.id===id ? {...x, is_active: x.is_active ? 0 : 1} : x)) }
  const handleDeleteJob     = async (id) => { if (!window.confirm('Delete this job?'))     return; await adminAPI.deleteJob(id);     setJobs(j => j.filter(x => x.id !== id)) }
  const handleLogout = () => { logout(); navigate('/') }

  const SidebarIcon = ({ name }) => {
    const icons = {
      grid:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/></svg>,
      users:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 14c0-2.761 2.239-3.5 5-3.5s5 .739 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
      building: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h2M9 6h2M5 9h2M9 9h2M6 14v-3h4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      briefcase:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5V4a1 1 0 011-1h4a1 1 0 011 1v1M2 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      chart:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14h12M4 14V9M8 14V6M12 14V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
      home:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 7v7h4v-4h2v4h4V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      logout:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    }
    return icons[name] || null
  }

  if (loading) return <div className="page-loader" style={{minHeight:'100vh'}}><div className="spinner"/></div>

  const maxMonthly = Math.max(...monthly.map(m => m.count), 1)

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563EB"/><path d="M8 20V10l6-3 6 3v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="11" y="14" width="6" height="6" rx="1" fill="#fff"/></svg>
          <span>JobPortal</span>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.key} className={`sidebar-link ${tab===item.key?'active':''}`} onClick={() => { setTab(item.key); setSearch('') }}>
              <SidebarIcon name={item.icon}/>{item.label}
            </button>
          ))}
          <div style={{margin:'8px 0',height:1,background:'var(--border-light)'}}/>
          <button className="sidebar-link" onClick={() => navigate('/')}>
            <SidebarIcon name="home"/>Home
          </button>
          <button className="sidebar-link" style={{color:'var(--red)'}} onClick={handleLogout}>
            <SidebarIcon name="logout"/>Logout
          </button>
        </nav>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h2 style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>Admin Dashboard</h2>
            <p style={{fontSize:13,color:'var(--text-muted)'}}>Overview of the platform</p>
          </div>
          <div className="avatar" style={{width:40,height:40,fontSize:16,background:'var(--primary-light)',color:'var(--primary)'}}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>

        <div className="dashboard-content">

          {/* ─── Dashboard ─── */}
          {tab === 'dashboard' && (
            <>
              <div className="stats-grid">
                {[
                  { num: stats?.total_users,    label: 'Total Users',    color: '#2563EB' },
                  { num: stats?.total_companies, label: 'Companies',      color: '#16A34A' },
                  { num: stats?.total_jobs,      label: 'Jobs',           color: '#D97706' },
                  { num: stats?.total_apps,      label: 'Applications',   color: '#9333EA' },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-num" style={{color:s.color}}>{s.num?.toLocaleString() || 0}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="admin-analytics-grid">
                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Monthly Jobs Posted</h3>
                  {monthly.length > 0 ? (
                    <div className="bar-chart">
                      {monthly.map((m,i) => (
                        <div key={i} className="bar-col">
                          <div className="bar-tooltip">{m.count}</div>
                          <div className="bar" style={{height:`${(m.count/maxMonthly)*100}%`}}/>
                          <div className="bar-label">{m.month?.slice(5)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state" style={{padding:30}}><p>No data yet — post some jobs first!</p></div>
                  )}
                </div>

                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Applications by Status</h3>
                  <div className="status-breakdown">
                    {[
                      { label:'Pending',     color:'#D97706', pct:40 },
                      { label:'Shortlisted', color:'#2563EB', pct:25 },
                      { label:'Accepted',    color:'#16A34A', pct:20 },
                      { label:'Rejected',    color:'#DC2626', pct:15 },
                    ].map((s,i) => (
                      <div key={i} className="status-row">
                        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:110}}>
                          <span style={{width:10,height:10,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                          <span style={{fontSize:13}}>{s.label}</span>
                        </div>
                        <div className="status-bar-wrap">
                          <div className="status-bar" style={{width:`${s.pct}%`,background:s.color}}/>
                        </div>
                        <span style={{fontSize:13,fontWeight:600,minWidth:36,textAlign:'right'}}>{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-analytics-grid">
                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:16}}>Recent Jobs</h3>
                  {recentJobs.length === 0 ? <p style={{color:'var(--text-muted)',fontSize:14}}>No jobs yet</p> : (
                    <table className="data-table">
                      <thead><tr><th>Title</th><th>Company</th><th>Posted</th></tr></thead>
                      <tbody>
                        {recentJobs.map(j => (
                          <tr key={j.id}>
                            <td style={{fontWeight:600}}>{j.title}</td>
                            <td style={{color:'var(--text-secondary)'}}>{j.company_name}</td>
                            <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(j.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:16}}>Recent Activities</h3>
                  <div className="activity-feed">
                    {recentApps.length === 0 ? (
                      <p style={{fontSize:14,color:'var(--text-muted)'}}>No recent activity</p>
                    ) : recentApps.map((a,i) => (
                      <div key={i} className="activity-item">
                        <div className="activity-dot" style={{background: a.status==='accepted'?'var(--green)':a.status==='rejected'?'var(--red)':'var(--primary)'}}/>
                        <div className="activity-content">
                          <p style={{fontSize:13}}><strong>{a.student_name}</strong> applied for <strong>{a.job_title}</strong></p>
                          <span style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(a.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Users ─── */}
          {tab === 'users' && (
            <div className="card" style={{padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,gap:12,flexWrap:'wrap'}}>
                <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Manage Users ({users.length})</h3>
                <input className="form-input" style={{maxWidth:240}} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Location</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div className="avatar" style={{width:32,height:32,fontSize:13,background:'var(--primary-light)',color:'var(--primary)',flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div>
                            <span style={{fontWeight:600}}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{color:'var(--text-secondary)',fontSize:13}}>{u.email}</td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{u.location || '—'}</td>
                        <td><span className={`tag ${u.is_active ? 'tag-green' : 'tag-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleToggleUser(u.id)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                            <button className="btn btn-danger btn-sm"  onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="empty-state"><h3>No users found</h3></div>}
              </div>
            </div>
          )}

          {/* ─── Companies ─── */}
          {tab === 'companies' && (
            <div className="card" style={{padding:24}}>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:20}}>Manage Companies ({companies.length})</h3>
              <div style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead><tr><th>Company</th><th>Email</th><th>Industry</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {companies.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div className="avatar" style={{width:32,height:32,fontSize:13,background:'var(--primary-light)',color:'var(--primary)',flexShrink:0,borderRadius:8}}>{c.company_name?.[0]?.toUpperCase()}</div>
                            <span style={{fontWeight:600}}>{c.company_name}</span>
                          </div>
                        </td>
                        <td style={{color:'var(--text-secondary)',fontSize:13}}>{c.email}</td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{c.industry || '—'}</td>
                        <td><span className={`tag ${c.is_verified ? 'tag-green' : 'tag-yellow'}`}>{c.is_verified ? 'Verified' : 'Pending'}</span></td>
                        <td><span className={`tag ${c.is_active ? 'tag-green' : 'tag-red'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleVerifyCompany(c.id)}>{c.is_verified ? 'Unverify' : '✓ Verify'}</button>
                            <button className="btn btn-danger btn-sm"  onClick={() => handleDeleteCompany(c.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {companies.length === 0 && <div className="empty-state"><h3>No companies found</h3></div>}
              </div>
            </div>
          )}

          {/* ─── Jobs ─── */}
          {tab === 'jobs' && (
            <div className="card" style={{padding:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,gap:12,flexWrap:'wrap'}}>
                <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Manage Jobs ({jobs.length})</h3>
                <input className="form-input" style={{maxWidth:240}} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="data-table">
                  <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Location</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td style={{fontWeight:600}}>{j.title}</td>
                        <td style={{color:'var(--text-secondary)'}}>{j.company_name}</td>
                        <td><span className="tag tag-blue" style={{fontSize:11}}>{j.type}</span></td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{j.location || '—'}</td>
                        <td><span className={`tag ${j.is_active?'tag-green':'tag-gray'}`}>{j.is_active?'Active':'Hidden'}</span></td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(j.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleToggleJob(j.id)}>{j.is_active ? 'Hide' : 'Show'}</button>
                            <button className="btn btn-danger btn-sm"  onClick={() => handleDeleteJob(j.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length === 0 && <div className="empty-state"><h3>No jobs found</h3></div>}
              </div>
            </div>
          )}

          {/* ─── Reports ─── */}
          {tab === 'reports' && (
            <div className="reports-grid">
              {[
                { label:'Total Users',       val: stats?.total_users,    icon:'👥', color:'#2563EB' },
                { label:'Total Companies',   val: stats?.total_companies, icon:'🏢', color:'#16A34A' },
                { label:'Total Jobs Posted', val: stats?.total_jobs,      icon:'💼', color:'#D97706' },
                { label:'Total Applications',val: stats?.total_apps,      icon:'📋', color:'#9333EA' },
                { label:'Active Jobs',       val: stats?.active_jobs,     icon:'✅', color:'#0EA5E9' },
              ].map((r,i) => (
                <div key={i} className="card report-card" style={{padding:28,textAlign:'center'}}>
                  <div style={{fontSize:40,marginBottom:12}}>{r.icon}</div>
                  <div style={{fontSize:36,fontWeight:800,fontFamily:'var(--font-head)',color:r.color}}>{r.val?.toLocaleString() || 0}</div>
                  <div style={{fontSize:14,color:'var(--text-muted)',marginTop:4}}>{r.label}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
