import { useState, useEffect, useRef } from 'react'
import {
  getFeed, createFeedPost, deleteFeedPost, editFeedPost,
  toggleLike, getFeedComments, addFeedComment, deleteFeedComment,
} from '../services/api'
import { useAuth } from '../services/AuthContext'
import { getSocket, joinGlobalFeed } from '../services/socket'
import Spinner from '../components/Spinner'
import { Avatar, Button, Alert, Badge } from '../components/FormComponents'

const FILE_ICONS = { image:'🖼️', video:'🎬', audio:'🎵', pdf:'📄', spreadsheet:'📊', file:'📎' }
const fmt = b => !b ? '' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`
const ago = iso => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

export default function GlobalFeed() {
  const { user }        = useAuth()
  const fileRef         = useRef()
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [body,    setBody]    = useState('')
  const [files,   setFiles]   = useState([])
  const [previews,setPreviews]= useState([])
  const [posting, setPosting] = useState(false)
  const [err,     setErr]     = useState('')

  // ── Load feed ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getFeed(1).then(d => {
      setPosts(d.posts); setHasMore(d.page < d.pages)
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [])

  // ── Real-time socket ───────────────────────────────────────────────────────
  useEffect(() => {
    joinGlobalFeed()
    const sock = getSocket()
    if (!sock) return

    const onNewPost = post => {
      if (post.user_id !== user?.id)            // avoid duplicate — we already inserted
        setPosts(prev => [post, ...prev])
    }
    const onLike = ({ post_id, likes_count }) => {
      setPosts(prev => prev.map(p =>
        p.id === post_id ? { ...p, likes_count } : p
      ))
    }
    const onComment = ({ post_id }) => {
      setPosts(prev => prev.map(p =>
        p.id === post_id ? { ...p, comments_count: (p.comments_count||0) + 1 } : p
      ))
    }

    sock.on('new_global_post', onNewPost)
    sock.on('post_liked',      onLike)
    sock.on('new_post_comment',onComment)
    return () => {
      sock.off('new_global_post', onNewPost)
      sock.off('post_liked',      onLike)
      sock.off('new_post_comment',onComment)
    }
  }, [user?.id])

  // ── File picking ───────────────────────────────────────────────────────────
  function pickFiles(e) {
    const picked = Array.from(e.target.files)
    setFiles(prev => [...prev, ...picked])
    setPreviews(prev => [...prev, ...picked.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'file',
      name: f.name, size: f.size,
    }))])
    e.target.value = ''
  }
  function removeFile(i) {
    URL.revokeObjectURL(previews[i]?.url)
    setFiles(p => p.filter((_,x) => x !== i))
    setPreviews(p => p.filter((_,x) => x !== i))
  }

  // ── Submit post ────────────────────────────────────────────────────────────
  async function handlePost(e) {
    e.preventDefault()
    if (!body.trim() && !files.length) return
    setPosting(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('body', body)
      files.forEach(f => fd.append('files', f))
      const { post } = await createFeedPost(fd)
      setPosts(prev => [post, ...prev])   // optimistic insert
      setBody(''); setFiles([]); setPreviews([])
    } catch(e) { setErr(e.message) }
    finally { setPosting(false) }
  }

  async function loadMore() {
    const next = page + 1
    try {
      const d = await getFeed(next)
      setPosts(prev => [...prev, ...d.posts])
      setPage(next); setHasMore(next < d.pages)
    } catch(e) { setErr(e.message) }
  }

  // ── Like ───────────────────────────────────────────────────────────────────
  async function handleLike(postId) {
    try {
      const { liked } = await toggleLike(postId)
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, liked_by_me: liked, likes_count: liked ? p.likes_count+1 : p.likes_count-1 }
        : p))
    } catch {}
  }

  // ── Delete post ────────────────────────────────────────────────────────────
  async function handleDelete(postId) {
    if (!confirm('Delete this post?')) return
    try { await deleteFeedPost(postId); setPosts(prev => prev.filter(p => p.id !== postId)) }
    catch(e) { setErr(e.message) }
  }

  // ── Share (copy link) ──────────────────────────────────────────────────────
  function handleShare(postId) {
    const url = `${window.location.origin}/feed#post-${postId}`
    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'))
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <h1 style={{ fontFamily:'var(--font-d)', fontSize:26, fontWeight:800, marginBottom:20 }}>
          Community Feed
        </h1>

        {err && <div style={{marginBottom:12}}><Alert>{err}</Alert></div>}

        {/* ── Composer ── */}
        <form onSubmit={handlePost} style={S.composer}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <Avatar url={user?.avatar_url} name={user?.name||'?'} size={40} />
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Share an idea, update, or resource with the community…"
              rows={3} style={S.composerInput}
            />
          </div>

          {previews.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
              {previews.map((p,i) => (
                <div key={i} style={{ position:'relative' }}>
                  {p.type==='image'
                    ? <img src={p.url} alt="" style={S.thumb}/>
                    : <div style={S.fileThumb}><span style={{fontSize:22}}>{FILE_ICONS.file}</span><span style={{fontSize:11}}>{p.name.slice(0,16)}</span></div>
                  }
                  <button type="button" onClick={()=>removeFile(i)} style={S.removeBtn}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
            <div style={{ display:'flex', gap:8 }}>
              <input ref={fileRef} type="file" multiple style={{display:'none'}} onChange={pickFiles}
                accept="image/*,video/*,audio/*,.pdf,.xlsx,.xls,.csv,.docx,.txt,.zip"/>
              <button type="button" onClick={()=>fileRef.current?.click()} style={S.attachBtn}>📎 Attach</button>
            </div>
            <Button type="submit" loading={posting} disabled={posting||(!body.trim()&&!files.length)}
              style={{padding:'8px 24px'}}>
              Post
            </Button>
          </div>
        </form>

        {/* ── Feed ── */}
        {loading && <div style={{display:'flex',justifyContent:'center',padding:60}}><Spinner/></div>}

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:16 }}>
          {posts.map(post => (
            <PostCard
              key={post.id} post={post} userId={user?.id}
              onLike={() => handleLike(post.id)}
              onDelete={() => handleDelete(post.id)}
              onShare={() => handleShare(post.id)}
            />
          ))}
        </div>

        {hasMore && (
          <div style={{textAlign:'center', marginTop:20, paddingBottom:40}}>
            <Button variant="secondary" onClick={loadMore}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PostCard ───────────────────────────────────────────────────────────────────
function PostCard({ post, userId, onLike, onDelete, onShare }) {
  const [expanded, setExpanded]     = useState(false)
  const [comments,  setComments]    = useState([])
  const [loadingC,  setLoadingC]    = useState(false)
  const [commentBox,setCommentBox]  = useState('')
  const [replyTo,   setReplyTo]     = useState(null)
  const [editing,   setEditing]     = useState(false)
  const [editBody,  setEditBody]    = useState(post.body)
  const [saving,    setSaving]      = useState(false)
  const isOwner = post.user_id === userId

  const images = post.attachments?.filter(a => a.file_type==='image') || []
  const others = post.attachments?.filter(a => a.file_type!=='image') || []

  async function loadComments() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (comments.length) return
    setLoadingC(true)
    try { const d = await getFeedComments(post.id); setComments(d.comments) }
    catch {}
    finally { setLoadingC(false) }
  }

  async function submitComment(e) {
    e.preventDefault()
    const body = commentBox.trim(); if (!body) return
    try {
      const { comment } = await addFeedComment(post.id, { body, parent_id: replyTo?.id || null })
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id ? { ...c, replies: [...(c.replies||[]), comment] } : c
        ))
      } else {
        setComments(prev => [...prev, { ...comment, replies:[] }])
      }
      setCommentBox(''); setReplyTo(null)
    } catch {}
  }

  async function delComment(cid) {
    try { await deleteFeedComment(cid); setComments(prev => prev.filter(c => c.id !== cid)) }
    catch {}
  }

  async function saveEdit(e) {
    e.preventDefault(); setSaving(true)
    try { await editFeedPost(post.id, { body: editBody }); setEditing(false); post.body = editBody }
    catch {}
    finally { setSaving(false) }
  }

  return (
    <div id={`post-${post.id}`} style={S.card}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <Avatar url={post.author?.avatar_url} name={post.author?.name||'?'} size={40}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--txt1)' }}>{post.author?.name}</div>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:2 }}>
            {post.author?.level && <Badge color="muted">{post.author.level}</Badge>}
            <span style={{ fontSize:11, color:'var(--txt3)' }}>{ago(post.created_at)}</span>
            {post.edited_at && <span style={{ fontSize:10, color:'var(--txt3)' }}>· edited</span>}
          </div>
        </div>
        {isOwner && (
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => setEditing(!editing)} style={S.iconBtn} title="Edit">✏️</button>
            <button onClick={onDelete} style={S.iconBtn} title="Delete">🗑</button>
          </div>
        )}
      </div>

      {/* Body / edit */}
      {editing ? (
        <form onSubmit={saveEdit} style={{ marginBottom:12 }}>
          <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={3}
            style={{ ...S.composerInput, marginBottom:8 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <Button type="submit" loading={saving} disabled={saving} style={{padding:'6px 16px',fontSize:13}}>Save</Button>
            <Button type="button" variant="secondary" style={{padding:'6px 16px',fontSize:13}}
              onClick={()=>setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize:14, lineHeight:1.7, color:'var(--txt1)', whiteSpace:'pre-wrap', marginBottom:12 }}>
          {post.body}
        </p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div style={{
          display:'grid',
          gridTemplateColumns: images.length===1 ? '1fr' : images.length===2 ? '1fr 1fr' : 'repeat(3,1fr)',
          gap:4, marginBottom:12, borderRadius:10, overflow:'hidden',
        }}>
          {images.map(img => (
            <a key={img.id} href={img.file_url} target="_blank" rel="noreferrer">
              <img src={img.file_url} alt={img.file_name} style={{
                width:'100%', height: images.length===1 ? 280 : 160,
                objectFit:'cover', display:'block',
              }}/>
            </a>
          ))}
        </div>
      )}

      {/* Other attachments */}
      {others.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
          {others.map(att => (
            <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
              <div style={S.fileRow}>
                <span style={{fontSize:22}}>{FILE_ICONS[att.file_type]||FILE_ICONS.file}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:'var(--txt1)',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{att.file_name}</div>
                  <div style={{fontSize:11, color:'var(--txt3)'}}>{fmt(att.file_size)}</div>
                </div>
                <span style={{color:'var(--accent-h)', fontSize:13, flexShrink:0}}>↗</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display:'flex', gap:0, borderTop:'1px solid var(--border)', paddingTop:10, marginTop:2 }}>
        <ActionBtn
          onClick={onLike}
          icon="👍"
          label={`Like${post.likes_count > 0 ? ` · ${post.likes_count}` : ''}`}
          color="var(--accent)"
          active={post.liked_by_me}
        />
        <ActionBtn
          onClick={loadComments}
          icon="💬"
          label={`Comment${post.comments_count > 0 ? ` · ${post.comments_count}` : ''}`}
        />
        <ActionBtn onClick={onShare} icon="🔗" label="Share" />
      </div>

      {/* Comments section */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, marginTop:10 }}>
          {loadingC && <Spinner size={20}/>}

          {comments.map(c => (
            <CommentItem key={c.id} c={c} userId={userId}
              onReply={() => setReplyTo(replyTo?.id===c.id ? null : c)}
              onDelete={() => delComment(c.id)}
            />
          ))}

          {/* Compose comment */}
          <form onSubmit={submitComment} style={{ display:'flex', gap:8, marginTop:10, alignItems:'flex-end' }}>
            <Avatar url={userId ? undefined : undefined} name="?" size={28}/>
            <div style={{ flex:1 }}>
              {replyTo && (
                <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:4 }}>
                  Replying to <strong>{replyTo.author?.name}</strong>
                  <button type="button" onClick={()=>setReplyTo(null)}
                    style={{background:'none',border:'none',color:'var(--danger)',marginLeft:8,cursor:'pointer',fontSize:11}}>
                    ✕
                  </button>
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <input value={commentBox} onChange={e=>setCommentBox(e.target.value)}
                  placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'}
                  style={{
                    flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border)',
                    borderRadius:20, padding:'8px 14px', color:'var(--txt1)', fontSize:13,
                    outline:'none', fontFamily:'var(--font-b)',
                  }}/>
                <Button type="submit" disabled={!commentBox.trim()} style={{padding:'7px 16px',fontSize:12}}>
                  Send
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, icon, label, active, color }) {
  return (
    <button onClick={onClick} style={{
      flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
      background:'none', border:'none', cursor:'pointer',
      color: active ? (color||'var(--accent)') : 'var(--txt2)',
      fontWeight: active ? 700 : 500,
      fontSize:13, padding:'6px 4px', borderRadius:7,
      transition:'all .15s',
    }}>
      <span>{icon}</span>{label}
    </button>
  )
}

