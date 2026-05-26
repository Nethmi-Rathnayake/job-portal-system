// src/pages/Home/Home.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { jobsAPI, companiesAPI } from '../../services/api'
import JobCard from '../../components/JobCard/JobCard'
import './Home.css'

const WHY_CARDS = [
  { icon: '🏢', title: 'Trusted Companies',  desc: 'Work with verified and top recruiting companies.' },
  { icon: '⚡', title: 'Fast Applications',  desc: 'Apply in seconds and get hired faster.' },
  { icon: '📈', title: 'Career Growth',       desc: 'Find opportunities that help you grow.' },
  { icon: '🔍', title: 'Easy Job Search',     desc: 'Smart search to find the perfect job for you.' },
]
const TESTIMONIALS = [
  { text: 'JobPortal helped me find my dream job in just 2 weeks! The platform is amazing.', name: 'Sarah Johnson', role: 'UI Designer at Spotify' },
  { text: 'I received multiple interviews from top companies. Highly recommended!',          name: 'Michael Brown', role: 'Frontend Developer at Google' },
  { text: 'The easiest job portal I have ever used. Clean design and easy to apply.',        name: 'Emily Davis',   role: 'Product Manager at Amazon' },
]
const TOP_COMPANIES = ['Google','Microsoft','Amazon','Spotify','Airbnb','Slack']

