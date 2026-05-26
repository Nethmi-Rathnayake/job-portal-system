// src/components/JobCard/JobCard.jsx
import { Link } from 'react-router-dom'
import './JobCard.css'

const TYPE_COLORS = {
  'full-time':  'tag-blue',
  'part-time':  'tag-yellow',
  'remote':     'tag-green',
  'contract':   'tag-gray',
  'internship': 'tag-blue',
}

export default function JobCard({ job, onSave, saved }) {
  const logo = job.logo
    ? `http://localhost:8000/uploads/${job.logo}`
    : null

  const salary = job.salary_min
    ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max || job.salary_min).toLocaleString()}`
    : 'Salary not specified'

  const initials = (job.company_name || 'C')[0].toUpperCase()
  const colors   = ['#2563EB','#16A34A','#D97706','#9333EA','#DC2626','#0EA5E9']
  const color    = colors[(job.company_name?.charCodeAt(0) || 0) % colors.length]

  return (
    <div className="job-card card">
      <div className="job-card-header">
        <div className="job-logo" style={{ background: logo ? 'transparent' : color + '18', color }}>
          {logo ? <img src={logo} alt={job.company_name} /> : initials}
        </div>
        <div className="job-card-meta">
          <span className="job-company">{job.company_name}</span>
          {job.is_verified && (
            <span className="verified-badge" title="Verified Company">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L5 9 2 6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
        </div>
        {onSave && (
          <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={() => onSave(job.id)} title={saved ? 'Unsave' : 'Save'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3a1 1 0 011-1h8a1 1 0 011 1v11l-5-3-5 3V3z"/>
            </svg>
          </button>
        )}
      </div>

      <Link to={`/jobs/${job.id}`} className="job-title">{job.title}</Link>

      <div className="job-info">
        <span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5A3 3 0 013.5 4.5c0 2.5 3 6.5 3 6.5s3-4 3-6.5A3 3 0 016.5 1.5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2"/></svg>
          {job.location || 'Remote'}
        </span>
        <span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 4v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="job-salary">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 3.5v6M4.5 5.5h3a1 1 0 010 2h-2a1 1 0 000 2H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        {salary}
      </div>

      <div className="job-card-footer">
        <span className={`tag ${TYPE_COLORS[job.type] || 'tag-gray'}`}>
          {job.type?.replace('-', ' ')}
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          Apply Now
        </Link>
      </div>
    </div>
  )
}
