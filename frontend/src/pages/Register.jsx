import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuth } from '../services/AuthContext'
import { FormGroup, Input, Select, Button, Alert } from '../components/FormComponents'
import { IconHexLogo } from '../components/Icons'

export default function Register() {
  const { storeAuth } = useAuth()
  const navigate      = useNavigate()
  const [f, setF]     = useState({ name:'', email:'', password:'', skills:'', level:'beginner' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = e => setF(p=>({...p,[e.target.name]:e.target.value}))

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const d = await register(f); storeAuth(d.token, d.refresh_token, d.user); navigate('/dashboard') }
    catch(e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div style={S.page}>
      <div style={S.box} className="fade-up">
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:6}}>
            <IconHexLogo size={42} color="var(--accent)" />
          </div>
          <h1 style={{fontFamily:'var(--font-d)',fontSize:26,fontWeight:800,marginTop:6}}>Join CollabU</h1>
          <p style={{color:'var(--txt2)',fontSize:13,marginTop:4}}>University students only — .edu emails</p>
        </div>
        <form onSubmit={submit} style={S.form}>
          {err && <Alert>{err}</Alert>}
          <FormGroup label="Full Name">
            <Input name="name" placeholder="Jane Doe" value={f.name} onChange={set} required/>
          </FormGroup>
          <FormGroup label="University Email">
            <Input type="email" name="email" placeholder="you@university.edu"
              value={f.email} onChange={set} required/>
          </FormGroup>
          <FormGroup label="Password">
            <Input type="password" name="password" placeholder="Min. 6 characters"
              value={f.password} onChange={set} required minLength={6}/>
          </FormGroup>
          <FormGroup label="Skills" hint="Comma-separated, e.g. Python, React, ML">
            <Input name="skills" placeholder="Python, React, Machine Learning"
              value={f.skills} onChange={set}/>
          </FormGroup>
          <FormGroup label="Experience Level">
            <Select name="level" value={f.level} onChange={set}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </FormGroup>
          <Button type="submit" loading={busy} disabled={busy} style={{width:'100%',marginTop:4}}>
            Create Account
          </Button>
        </form>
        <p style={{textAlign:'center',marginTop:18,color:'var(--txt2)',fontSize:13}}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
const S = {
  page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
    background:'var(--bg)',padding:'24px 14px'},
  box:{width:'100%',maxWidth:420,minWidth:0},
  form:{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',
    padding:'clamp(18px,4vw,28px) clamp(16px,4vw,28px)',display:'flex',flexDirection:'column',gap:15},
}
