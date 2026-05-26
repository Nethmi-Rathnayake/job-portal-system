// src/pages/JobDetail/JobDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { jobsAPI, appAPI, savedAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './JobDetail.css'

export default function JobDetail() {
  const { id }        = useParams()
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const [job,     setJob]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying,setApplying]= useState(false)
  const [applied, setApplied] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [cover,   setCover]   = useState('')
  const [msg,     setMsg]     = useState(null)

  useEffect(() => {
    jobsAPI.getById(id).then(res => {
      const j = res.data.data?.job
      setJob(j)
      setApplied(j?.applied || false)
      setSaved(j?.is_saved  || false)
    }).catch(() => navigate('/jobs')).finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!user) return navigate('/login', { state: { from: `/jobs/${id}` } })
    setApplying(true); setMsg(null)
    try {
      await appAPI.apply({ job_id: Number(id), cover_letter: cover })
      setApplied(true)
      setMsg({ type: 'success', text: 'Application submitted successfully! 🎉' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' })
    } finally { setApplying(false) }
  }

  const handleSave = async () => {
    if (!user) return navigate('/login')
    try {
      if (saved) { await savedAPI.unsave(id); setSaved(false) }
      else       { await savedAPI.save(Number(id)); setSaved(true) }
    } catch {}
  }

  if (loading) return <div className="page-loader" style={{minHeight:'50vh'}}><div className="spinner" /></div>
  if (!job)    return null

  const salary = job.salary_min ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max||job.salary_min).toLocaleString()}` : 'Not specified'

  return (
    <div className="job-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/jobs">Jobs</Link> <span>/</span>
          <span>{job.title}</span>
        </div>

        <div className="job-detail-grid">
          {/* Main */}
          <div className="job-detail-main">
            <div className="job-detail-card card">
              <div className="jd-header">
                <div className="jd-logo">
                  {job.logo
                    ? <img src={`http://localhost:8000/uploads/${job.logo}`} alt={job.company_name} />
                    : <span>{job.company_name?.[0]}</span>}
                </div>
                <div>
                  <h1 className="jd-title">{job.title}</h1>
                  <Link to={`/companies/${job.company_id}`} className="jd-company">{job.company_name}</Link>
                  <div className="jd-location">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5A3 3 0 013.5 4.5c0 2.5 3 6.5 3 6.5s3-4 3-6.5A3 3 0 016.5 1.5z" stroke="currentColor" strokeWidth="1.2"/></svg>
                    {job.location}
                  </div>
                </div>
              </div>

              <div className="jd-tags">
                <span className="tag tag-green">${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>
                <span className="tag tag-blue">{job.type?.replace('-',' ')}</span>
                {job.location?.toLowerCase().includes('remote') && <span className="tag tag-yellow">Remote</span>}
              </div>

              <div className="jd-actions">
                {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
                {user?.role === 'student' && (
                  applied
                    ? <button className="btn btn-success btn-lg" disabled>✓ Applied</button>
                    : (
                      <>
                        <textarea className="form-textarea" placeholder="Cover letter (optional)..." value={cover} onChange={e => setCover(e.target.value)} rows={3} style={{marginBottom:12}} />
                        <button className="btn btn-primary btn-lg" onClick={handleApply} disabled={applying}>
                          {applying ? 'Applying...' : 'Apply Now'}
                        </button>
                      </>
                    )
                )}
                {!user && <Link to="/login" className="btn btn-primary btn-lg">Login to Apply</Link>}
                <button className={`btn ${saved ? 'btn-outline' : 'btn-ghost'}`} onClick={handleSave} style={{gap:6}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill={saved?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5"><path d="M3 3a1 1 0 011-1h8a1 1 0 011 1v11l-5-3-5 3V3z"/></svg>
                  {saved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="card jd-section">
              <h2>Job Description</h2>
              <div className="jd-content" dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g,'<br/>') }} />
            </div>

            {job.requirements && (
              <div className="card jd-section">
                <h2>Requirements</h2>
                <div className="jd-content" dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g,'<br/>') }} />
              </div>
            )}

            {job.responsibilities && (
              <div className="card jd-section">
                <h2>Responsibilities</h2>
                <div className="jd-content" dangerouslySetInnerHTML={{ __html: job.responsibilities?.replace(/\n/g,'<br/>') }} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="job-detail-sidebar">
            <div className="card jd-overview">
              <h3>Job Overview</h3>
              <div className="overview-items">
                {[
                  { label: 'Job Type',    val: job.type,             icon: '💼' },
                  { label: 'Experience',  val: job.experience_level, icon: '📊' },
                  { label: 'Salary',      val: salary,               icon: '💰' },
                  { label: 'Location',    val: job.location,         icon: '📍' },
                  { label: 'Category',    val: job.category,         icon: '🏷️' },
                  { label: 'Deadline',    val: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open', icon: '📅' },
                ].filter(i => i.val).map((item) => (
                  <div key={item.label} className="overview-item">
                    <span className="overview-icon">{item.icon}</span>
                    <div>
                      <div className="overview-label">{item.label}</div>
                      <div className="overview-val">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card jd-overview" style={{marginTop:16}}>
              <h3>About Company</h3>
              <p style={{fontSize:14,color:'var(--text-secondary)',marginTop:8,lineHeight:1.6}}>
                {job.description?.slice(0,120)}...
              </p>
              <Link to={`/companies/${job.company_id}`} className="btn btn-outline btn-sm" style={{marginTop:14,width:'100%',justifyContent:'center'}}>
                View Company
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
