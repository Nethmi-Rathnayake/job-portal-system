// src/pages/Jobs/Jobs.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { jobsAPI, savedAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import JobCard from '../../components/JobCard/JobCard'
import './Jobs.css'

const JOB_TYPES = ['full-time','part-time','remote','contract','internship']
const EXP_LEVELS= ['entry','mid','senior','lead']

export default function Jobs() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [jobs,    setJobs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [saved,   setSaved]   = useState({})

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    location: searchParams.get('location') || '',
    type:     searchParams.get('type')     || '',
    experience_level: '',
  })
  const [searchInput, setSearchInput] = useState(filters.search)

  const totalPages = Math.ceil(total / 10)

  const fetchJobs = async (f = filters, p = page) => {
    setLoading(true)
    try {
      const res  = await jobsAPI.getAll({ ...f, page: p })
      const data = res.data.data
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [filters, page])

  useEffect(() => {
    if (user?.role === 'student') {
      savedAPI.getAll().then(res => {
        const map = {}
        res.data.data?.saved_jobs?.forEach(j => { map[j.id] = true })
        setSaved(map)
      }).catch(() => {})
    }
  }, [user])

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val }
    setFilters(updated); setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    handleFilter('search', searchInput)
  }

  const handleSave = async (jobId) => {
    if (!user) return
    try {
      if (saved[jobId]) {
        await savedAPI.unsave(jobId)
        setSaved(p => { const n={...p}; delete n[jobId]; return n })
      } else {
        await savedAPI.save(jobId)
        setSaved(p => ({ ...p, [jobId]: true }))
      }
    } catch {}
  }

  return (
    <div className="jobs-page">
      <div className="jobs-page-header">
        <div className="container">
          <h1>Find the right job for you</h1>
          <form className="jobs-search-bar" onSubmit={handleSearch}>
            <div className="search-field">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Job title, company or keyword" />
            </div>
            <div className="search-field">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 013.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5A4.5 4.5 0 018 1.5z" stroke="#94A3B8" strokeWidth="1.5"/></svg>
              <input value={filters.location} onChange={e => handleFilter('location', e.target.value)} placeholder="Location" />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container jobs-body">
        {/* Sidebar filters */}
        <aside className="jobs-sidebar">
          <div className="filter-section card">
            <h3>Filters</h3>
            <div className="filter-divider" />

            <div className="filter-group">
              <h4>Job Type</h4>
              {JOB_TYPES.map(t => (
                <label key={t} className="filter-checkbox">
                  <input type="checkbox" checked={filters.type === t} onChange={() => handleFilter('type', filters.type === t ? '' : t)} />
                  <span>{t.replace('-',' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </label>
              ))}
            </div>

            <div className="filter-divider" />

            <div className="filter-group">
              <h4>Experience Level</h4>
              {EXP_LEVELS.map(l => (
                <label key={l} className="filter-checkbox">
                  <input type="checkbox" checked={filters.experience_level === l} onChange={() => handleFilter('experience_level', filters.experience_level === l ? '' : l)} />
                  <span>{l.replace(/\b\w/g, c => c.toUpperCase())}</span>
                </label>
              ))}
            </div>

            {(filters.type || filters.experience_level || filters.search) && (
              <>
                <div className="filter-divider" />
                <button className="btn btn-ghost btn-sm w-full" onClick={() => { setFilters({search:'',location:'',type:'',experience_level:''}); setSearchInput(''); setPage(1) }}>
                  Clear all filters
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="jobs-results">
          <div className="results-header">
            <p className="results-count">
              Showing <strong>{jobs.length}</strong> of <strong>{total}</strong> results
            </p>
            <select className="form-select sort-select" onChange={e => {}}>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map(job => (
                <JobCard key={job.id} job={job}
                  onSave={user?.role === 'student' ? handleSave : null}
                  saved={!!saved[job.id]}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{fontSize:48, marginBottom:12}}>🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</button>
              {Array.from({length: Math.min(totalPages, 7)}, (_,i) => i+1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
