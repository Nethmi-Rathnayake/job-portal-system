// src/pages/About/About.jsx
export default function About() {
  return (
    <div style={{padding:'64px 0'}}>
      <div className="container" style={{maxWidth:800,textAlign:'center'}}>
        <h1 style={{fontFamily:'var(--font-head)',fontSize:40,fontWeight:800,marginBottom:16}}>About JobPortal</h1>
        <p style={{fontSize:17,color:'var(--text-secondary)',lineHeight:1.8,marginBottom:40}}>
          JobPortal is a modern job platform connecting talented professionals with top companies across Sri Lanka and beyond.
          Built with a mission to make hiring simpler, faster, and fairer.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {[['🎯','Our Mission','Connect every professional with the right opportunity.'],
            ['👁️','Our Vision','Become the No.1 career platform in South Asia.'],
            ['💙','Our Values','Transparency, speed, and fairness in every interaction.']
          ].map(([icon,title,desc],i) => (
            <div key={i} className="card" style={{padding:28,textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>{icon}</div>
              <h3 style={{fontFamily:'var(--font-head)',fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.6}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
