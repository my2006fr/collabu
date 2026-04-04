import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProjects } from '../services/api'
import { useAuth } from '../services/AuthContext'
import Spinner from '../components/Spinner'
import { Button, Alert, Avatar, Badge } from '../components/FormComponents'
import SkillBadges from '../components/SkillBadges'
import { IconSearch, IconRocket } from '../components/Icons'

const METHOD_COLOR = { Scrum:'accent', Agile:'info', Kanban:'success', Waterfall:'warning', XP:'danger', Lean:'muted', Other:'muted' }

export default function Dashboard() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all') // all | mine | joined

  useEffect(() => {
    getProjects().then(d=>setProjects(d.projects)).catch(e=>setError(e.message)).finally(()=>setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.required_skills||'').toLowerCase().includes(q)
    const matchF = filter==='all' ? true : filter==='mine' ? p.owner_id===user?.id : (p.collaborators||[]).some(c=>c.user_id===user?.id)
    return matchQ && matchF
  })

  return (
    <div style={{minHeight:'calc(100vh - 56px)',background:'var(--bg)',padding:'clamp(12px,3vw,28px) clamp(10px,4vw,24px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}} className="fade-up">

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontFamily:'var(--font-d)',fontSize:'clamp(22px,5vw,30px)',fontWeight:800}}>Projects</h1>
            <p style={{color:'var(--txt2)',fontSize:14,marginTop:3}}>Hey {user?.name?.split(' ')[0]} — discover or start a collaboration</p>
          </div>
          <Button onClick={()=>navigate('/projects/new')}>+ New Project</Button>
        </div>

        {/* Search + filter */}
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',overflowX:'auto',paddingBottom:4}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects, skills…"
            style={{flex:1,minWidth:220,background:'var(--bg-card)',border:'1px solid var(--border)',
              borderRadius:8,padding:'9px 14px',color:'var(--txt1)',fontSize:14,outline:'none'}}/>
          {['all','mine','joined'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,border:'1px solid var(--border)',
                background: filter===f ? 'var(--accent)' : 'var(--bg-card)',
                color:      filter===f ? '#fff'          : 'var(--txt2)',cursor:'pointer'}}>
              {f==='all'?'All Projects':f==='mine'?'My Projects':'Joined'}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
          {[
            {label:'Total',  val:projects.length},
            {label:'Mine',   val:projects.filter(p=>p.owner_id===user?.id).length},
            {label:'Active', val:projects.filter(p=>p.status==='active').length},
          ].map(({label,val})=>(
            <div key={label} style={{background:'var(--bg-card)',border:'1px solid var(--border)',
              borderRadius:10,padding:'8px 14px',display:'flex',flexDirection:'column',gap:2}}>
              <span style={{fontFamily:'var(--font-d)',fontSize:22,fontWeight:800,color:'var(--accent-h)'}}>{val}</span>
              <span className='stat-label' style={{fontSize:11,color:'var(--txt3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px'}}>{label}</span>
            </div>
          ))}
        </div>

        {loading && <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner/></div>}
        {error   && <Alert>{error}</Alert>}

        {!loading && !error && filtered.length===0 && (
          <div style={{textAlign:'center',padding:60}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
              <IconSearch size={44} color="var(--txt3)" />
            </div>
            <p style={{color:'var(--txt2)'}}>{search?'No matching projects.':'No projects yet — create one!'}</p>
            {!search && <Button onClick={()=>navigate('/projects/new')} style={{marginTop:16}}>Create First Project</Button>}
          </div>
        )}

        <div className='card-grid'>
          {filtered.map(p=><ProjectCard key={p.id} p={p} uid={user?.id}/>)}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ p, uid }) {
  const isOwner = p.owner_id === uid
  return (
    <Link to={`/projects/${p.id}`} style={{textDecoration:'none',display:'block'}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',
        overflow:'hidden',transition:'border-color .15s,transform .15s',cursor:'pointer',
        height:'100%',display:'flex',flexDirection:'column'}}>

        {p.cover_image_url && (
          <div style={{height:120,overflow:'hidden'}}>
            <img src={p.cover_image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
        )}

        <div style={{padding:18,flex:1,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <Badge color={METHOD_COLOR[p.methodology]||'muted'}>{p.methodology}</Badge>
            {isOwner && <Badge color="success">Owner</Badge>}
            {p.status!=='active' && <Badge color="warning">{p.status}</Badge>}
          </div>

          <h3 style={{fontFamily:'var(--font-d)',fontSize:15,fontWeight:700,color:'var(--txt1)',lineHeight:1.3}}>{p.title}</h3>
          <p style={{fontSize:13,color:'var(--txt2)',lineHeight:1.5,
            display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {p.description}
          </p>

          {p.required_skills && <SkillBadges skills={p.required_skills}/>}

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            marginTop:'auto',paddingTop:10,borderTop:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <Avatar url={p.owner?.avatar_url} name={p.owner?.name||'?'} size={20}/>
              <span style={{fontSize:12,color:'var(--txt3)'}}>{p.owner?.name}</span>
            </div>
            <span style={{fontSize:12,color:'var(--accent-h)',fontWeight:600}}>View →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