export default function Home() {
  const [featuredJobs, setFeatured] = useState([])
  const [companies,    setCompanies]= useState([])
  const [loading,      setLoading]  = useState(true)
  const [search,       setSearch]   = useState('')
  const [location,     setLocation] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      jobsAPI.getFeatured(5),
      companiesAPI.getAll({ page: 1 }),
    ]).then(([jRes, cRes]) => {
      setFeatured(jRes.data.data?.jobs || [])
      setCompanies(cRes.data.data?.companies?.slice(0, 6) || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`)
  }

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <div className="hero-badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9 4 10.5l.5-3.5L2 4.5 5.5 4z" fill="#2563EB"/></svg>
              No.1 Job Platform
            </div>

            <h1 className="hero-title">
              Find Your <span className="hero-highlight">Dream Job</span> Today
            </h1>
            <p className="hero-sub">
              Connect with top companies and discover thousands of opportunities tailored for you.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Job title, company or keyword"
                />
              </div>
              <div className="search-divider" />
              <div className="search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 013.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5A4.5 4.5 0 018 1.5z" stroke="#94A3B8" strokeWidth="1.5"/></svg>
                <input
                  value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Location"
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">Search Jobs</button>
            </form>

            <div className="hero-ctas">
              <Link to="/jobs" className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9h6M9 6l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Find Jobs
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Post a Job
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat"><strong>10K+</strong><span>Jobs Posted</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>5K+</strong><span>Companies</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>50K+</strong><span>Job Seekers</span></div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="hero-illustration fade-up-1">
            <div className="hero-illus-bg">
              <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Screen / laptop */}
                <rect x="60" y="60" width="280" height="180" rx="14" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="2"/>
                <rect x="60" y="60" width="280" height="36" rx="14" fill="#2563EB"/>
                <circle cx="80" cy="78" r="5" fill="rgba(255,255,255,.4)"/>
                <circle cx="96" cy="78" r="5" fill="rgba(255,255,255,.4)"/>
                <circle cx="112" cy="78" r="5" fill="rgba(255,255,255,.4)"/>
                {/* Search bar */}
                <rect x="80" y="110" width="240" height="32" rx="8" fill="#fff" stroke="#DBEAFE" strokeWidth="1.5"/>
                <circle cx="100" cy="126" r="7" fill="none" stroke="#94A3B8" strokeWidth="1.5"/>
                <line x1="105" y1="131" x2="109" y2="135" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="112" y="120" width="80" height="12" rx="4" fill="#E2E8F0"/>
                {/* Job cards */}
                <rect x="80" y="154" width="110" height="72" rx="8" fill="#fff" stroke="#DBEAFE" strokeWidth="1.5"/>
                <rect x="90" y="164" width="28" height="28" rx="7" fill="#EFF6FF"/>
                <rect x="125" y="167" width="50" height="8" rx="4" fill="#E2E8F0"/>
                <rect x="125" y="180" width="35" height="6" rx="3" fill="#DBEAFE"/>
                <rect x="90" y="200" width="30" height="16" rx="5" fill="#2563EB"/>
                <rect x="125" y="200" width="55" height="16" rx="5" fill="#EFF6FF"/>

                <rect x="210" y="154" width="110" height="72" rx="8" fill="#fff" stroke="#DBEAFE" strokeWidth="1.5"/>
                <rect x="220" y="164" width="28" height="28" rx="7" fill="#FEF3C7"/>
                <rect x="255" y="167" width="50" height="8" rx="4" fill="#E2E8F0"/>
                <rect x="255" y="180" width="35" height="6" rx="3" fill="#FEF3C7"/>
                <rect x="220" y="200" width="30" height="16" rx="5" fill="#D97706"/>
                <rect x="255" y="200" width="55" height="16" rx="5" fill="#FEF3C7"/>

                {/* Person */}
                <circle cx="310" cy="190" r="24" fill="#FDE8D8"/>
                <rect x="284" y="214" width="52" height="60" rx="10" fill="#2563EB"/>
                {/* Plant */}
                <rect x="54" y="248" width="12" height="32" rx="3" fill="#92400E"/>
                <ellipse cx="60" cy="230" rx="18" ry="22" fill="#16A34A" opacity=".9"/>
                <ellipse cx="48" cy="245" rx="12" ry="14" fill="#16A34A"/>
                <ellipse cx="72" cy="245" rx="12" ry="14" fill="#16A34A"/>
              </svg>
              {/* Floating cards */}
              <div className="float-card float-card-1">
                <span>🎉</span> 500+ New Jobs Today
              </div>
              <div className="float-card float-card-2">
                <span>✅</span> Profile 75% Complete
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Jobs</h2>
              <p className="section-sub">Explore the latest opportunities from top companies</p>
            </div>
            <Link to="/jobs" className="view-all-link">
              View all jobs
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : featuredJobs.length > 0 ? (
            <div className="jobs-grid">
              {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state"><h3>No jobs available yet</h3><p>Check back soon for new opportunities.</p></div>
          )}
        </div>
      </section>

      {/* ── Top Companies ── */}
      <section className="section companies-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top Companies</h2>
              <p className="section-sub">Work with the world's leading organisations</p>
            </div>
            <Link to="/companies" className="view-all-link">
              View all companies
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
          <div className="companies-logos">
            {TOP_COMPANIES.map((name) => {
              const colors = { Google:'#4285F4', Microsoft:'#00A4EF', Amazon:'#FF9900', Spotify:'#1DB954', Airbnb:'#FF5A5F', Slack:'#4A154B' }
              return (
                <div key={name} className="company-logo-pill">
                  <span className="company-logo-dot" style={{ background: colors[name] + '20', color: colors[name] }}>
                    {name[0]}
                  </span>
                  <span>{name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="section why-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-sub">Everything you need to land your dream job</p>
          </div>
          <div className="why-grid">
            {WHY_CARDS.map((card, i) => (
              <div key={i} className="why-card card">
                <div className="why-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-sub">Success stories from job seekers and employers</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div className="quote-icon">❝</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: `hsl(${i*60+200},60%,90%)`, color: `hsl(${i*60+200},60%,40%)` }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Find Your Next Opportunity?</h2>
            <p>Join thousands of professionals who found their dream jobs through JobPortal.</p>
            <div className="cta-btns">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/jobs"     className="btn btn-outline btn-lg" style={{borderColor:'rgba(255,255,255,.4)', color:'#fff'}}>Browse Jobs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
