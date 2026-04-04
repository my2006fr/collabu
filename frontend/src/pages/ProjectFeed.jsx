import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, getPosts, createPost, deletePost } from '../services/api'
import { useAuth } from '../services/AuthContext'
import Spinner from '../components/Spinner'
import { Avatar, Button, Alert } from '../components/FormComponents'
import {
  IconImage, IconVideo, IconMusic, IconFile, IconSpreadsheet, IconPaperclip,
  IconChat, IconGallery, IconPost,FILE_ICONS
} from '../components/Icons'

const FILE_ICON_MAP = {
  image:       <IconImage size={18}/>,
  video:       <IconVideo size={18}/>,
  audio:       <IconMusic size={18}/>,
  pdf:         <IconFile size={18}/>,
  spreadsheet: <IconSpreadsheet size={18}/>,
  file:        <IconPaperclip size={18}/>,
}

function formatBytes(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`
  return `${(b/1048576).toFixed(1)} MB`
}

export default function ProjectFeed() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [project, setProject]   = useState(null)
  const [posts,   setPosts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [posting, setPosting]   = useState(false)
  const [body,    setBody]      = useState('')
  const [files,   setFiles]     = useState([])    // File objects
  const [previews,setPreviews]  = useState([])    // { url, type, name, size }
  const [page,    setPage]      = useState(1)
  const [hasMore, setHasMore]   = useState(false)
  const [err,     setErr]       = useState('')
  const [msg,     setMsg]       = useState('')

  useEffect(() => {
    Promise.all([getProject(id), getPosts(id, 1)])
      .then(([pd, fd]) => {
        setProject(pd.project)
        setPosts(fd.posts)
        setHasMore(fd.page < fd.pages)
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function pickFiles(e) {
    const picked = Array.from(e.target.files)
    const newFiles    = [...files, ...picked]
    const newPreviews = picked.map(f => {
      const isImage = f.type.startsWith('image/')
      const isVideo = f.type.startsWith('video/')
      const isAudio = f.type.startsWith('audio/')
      const type    = isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'file'
      return { url: URL.createObjectURL(f), type, name: f.name, size: f.size }
    })
    setFiles(newFiles)
    setPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }

  function removeFile(idx) {
    URL.revokeObjectURL(previews[idx]?.url)
    setFiles(prev  => prev.filter((_,i) => i !== idx))
    setPreviews(prev => prev.filter((_,i) => i !== idx))
  }

  async function handlePost(e) {
    e.preventDefault()
    if (!body.trim() && files.length === 0) return
    setPosting(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('body', body)
      files.forEach(f => fd.append('files', f))
      const { post } = await createPost(id, fd)
      setPosts(prev => [post, ...prev])
      setBody(''); setFiles([]); setPreviews([])
      setMsg('Post published!')
      setTimeout(() => setMsg(''), 2500)
    } catch(e) { setErr(e.message) }
    finally { setPosting(false) }
  }

  async function handleDelete(postId) {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(id, postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch(e) { setErr(e.message) }
  }

  async function loadMore() {
    const next = page + 1
    try {
      const fd = await getPosts(id, next)
      setPosts(prev => [...prev, ...fd.posts])
      setPage(next)
      setHasMore(next < fd.pages)
    } catch(e) { setErr(e.message) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><Spinner/></div>

  return (
    <div style={{minHeight:'calc(100vh - 58px)',background:'var(--bg)',padding:'0'}}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate(`/projects/${id}`)} style={S.backBtn}>←</button>
        <div>
          <h2 style={S.headerTitle}>{project?.title}</h2>
          <p style={S.headerSub}>Project Feed</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={() => navigate(`/projects/${id}/chat`)}    style={S.tabBtn}><IconChat size={14} style={{marginRight:4}}/>Chat</button>
          <button onClick={() => navigate(`/projects/${id}/gallery`)} style={S.tabBtn}><IconGallery size={14} style={{marginRight:4}}/>Gallery</button>
          <button onClick={() => navigate(`/projects/${id}/board`)}   style={S.tabBtn}>🗂️ Board</button>
        </div>
      </div>

      <div style={{maxWidth:680,margin:'0 auto',width:'100%',padding:'clamp(12px,3vw,24px) clamp(10px,4vw,16px)'}}>
        {err && <div style={{marginBottom:12}}><Alert>{err}</Alert></div>}
        {msg && <div style={{marginBottom:12}}><Alert type="success">{msg}</Alert></div>}

        {/* Composer */}
        <form onSubmit={handlePost} style={S.composer}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <Avatar url={user?.avatar_url} name={user?.name||'?'} size={38}/>
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Share an update, progress note, or question with your team…"
              rows={3}
              style={S.composerInput}
            />
          </div>

          {/* File previews */}
          {previews.length > 0 && (
            <div style={S.previewGrid}>
              {previews.map((p, i) => (
                <div key={i} style={S.previewItem}>
                  {p.type === 'image' && (
                    <img src={p.url} alt="" style={S.previewImg}/>
                  )}
                  {p.type === 'video' && (
                    <video src={p.url} style={S.previewImg}/>
                  )}
                  {p.type === 'audio' && (
                    <div style={S.previewFile}>
                      <IconMusic size={28} color="var(--accent)"/>
                      <span style={{fontSize:11,color:'var(--txt2)'}}>{p.name}</span>
                    </div>
                  )}
                  {p.type === 'file' && (
                    <div style={S.previewFile}>
                      <span style={{fontSize:24}}>{FILE_ICONS.file}</span>
                      <span style={{fontSize:11,color:'var(--txt2)',wordBreak:'break-all'}}>{p.name}</span>
                    </div>
                  )}
                  <button type="button" onClick={() => removeFile(i)} style={S.removeBtn}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
            <div style={{display:'flex',gap:6}}>
              <input ref={fileRef} type="file" multiple style={{display:'none'}} onChange={pickFiles}
                accept="image/*,video/*,audio/*,.pdf,.xlsx,.xls,.csv,.docx,.txt,.zip"/>
              <button type="button" onClick={() => fileRef.current?.click()} style={S.attachBtn} title="Attach files">
                <IconPaperclip size={14} style={{marginRight:4}}/>Attach
              </button>
            </div>
            <Button type="submit" loading={posting} disabled={posting || (!body.trim() && files.length===0)}
              style={{padding:'8px 22px'}}>
              Post
            </Button>
          </div>
        </form>

        {/* Feed */}
        <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:20}}>
          {posts.length === 0 && (
            <div style={{textAlign:'center',padding:60,color:'var(--txt3)'}}>
              <div style={{marginBottom:12}}><IconPost size={48} color="var(--txt3)"/></div>
              <p>No posts yet. Share an update with your team!</p>
            </div>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} userId={user?.id}
              onDelete={() => handleDelete(post.id)}/>
          ))}
          {hasMore && (
            <div style={{textAlign:'center',paddingBottom:20}}>
              <Button variant="secondary" onClick={loadMore}>Load more</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, userId, onDelete }) {
  const isOwner = post.user_id === userId
  const images  = post.attachments.filter(a => a.file_type === 'image')
  const others  = post.attachments.filter(a => a.file_type !== 'image')

  return (
    <div style={S.postCard}>
      {/* Author */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <Avatar url={post.author?.avatar_url} name={post.author?.name||'?'} size={36}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:'var(--txt1)'}}>{post.author?.name}</div>
          <div style={{fontSize:11,color:'var(--txt3)'}}>{new Date(post.created_at).toLocaleString()}</div>
        </div>
        {isOwner && (
          <button onClick={onDelete}
            style={{background:'none',border:'none',color:'var(--danger)',fontSize:13,cursor:'pointer',padding:'4px 8px'}}>
            🗑
          </button>
        )}
      </div>

      {/* Body */}
      {post.body && (
        <p style={{fontSize:14,lineHeight:1.65,color:'var(--txt1)',whiteSpace:'pre-wrap',marginBottom:12}}>
          {post.body}
        </p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div style={imageGrid(images.length)}>
          {images.map(img => (
            <a key={img.id} href={img.file_url} target="_blank" rel="noreferrer">
              <img src={img.file_url} alt={img.file_name}
                style={{width:'100%',height:images.length===1?240:140,objectFit:'cover',borderRadius:8,display:'block'}}/>
            </a>
          ))}
        </div>
      )}

      {/* Other files */}
      {others.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:images.length?10:0}}>
          {others.map(att => (
            <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
              <div style={S.fileRow}>
                <span style={{fontSize:22}}>{FILE_ICON_MAP[att.file_type]||FILE_ICONS.file}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--txt1)',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{att.file_name}</div>
                  <div style={{fontSize:11,color:'var(--txt3)'}}>{formatBytes(att.file_size)}</div>
                </div>
                <span style={{color:'var(--accent-h)',fontSize:14}}>↗ Download</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Audio players */}
      {post.attachments.filter(a => a.file_type === 'audio').map(a => (
        <div key={a.id} style={{marginTop:8}}>
          <div style={{fontSize:11,color:'var(--txt3)',marginBottom:4}}>{a.file_name}</div>
          <audio src={a.file_url} controls style={{width:'100%'}}/>
        </div>
      ))}
    </div>
  )
}

const imageGrid = (count) => ({
  display: 'grid',
  gridTemplateColumns: count === 1 ? '1fr' : count === 2 ? '1fr 1fr' : 'repeat(auto-fit,minmax(100px,1fr))',
  gap: 4,
  marginBottom: 4,
})

const S = {
  header: {
    display:'flex', alignItems:'center', gap:12,
    padding:'12px 20px', borderBottom:'1px solid var(--border)',
    background:'var(--bg-card)', flexShrink:0, flexWrap:'wrap',
  },
  headerTitle: { fontFamily:'var(--font-d)', fontSize:16, fontWeight:800, margin:0 },
  headerSub:   { fontSize:12, color:'var(--txt3)', margin:0 },
  backBtn:     { background:'none', border:'none', color:'var(--txt2)', fontSize:18, cursor:'pointer', padding:'4px 8px' },
  tabBtn:      { background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--txt2)',
                 borderRadius:7, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:500 },
  composer: {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius)', padding:18,
  },
  composerInput: {
    flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border)',
    borderRadius:8, padding:'10px 14px', color:'var(--txt1)', fontSize:14,
    resize:'none', outline:'none', fontFamily:'var(--font-b)', lineHeight:1.5, width:'100%',
  },
  previewGrid: { display:'flex', gap:8, flexWrap:'wrap', marginTop:10 },
  previewItem: { position:'relative', flexShrink:0 },
  previewImg:  { width:100, height:80, objectFit:'cover', borderRadius:8, display:'block', border:'1px solid var(--border)' },
  previewFile: { width:100, height:80, background:'var(--bg-elevated)', borderRadius:8,
                 border:'1px solid var(--border)', display:'flex', flexDirection:'column',
                 alignItems:'center', justifyContent:'center', gap:4, padding:6, textAlign:'center' },
  removeBtn:   { position:'absolute', top:-6, right:-6, background:'var(--danger)', color:'#fff',
                 border:'none', borderRadius:'50%', width:18, height:18, fontSize:10,
                 cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  attachBtn:   { background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--txt2)',
                 borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer', fontWeight:500 },
  postCard: {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius)', padding:20,
  },
  fileRow: {
    display:'flex', alignItems:'center', gap:12, background:'var(--bg-elevated)',
    border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px',
  },
}