function CommentItem({ c, userId, onReply, onDelete }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
        <Avatar url={c.author?.avatar_url} name={c.author?.name||'?'} size={28}/>
        <div style={{ flex:1 }}>
          <div style={{
            background:'var(--bg-elevated)', borderRadius:12, padding:'8px 12px',
            border:'1px solid var(--border)',
          }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--txt1)' }}>{c.author?.name} </span>
            <span style={{ fontSize:13, color:'var(--txt2)' }}>{c.body}</span>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:4, paddingLeft:4 }}>
            <button onClick={onReply} style={S.miniBtn}>↩ Reply</button>
            {c.user_id===userId && <button onClick={onDelete} style={{...S.miniBtn,color:'var(--danger)'}}>Delete</button>}
            <span style={{ fontSize:10, color:'var(--txt3)', alignSelf:'center' }}>{ago(c.created_at)}</span>
          </div>
          {c.replies?.length > 0 && (
            <div style={{ marginLeft:12, marginTop:6, display:'flex', flexDirection:'column', gap:6,
              borderLeft:'2px solid var(--border)', paddingLeft:10 }}>
              {c.replies.map(r => (
                <div key={r.id} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                  <Avatar url={r.author?.avatar_url} name={r.author?.name||'?'} size={22}/>
                  <div style={{
                    background:'var(--bg-card)', borderRadius:10, padding:'6px 10px',
                    border:'1px solid var(--border)', flex:1,
                  }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--txt1)' }}>{r.author?.name} </span>
                    <span style={{ fontSize:12, color:'var(--txt2)' }}>{r.body}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const S = {
  composer: {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius)', padding:18, marginBottom:4,
  },
  composerInput: {
    flex:1, background:'var(--bg-elevated)', border:'1px solid var(--border)',
    borderRadius:10, padding:'10px 14px', color:'var(--txt1)', fontSize:14,
    resize:'none', outline:'none', fontFamily:'var(--font-b)', lineHeight:1.5, width:'100%',
  },
  thumb: { width:80, height:70, objectFit:'cover', borderRadius:8, display:'block', border:'1px solid var(--border)' },
  fileThumb: {
    width:80, height:70, background:'var(--bg-elevated)', borderRadius:8,
    border:'1px solid var(--border)', display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', gap:3, padding:4, textAlign:'center',
  },
  removeBtn: {
    position:'absolute', top:-5, right:-5, background:'var(--danger)', color:'#fff',
    border:'none', borderRadius:'50%', width:16, height:16, fontSize:9,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
  },
  attachBtn: {
    background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--txt2)',
    borderRadius:8, padding:'7px 13px', fontSize:13, cursor:'pointer', fontWeight:500,
  },
  card: {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius)', padding:20,
  },
  iconBtn: {
    background:'none', border:'none', cursor:'pointer', fontSize:15,
    padding:'3px 6px', borderRadius:6, color:'var(--txt3)',
  },
  fileRow: {
    display:'flex', alignItems:'center', gap:12, background:'var(--bg-elevated)',
    border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px',
  },
  miniBtn: {
    background:'none', border:'none', color:'var(--txt3)',
    fontSize:11, cursor:'pointer', padding:0, fontWeight:500,
  },
}
