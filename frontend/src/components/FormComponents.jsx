export function FormGroup({ label, error, hint, children }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:'var(--txt2)',letterSpacing:'.4px',textTransform:'uppercase'}}>{label}</label>}
      {children}
      {hint  && <span style={{fontSize:12,color:'var(--txt3)'}}>{hint}</span>}
      {error && <span style={{fontSize:12,color:'var(--danger)'}}>{error}</span>}
    </div>
  )
}

const inputBase = {
  background:'var(--bg-elevated)', border:'1px solid var(--border)',
  borderRadius:'var(--radius-sm)', color:'var(--txt1)',
  padding:'11px 14px', fontSize:14, width:'100%', outline:'none', minHeight:42,
  transition:'border-color .15s',
}

export function Input({ style, ...p  }) { return <input  style={{...inputBase,...style}} {...p}/> }
export function Textarea({style,...p}) { return <textarea style={{...inputBase,...style,resize:'vertical',minHeight:90,fontFamily:'var(--font-b)'}} {...p}/> }
export function Select({style,children,...p}) { return <select style={{...inputBase,...style}} {...p}>{children}</select> }

export function Button({ variant='primary', style, loading, children, ...p }) {
  const variants = {
    primary:   {background:'var(--accent)',   color:'#fff'},
    secondary: {background:'var(--bg-elevated)',color:'var(--txt1)',border:'1px solid var(--border)'},
    danger:    {background:'rgba(255,92,106,.12)',color:'var(--danger)',border:'1px solid rgba(255,92,106,.3)'},
    ghost:     {background:'transparent',     color:'var(--txt2)'},
    success:   {background:'rgba(34,201,122,.12)',color:'var(--success)',border:'1px solid rgba(34,201,122,.3)'},
  }
  return (
    <button style={{padding:'10px 20px',borderRadius:'var(--radius-sm)',fontSize:14,fontWeight:600,
      cursor:p.disabled?'not-allowed':'pointer',opacity:p.disabled?.6:1,transition:'all .15s',border:'none',
      display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,touchAction:'manipulation',...variants[variant],...style}} {...p}>
      {loading ? <span style={{width:14,height:14,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .6s linear infinite',display:'inline-block'}}/> : children}
    </button>
  )
}

export function Alert({ type='error', children }) {
  const t = {
    error:   {background:'rgba(255,92,106,.1)',   color:'var(--danger)',  border:'1px solid rgba(255,92,106,.25)'},
    success: {background:'rgba(34,201,122,.1)',   color:'var(--success)', border:'1px solid rgba(34,201,122,.25)'},
    info:    {background:'rgba(56,189,248,.1)',   color:'var(--info)',    border:'1px solid rgba(56,189,248,.25)'},
    warning: {background:'rgba(245,166,35,.1)',   color:'var(--warning)', border:'1px solid rgba(245,166,35,.25)'},
  }
  return <div style={{padding:'11px 15px',borderRadius:'var(--radius-sm)',fontSize:13,fontWeight:500,...t[type]}}>{children}</div>
}

export function Badge({ color='accent', children, style }) {
  const cols = {
    accent:  {bg:'var(--accent-dim)',    txt:'var(--accent-h)'},
    success: {bg:'rgba(34,201,122,.12)', txt:'#22c97a'},
    warning: {bg:'rgba(245,166,35,.12)', txt:'#f5a623'},
    danger:  {bg:'rgba(255,92,106,.12)', txt:'#ff5c6a'},
    info:    {bg:'rgba(56,189,248,.12)', txt:'#38bdf8'},
    muted:   {bg:'var(--bg-elevated)',   txt:'var(--txt2)'},
  }
  const c = cols[color] || cols.muted
  return (
    <span style={{display:'inline-block',padding:'2px 9px',borderRadius:5,fontSize:11,
      fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      background:c.bg,color:c.txt,...style}}>
      {children}
    </span>
  )
}

export function Avatar({ url, name='?', size=32 }) {
  if (url) return <img src={url} alt={name}
    style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid var(--border)'}}/>
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'var(--accent-dim)',
      color:'var(--accent-h)',display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'var(--font-d)',fontWeight:800,fontSize:size*.38,flexShrink:0}}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
