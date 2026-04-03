import { useEffect } from 'react'

export default function Modal({ title, onClose, children, width=520 }) {
  useEffect(() => {
    const fn = e => e.key==='Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',
      backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',
          width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',animation:'popIn .18s ease',
          display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'18px 22px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <h3 style={{fontFamily:'var(--font-d)',fontSize:16,fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',color:'var(--txt2)',fontSize:18,
            width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <div style={{padding:'20px 22px',flex:1}}>{children}</div>
      </div>
    </div>
  )
}
