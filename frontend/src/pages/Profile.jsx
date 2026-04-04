import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  updateProfile, uploadAvatar, changePassword,
  saveGithubPat, removeGithubPat,
} from '../services/api'
import { useAuth } from '../services/AuthContext'
import { useTheme } from '../services/ThemeContext'
import { useLanguage } from '../services/LanguageContext'
import { FormGroup, Input, Textarea, Select, Button, Alert, Avatar, Badge } from '../components/FormComponents'
import { IconCheckCircleFilled, IconWarningFilled, IconInfoFilled } from '../components/Icons'

const TABS = ['profile','security','github','preferences']

export default function Profile() {
  const { user, refresh } = useAuth()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [tab,  setTab]  = useState('profile')
  const [msg,  setMsg]  = useState('')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  const [f, setF] = useState({
    name:            user?.name            || '',
    bio:             user?.bio             || '',
    skills:          user?.skills          || '',
    level:           user?.level           || 'beginner',
    github_username: user?.github_username || '',
    theme:           user?.theme           || 'dark',
    language:        localStorage.getItem('language') || user?.language || 'en',
  })
  const [pw, setPw]   = useState({ current_password:'', new_password:'' })
  const [pat, setPat] = useState('')

  const set    = e => setF(p=>({...p,[e.target.name]:e.target.value}))
  const setPw_ = e => setPw(p=>({...p,[e.target.name]:e.target.value}))

  function flash(m, isErr=false) {
    if (isErr) { setErr(m); setMsg('') } else { setMsg(m); setErr('') }
    setTimeout(() => { setMsg(''); setErr('') }, 3500)
  }

  async function saveProfile(e) {
    e.preventDefault(); setBusy(true)
    try {
      await updateProfile(f)
      setTheme(f.theme)
      setLang(f.language)
      await refresh()
      flash('Profile updated!')
    } catch(e) { flash(e.message, true) }
    finally { setBusy(false) }
  }

  async function handleAvatar(e) {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('avatar', file)
    setBusy(true)
    try { await uploadAvatar(fd); await refresh(); flash('Avatar updated!') }
    catch(e) { flash(e.message, true) }
    finally { setBusy(false) }
  }

  async function savePw(e) {
    e.preventDefault(); setBusy(true)
    try {
      await changePassword(pw)
      flash('Password updated!')
      setPw({ current_password:'', new_password:'' })
    } catch(e) { flash(e.message, true) }
    finally { setBusy(false) }
  }

  async function handleSavePat(e) {
    e.preventDefault(); setBusy(true)
    try {
      const d = await saveGithubPat(pat.trim())
      await refresh()
      setPat('')
      flash(`GitHub connected as @${d.github_username}!`)
    } catch(e) { flash(e.message, true) }
    finally { setBusy(false) }
  }

  async function handleRemovePat() {
    if (!confirm('Remove your GitHub PAT? You will be removed from auto-linking.')) return
    setBusy(true)
    try { await removeGithubPat(); await refresh(); flash('GitHub PAT removed.') }
    catch(e) { flash(e.message, true) }
    finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'var(--bg)', padding:'clamp(12px,3vw,28px) clamp(10px,4vw,16px)' }}>
      <div style={{ maxWidth:680, margin:'0 auto', width:'100%' }} className="fade-up">
        <h1 style={{ fontFamily:'var(--font-d)', fontSize:26, fontWeight:800, marginBottom:4 }}>Settings</h1>
        <p style={{ color:'var(--txt2)', fontSize:13, marginBottom:24 }}>
          Manage your account, skills, GitHub integration and preferences.
        </p>

        {/* Avatar card */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius)', padding:20, marginBottom:18,
          display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
        }}>
          <div style={{ position:'relative' }}>
            <Avatar url={user?.avatar_url} name={user?.name||'?'} size={70}/>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position:'absolute', bottom:0, right:0,
                background:'var(--accent)', border:'2px solid var(--bg)',
                color:'#fff', borderRadius:'50%', width:22, height:22,
                fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}
              title="Change avatar"
            >✏</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatar}/>
          <div>
            <p style={{ fontFamily:'var(--font-d)', fontSize:18, fontWeight:700, marginBottom:2 }}>{user?.name}</p>
            <p style={{ fontSize:13, color:'var(--txt2)', marginBottom:6 }}>{user?.email}</p>
            <div style={{ display:'flex', gap:6 }}>
              <Badge color="muted">{user?.level}</Badge>
              {user?.github_username && <Badge color="success">@{user.github_username}</Badge>}
              {user?.has_github_pat  && <Badge color="info">PAT ✓</Badge>}
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className='profile-tabs' style={{
          display:'flex', gap:2, marginBottom:18,
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:10, padding:4,
        }}>
          {TABS.map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)} style={{
              flex:1, padding:'7px 0', borderRadius:7, fontSize:13, fontWeight:600,
              border:'none', cursor:'pointer',
              background: tab===tabKey ? 'var(--accent)' : 'transparent',
              color:      tab===tabKey ? '#fff'          : 'var(--txt2)',
            }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {msg && <div style={{marginBottom:14}}><Alert type="success">{msg}</Alert></div>}
        {err && <div style={{marginBottom:14}}><Alert>{err}</Alert></div>}

        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius)', padding:26,
        }}>

          {/* ── Profile ── */}
          {tab==='profile' && (
            <form onSubmit={saveProfile} style={{display:'flex',flexDirection:'column',gap:16}}>
              <FormGroup label={t("Display Name")}>
                <Input name="name" value={f.name} onChange={set} required/>
              </FormGroup>
              <FormGroup label={t("Bio")}>
                <Textarea name="bio" value={f.bio} onChange={set}
                  placeholder="Tell others about yourself…" style={{minHeight:70}}/>
              </FormGroup>
              <FormGroup label={t("Skills")} hint="Comma-separated — used for task assignment matching">
                <Input name="skills" value={f.skills} onChange={set}
                  placeholder="Python, React, Machine Learning, UX Design…"/>
              </FormGroup>
              <FormGroup label={t("Experience Level")}>
                <Select name="level" value={f.level} onChange={set}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormGroup>
              <div style={{paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
                <Button type="submit" loading={busy} disabled={busy}>{t('Save Changes')}</Button>
              </div>
            </form>
          )}

          {/* ── Security ── */}
          {tab==='security' && (
            <form onSubmit={savePw} style={{display:'flex',flexDirection:'column',gap:16}}>
              <FormGroup label={t("Current Password")}>
                <Input type="password" name="current_password"
                  value={pw.current_password} onChange={setPw_} required/>
              </FormGroup>
              <FormGroup label={t("New Password")} hint="At least 6 characters">
                <Input type="password" name="new_password"
                  value={pw.new_password} onChange={setPw_} required minLength={6}/>
              </FormGroup>
              <div style={{paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
                <Button type="submit" loading={busy} disabled={busy}>{t('Update Password')}</Button>
              </div>
            </form>
          )}

          {/* ── GitHub ── */}
          {tab==='github' && (
            <div style={{display:'flex',flexDirection:'column',gap:20}}>

              {/* Status card */}
              <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',
                borderRadius:10,padding:16}}>
                {user?.github_username ? (
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <IconCheckCircleFilled size={32} color="var(--success)"/>
                    <div>
                      <p style={{fontSize:14,fontWeight:700,color:'var(--txt1)',marginBottom:2}}>
                        Connected as <strong>@{user.github_username}</strong>
                      </p>
                      <p style={{fontSize:12,color:'var(--txt2)'}}>
                        {user.has_github_pat
                          ? 'PAT saved — you will be auto-added to project repos when accepted as collaborator.'
                          : 'No PAT saved yet — add one below to enable auto GitHub invites.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <IconWarningFilled size={32} color="var(--warning)"/>
                    <p style={{fontSize:13,color:'var(--txt2)'}}>
                      Not connected. Add your GitHub username and PAT below.
                    </p>
                  </div>
                )}
              </div>

              {/* How it works */}
              <div style={{background:'rgba(124,106,255,.06)',border:'1px solid var(--accent-dim)',
                borderRadius:10,padding:14}}>
                <p style={{fontSize:12,fontWeight:700,color:'var(--accent-h)',marginBottom:6}}>
                  <IconInfoFilled size={14} style={{marginRight:5, verticalAlign:"middle"}}/>How GitHub integration works
                </p>
                <ul style={{fontSize:12,color:'var(--txt2)',paddingLeft:16,display:'flex',flexDirection:'column',gap:4}}>
                  <li>When you request to join a project, the platform uses the <strong>project owner's PAT</strong> to invite you as a GitHub collaborator.</li>
                  <li>Both you and the project owner need GitHub usernames set.</li>
                  <li>The owner needs their PAT to have <code style={{background:'var(--bg-elevated)',padding:'1px 5px',borderRadius:3}}>repo</code> scope.</li>
                  <li>Your PAT is encrypted and never exposed to other users.</li>
                </ul>
              </div>

              {/* Enter username */}
              <FormGroup label={t("GitHub Username")}>
                <Input name="github_username" value={f.github_username}
                  onChange={set} placeholder="your-github-username"/>
                <Button variant="secondary" style={{marginTop:8,alignSelf:'flex-start'}}
                  loading={busy} disabled={busy}
                  onClick={async()=>{
                    setBusy(true)
                    try{ await updateProfile({github_username:f.github_username}); await refresh(); flash('Username saved!') }
                    catch(e){ flash(e.message,true) }
                    finally{ setBusy(false) }
                  }}>
                  Save Username
                </Button>
              </FormGroup>

              {/* PAT input */}
              <form onSubmit={handleSavePat} style={{display:'flex',flexDirection:'column',gap:10}}>
                <FormGroup
                  label="Personal Access Token (PAT)"
                  hint="Create at github.com/settings/tokens → classic token → check 'repo' scope"
                >
                  <Input
                    type="password"
                    value={pat}
                    onChange={e=>setPat(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    autoComplete="new-password"
                  />
                </FormGroup>
                <div style={{display:'flex',gap:8}}>
                  <Button type="submit" loading={busy} disabled={busy||!pat.trim()}>
                    ✓ Verify & Save PAT
                  </Button>
                  {user?.has_github_pat && (
                    <Button type="button" variant="danger" onClick={handleRemovePat} disabled={busy}>
                      Remove PAT
                    </Button>
                  )}
                </div>
                <p style={{fontSize:11,color:'var(--txt3)'}}>
                  Your PAT is stored securely and only used server-side for GitHub API calls. It is never shown to other users.
                </p>
              </form>
            </div>
          )}

          {/* ── Preferences ── */}
          {tab==='preferences' && (
            <form onSubmit={saveProfile} style={{display:'flex',flexDirection:'column',gap:16}}>
              <FormGroup label={t("Theme")}>
                <Select name="theme" value={f.theme}
                  onChange={e=>{ set(e); setTheme(e.target.value) }}>
                  <option value="dark">🌙 Dark</option>
                  <option value="light">☀️ Light</option>
                </Select>
              </FormGroup>
              <FormGroup label={t("Language")}>
                <Select name="language" value={f.language} onChange={e=>{ set(e); setLang(e.target.value) }}>
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="zh">🇨🇳 中文</option>
                  <option value="ar">🇸🇦 العربية</option>
                </Select>
              </FormGroup>
              <div style={{paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
                <Button type="submit" loading={busy} disabled={busy}>{t('Save Preferences')}</Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
