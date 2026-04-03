export default function Spinner({ fullPage=false, size=32 }) {
  const s = {
    width:size, height:size,
    border:`3px solid var(--border)`,
    borderTop:`3px solid var(--accent)`,
    borderRadius:'50%',
    animation:'spin .7s linear infinite',
    flexShrink:0,
  }
  if (fullPage) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={s}/>
    </div>
  )
  return <div style={s}/>
}
