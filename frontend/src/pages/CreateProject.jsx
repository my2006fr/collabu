import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, uploadCover } from '../services/api'
import { FormGroup, Input, Textarea, Select, Button, Alert } from '../components/FormComponents'

const METHODS = ['Agile','Scrum','Kanban','Waterfall','XP','Lean','Other']

export default function CreateProject() {
  const navigate = useNavigate()
  const [f, setF] = useState({title:'',description:'',required_skills:'',github_repo_link:'',methodology:'Agile'})
  const [coverFile, setCoverFile] = useState(null)
  const [preview, setPreview]     = useState('')
  const [err, setErr]   = useState('')
  const [busy, setBusy] = useState(false)
  const set = e => setF(p=>({...p,[e.target.name]:e.target.value}))

  function pickCover(e) {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const { project } = await createProject(f)
      if (coverFile) {
        const fd = new FormData(); fd.append('cover', coverFile)
        await uploadCover(project.id, fd)
      }
      navigate(`/projects/${project.id}`)
    } catch(e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div style={{minHeight:'calc(100vh - 58px)',background:'var(--bg)',padding:'28px 24px'}}>
      <div style={{maxWidth:680,margin:'0 auto'}} className="fade-up">
        <button onClick={()=>navigate('/dashboard')}
          style={{background:'none',border:'none',color:'var(--txt2)',fontSize:13,marginBottom:20,cursor:'pointer'}}>
          ← Back
        </button>
        <h1 style={{fontFamily:'var(--font-d)',fontSize:28,fontWeight:800,marginBottom:4}}>Create a Project</h1>
        <p style={{color:'var(--txt2)',fontSize:14,marginBottom:24}}>Post your idea and find collaborators</p>

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:28}}>
          {err && <div style={{marginBottom:16}}><Alert>{err}</Alert></div>}
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:18}}>

            {/* Cover image */}
            <FormGroup label="Cover Image (optional)">
              <label style={{cursor:'pointer',display:'block'}}>
                <input type="file" accept="image/*" onChange={pickCover} style={{display:'none'}}/>
                {preview
                  ? <img src={preview} alt="" style={{width:'100%',height:160,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)'}}/>
                  : <div style={{height:100,border:'2px dashed var(--border)',borderRadius:8,display:'flex',
                      alignItems:'center',justifyContent:'center',color:'var(--txt3)',fontSize:13}}>
                      Click to upload cover image
                    </div>
                }
              </label>
            </FormGroup>

            <FormGroup label="Project Title *">
              <Input name="title" placeholder="e.g. AI Study Assistant" value={f.title} onChange={set} required/>
            </FormGroup>
            <FormGroup label="Description *">
              <Textarea name="description" placeholder="Describe your project, goals, what you're building…"
                value={f.description} onChange={set} required style={{minHeight:110}}/>
            </FormGroup>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <FormGroup label="Required Skills" hint="Comma-separated">
                <Input name="required_skills" placeholder="Python, React, NLP" value={f.required_skills} onChange={set}/>
              </FormGroup>
              <FormGroup label="Methodology">
                <Select name="methodology" value={f.methodology} onChange={set}>
                  {METHODS.map(m=><option key={m}>{m}</option>)}
                </Select>
              </FormGroup>
            </div>
            <FormGroup label="GitHub Repository URL *" hint="e.g. https://github.com/username/repo">
              <Input name="github_repo_link" placeholder="https://github.com/username/repo"
                value={f.github_repo_link} onChange={set} required/>
            </FormGroup>

            <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
              <Button type="button" variant="secondary" onClick={()=>navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" loading={busy} disabled={busy}>Create Project</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
