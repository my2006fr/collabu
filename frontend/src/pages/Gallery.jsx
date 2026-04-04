import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, getGallery } from '../services/api'
import Spinner from '../components/Spinner'
import { Alert } from '../components/FormComponents'

export default function Gallery() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [project, setProject]   = useState(null)
  const [images,  setImages]    = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected,setSelected]  = useState(null)
  const [err,     setErr]       = useState('')

  useEffect(() => {
    Promise.all([getProject(id), getGallery(id)])
      .then(([pd, gd]) => { setProject(pd.project); setImages(gd.images) })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><Spinner/></div>

  return (
    <div style={{minHeight:'calc(100vh - 58px)',background:'var(--bg)'}}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate(`/projects/${id}`)} style={S.backBtn}>←</button>
        <div>
          <h2 style={S.headerTitle}>{project?.title}</h2>
          <p style={S.headerSub}>Image Gallery · {images.length} image{images.length!==1?'s':''}</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={() => navigate(`/projects/${id}/chat`)} style={S.tabBtn}>💬 Chat</button>
          <button onClick={() => navigate(`/projects/${id}/feed`)} style={S.tabBtn}>📋 Feed</button>
          <button onClick={() => navigate(`/projects/${id}/board`)} style={S.tabBtn}>🗂️ Board</button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'clamp(12px,3vw,24px) clamp(10px,4vw,16px)'}}>
        {err && <Alert>{err}</Alert>}

        {images.length === 0 && (
          <div style={{textAlign:'center',padding:80,color:'var(--txt3)'}}>
            <div style={{fontSize:48,marginBottom:16}}>🖼️</div>
            <p style={{fontSize:15}}>No images yet.</p>
            <p style={{fontSize:13,marginTop:6}}>Images posted in the project feed will appear here.</p>
          </div>
        )}

        {/* Masonry-style grid */}
        <div style={S.grid} className='gallery-grid'>
          {images.map((img, i) => (
            <div key={img.id} onClick={() => setSelected(img)}
              style={{...S.gridItem, animationDelay:`${i*0.04}s`}} className="fade-up">
              <img src={img.file_url} alt={img.file_name}
                style={{width:'100%',height:'100%',objectFit:'cover',display:'block',
                  transition:'transform .2s'}}/>
              <div style={S.overlay}>
                <span style={{fontSize:12,color:'#fff',fontWeight:500,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'90%'}}>
                  {img.file_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.9)',zIndex:2000,
            display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,
            padding:20,cursor:'zoom-out'}}>
          <img src={selected.file_url} alt={selected.file_name}
            style={{maxWidth:'90vw',maxHeight:'80vh',objectFit:'contain',borderRadius:8,
              boxShadow:'0 8px 60px rgba(0,0,0,.8)'}}
            onClick={e => e.stopPropagation()}/>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <span style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>{selected.file_name}</span>
            <a href={selected.file_url} target="_blank" rel="noreferrer" download
              style={{fontSize:12,color:'var(--accent-h)',border:'1px solid var(--accent)',
                borderRadius:6,padding:'4px 12px',textDecoration:'none'}}
              onClick={e => e.stopPropagation()}>
              ↓ Download
            </a>
            <button onClick={() => setSelected(null)}
              style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',
                color:'#fff',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:12}}>
              ✕ Close
            </button>
          </div>
          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); const i=images.findIndex(x=>x.id===selected.id); setSelected(images[(i-1+images.length)%images.length]) }}
                style={S.navBtn('left')}>‹</button>
              <button
                onClick={e => { e.stopPropagation(); const i=images.findIndex(x=>x.id===selected.id); setSelected(images[(i+1)%images.length]) }}
                style={S.navBtn('right')}>›</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const S = {
  header: { display:'flex', alignItems:'center', gap:12, padding:'12px 20px',
    borderBottom:'1px solid var(--border)', background:'var(--bg-card)', flexWrap:'wrap' },
  headerTitle: { fontFamily:'var(--font-d)', fontSize:16, fontWeight:800, margin:0 },
  headerSub:   { fontSize:12, color:'var(--txt3)', margin:0 },
  backBtn:     { background:'none', border:'none', color:'var(--txt2)', fontSize:18, cursor:'pointer', padding:'4px 8px' },
  tabBtn:      { background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--txt2)',
                 borderRadius:7, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:500 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:6 },
  gridItem: {
    aspectRatio:'1', borderRadius:10, overflow:'hidden', cursor:'zoom-in',
    position:'relative', background:'var(--bg-elevated)',
    border:'1px solid var(--border)',
  },
  overlay: {
    position:'absolute', bottom:0, left:0, right:0,
    background:'linear-gradient(transparent,rgba(0,0,0,.7))',
    padding:'20px 8px 8px',
    opacity:0,
    transition:'opacity .15s',
    display:'flex', alignItems:'flex-end',
  },
  navBtn: side => ({
    position:'fixed', top:'50%', transform:'translateY(-50%)',
    [side]: 20,
    background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
    color:'#fff', borderRadius:8, width:44, height:44, fontSize:28,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
  }),
}
