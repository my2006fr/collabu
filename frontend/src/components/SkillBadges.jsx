export default function SkillBadges({ skills, highlight=[] }) {
  if (!skills) return null
  const list = skills.split(',').map(s=>s.trim()).filter(Boolean)
  const hl   = new Set(highlight.map(s=>s.toLowerCase()))
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
      {list.map(s => {
        const matched = hl.has(s.toLowerCase())
        return (
          <span key={s} style={{
            fontSize:11,padding:'3px 9px',borderRadius:5,fontWeight:600,
            background: matched ? 'rgba(34,201,122,.15)' : 'var(--bg-elevated)',
            color:      matched ? 'var(--success)'       : 'var(--txt2)',
            border:     `1px solid ${matched ? 'rgba(34,201,122,.3)' : 'var(--border)'}`,
          }}>{s}</span>
        )
      })}
    </div>
  )
}
