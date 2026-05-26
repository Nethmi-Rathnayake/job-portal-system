// src/pages/Companies/Companies.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import './Companies.css'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)

  const fetchCompanies = (q = search, p = page) => {
    setLoading(true)
    companiesAPI.getAll({ search: q, page: p })
      .then(res => {
        setCompanies(res.data.data?.companies || [])
        setTotal(res.data.data?.total || 0)
      }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCompanies() }, [page])

  const handleSearch = e => {
    e.preventDefault()
    setPage(1)
    fetchCompanies(search, 1)
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="companies-page">
      <div className="companies-header">
        <div className="container">
          <h1>Top Companies</h1>
          <p>Discover and connect with leading organisations hiring right now</p>
          <form className="companies-search" onSubmit={handleSearch}>
            <div className="search-field">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies by name or industry..." />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={{padding:'40px 24px 64px'}}>
        <p style={{fontSize:14, color:'var(--text-muted)', marginBottom:24}}>
          Showing <strong>{companies.length}</strong> of <strong>{total}</strong> companies
        </p>

        {loading ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : companies.length > 0 ? (
          <div className="companies-grid">
            {companies.map(c => {
              const initials = (c.company_name || 'C')[0].toUpperCase()
              const colors   = ['#2563EB','#16A34A','#D97706','#9333EA','#DC2626','#0EA5E9']
              const color    = colors[(c.company_name?.charCodeAt(0) || 0) % colors.length]
              return (
                <Link to={`/companies/${c.id}`} key={c.id} className="company-card card">
                  <div className="company-card-logo" style={{background: c.logo ? 'transparent' : color+'18', color}}>
                    {c.logo
                      ? <img src={`http://localhost:8000/uploads/${c.logo}`} alt={c.company_name}/>
                      : initials}
                  </div>
                  <div className="company-card-body">
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <h3 className="company-card-name">{c.company_name}</h3>
                      {c.is_verified === 1 && (
                        <span className="verified-pill">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8.5 2.5L4 7.5 1.5 5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="company-card-industry">{c.industry || 'Company'}</p>
                    {c.location && (
                      <p className="company-card-location">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1A3 3 0 003 4c0 2.5 3 7 3 7s3-4.5 3-7A3 3 0 006 1z" stroke="currentColor" strokeWidth="1.2"/></svg>
                        {c.location}
                      </p>
                    )}
                    <div className="company-card-footer">
                      <span className="tag tag-blue">{c.job_count || 0} open jobs</span>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer" className="company-website-link" onClick={e => e.stopPropagation()}>
                          Visit →
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div style={{fontSize:48,marginBottom:12}}>🏢</div>
            <h3>No companies found</h3>
            <p>Try a different search term</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>←</button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
              <button key={p} className={page===p?'active':''} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>→</button>
          </div>
        )}
      </div>
    </div>
  )
}
