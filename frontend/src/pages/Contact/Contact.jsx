// src/pages/Contact/Contact.jsx
import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', message:'' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{padding:'64px 0'}}>
      <div className="container" style={{maxWidth:600}}>
        <h1 style={{fontFamily:'var(--font-head)',fontSize:36,fontWeight:800,marginBottom:8,textAlign:'center'}}>Contact Us</h1>
        <p style={{color:'var(--text-secondary)',textAlign:'center',marginBottom:40}}>Have a question? We'd love to hear from you.</p>
        {sent ? (
          <div className="alert alert-success" style={{textAlign:'center',padding:24}}>
            ✅ Message sent! We'll get back to you within 24 hours.
          </div>
        ) : (
          <div className="card" style={{padding:32}}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can we help?" required/>
              </div>
              <button type="submit" className="btn btn-primary w-full">Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
