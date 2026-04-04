import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProject, getChatMessages, sendChatMessage,
  sendChatFile, editChatMessage, deleteChatMessage
} from '../services/api'

import { useAuth } from '../services/AuthContext'
import Spinner from '../components/Spinner'
import { Avatar, Button, Alert } from '../components/FormComponents'
import {
  IconImage, IconVideo, IconMusic, IconFile, IconSpreadsheet, IconPaperclip,
  IconChat, IconGallery, IconPost,
} from '../components/Icons'
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../services/socket'

const FILE_ICONS = {
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

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  const d   = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString()
}

export default function Chat() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)
  const inputRef  = useRef(null)

  const [project,  setProject]  = useState(null)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [text,     setText]     = useState('')
  const [replyTo,  setReplyTo]  = useState(null)   // message object
  const [editMsg,  setEditMsg]  = useState(null)   // message object being edited
  const [preview,  setPreview]  = useState(null)   // { file, url, type }
  const [err,      setErr]      = useState('')
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)
  const [loadMore, setLoadMore] = useState(false)

  // ── Load project + messages ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getProject(id), getChatMessages(id, 1)])
      .then(([pd, md]) => {
        setProject(pd.project)
        setMessages(md.messages)
        setHasMore(md.page < md.pages)
        setPage(1)
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!loadMore) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Real-time socket ────────────────────────────────────────────────────
  useEffect(() => {
    joinProjectRoom(id)
    const sock = getSocket()
    if (!sock) return
    const onMsg = msg => {
      // Only add if it's not from current user (we insert optimistically)
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id)
        if (exists) return prev
        if (msg.parent_id) {
          return prev.map(m =>
            m.id === msg.parent_id
              ? { ...m, replies: [...(m.replies||[]), msg] }
              : m
          )
        }
        return [...prev, msg]
      })
    }
    sock.on('new_chat_message', onMsg)
    return () => { sock.off('new_chat_message', onMsg); leaveProjectRoom(id) }
  }, [id])

  // ── Load older messages ──────────────────────────────────────────────────
  async function fetchOlder() {
    if (!hasMore || loadMore) return
    setLoadMore(true)
    try {
      const next = page + 1
      const md   = await getChatMessages(id, next)
      setMessages(prev => [...md.messages, ...prev])
      setPage(next)
      setHasMore(next < md.pages)
    } catch(e) { setErr(e.message) }
    finally { setLoadMore(false) }
  }

  // ── File pick ────────────────────────────────────────────────────────────
  function pickFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')
    let type = 'file'
    if (isImage) type = 'image'
    else if (isVideo) type = 'video'
    else if (isAudio) type = 'audio'
    setPreview({ file, url: URL.createObjectURL(file), type, name: file.name, size: file.size })
    e.target.value = ''
  }

  function clearPreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  async function handleSend(e) {
    e?.preventDefault()
    if (sending) return
    const body = text.trim()
    if (!body && !preview) return

    setSending(true); setErr('')
    try {
      let result
      if (preview) {
        const fd = new FormData()
        fd.append('file', preview.file)
        if (body)             fd.append('body', body)
        if (replyTo?.id)      fd.append('parent_id', replyTo.id)
        result = await sendChatFile(id, fd)
      } else {
        result = await sendChatMessage(id, { body, parent_id: replyTo?.id || null })
      }
      const newMsg = { ...result.message, replies: result.message.replies || [] }
      if (replyTo) {
        // Attach reply to parent
        setMessages(prev => prev.map(m =>
          m.id === replyTo.id
            ? { ...m, replies: [...(m.replies||[]), newMsg] }
            : m
        ))
      } else {
        setMessages(prev => [...prev, newMsg])
      }
      setText(''); clearPreview(); setReplyTo(null)
      inputRef.current?.focus()
    } catch(e) { setErr(e.message) }
    finally { setSending(false) }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  async function handleEdit(e) {
    e?.preventDefault()
    const body = text.trim()
    if (!body || !editMsg) return
    setSending(true)
    try {
      const { message } = await editChatMessage(id, editMsg.id, { body })
      setMessages(prev => prev.map(m => m.id === editMsg.id ? { ...m, ...message } : m))
      setText(''); setEditMsg(null)
    } catch(e) { setErr(e.message) }
    finally { setSending(false) }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(mid) {
    try {
      await deleteChatMessage(id, mid)
      setMessages(prev => prev.filter(m => m.id !== mid))
    } catch(e) { setErr(e.message) }
  }

  // ── Start edit mode ──────────────────────────────────────────────────────
  function startEdit(msg) {
    setEditMsg(msg); setText(msg.body); setReplyTo(null)
    inputRef.current?.focus()
  }

  function cancelEdit() { setEditMsg(null); setText(''); }

  // ── Key handler ──────────────────────────────────────────────────────────
  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      editMsg ? handleEdit() : handleSend()
    }
    if (e.key === 'Escape') { cancelEdit(); setReplyTo(null) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:80}}><Spinner/></div>

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <button onClick={() => navigate(`/projects/${id}`)} style={S.backBtn}>←</button>
        <div>
          <h2 style={S.headerTitle}>{project?.title}</h2>
          <p style={S.headerSub}>Project Chat</p>
        </div>
        <div className='chat-header-tabs' style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={() => navigate(`/projects/${id}/feed`)} style={S.tabBtn}><IconPost size={15} style={{marginRight:5}}/>Feed</button>
          <button onClick={() => navigate(`/projects/${id}/gallery`)} style={S.tabBtn}><IconGallery size={15} style={{marginRight:5}}/>Gallery</button>
          <button onClick={() => navigate(`/projects/${id}/board`)} style={S.tabBtn}>🗂️ Board</button>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div style={S.messageArea}>
        {/* Load older */}
        {hasMore && (
          <div style={{textAlign:'center',padding:'8px 0'}}>
            <button onClick={fetchOlder} disabled={loadMore}
              style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',
                color:'var(--txt2)',borderRadius:8,padding:'6px 18px',fontSize:12,cursor:'pointer'}}>
              {loadMore ? 'Loading…' : '↑ Load older messages'}
            </button>
          </div>
        )}

        {err && <div style={{padding:'8px 16px'}}><Alert>{err}</Alert></div>}

        {messages.length === 0 && (
          <div style={{textAlign:'center',padding:60,color:'var(--txt3)'}}>
            <div style={{marginBottom:12}}><IconChat size={48} color="var(--txt3)"/></div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Group messages by date */}
        <MessageList
          messages={messages}
          userId={user?.id}
          onReply={m => { setReplyTo(m); setEditMsg(null); inputRef.current?.focus() }}
          onEdit={startEdit}
          onDelete={handleDelete}
        />

        <div ref={bottomRef}/>
      </div>

      {/* ── Composer ── */}
      <div style={S.composer} className='chat-composer'>
        {/* Reply banner */}
        {replyTo && (
          <div style={S.replyBanner}>
            <span style={{fontSize:12,color:'var(--txt2)'}}>
              ↩ Replying to <strong>{replyTo.author?.name}</strong>:&nbsp;
              {replyTo.body?.slice(0,60)}{replyTo.body?.length>60?'…':''}
              {!replyTo.body && replyTo.file_name}
            </span>
            <button onClick={()=>setReplyTo(null)} style={S.cancelBtn}>✕</button>
          </div>
        )}

        {/* Edit banner */}
        {editMsg && (
          <div style={{...S.replyBanner, borderLeft:'3px solid var(--warning)'}}>
            <span style={{fontSize:12,color:'var(--warning)'}}>✏️ Editing message</span>
            <button onClick={cancelEdit} style={S.cancelBtn}>✕</button>
          </div>
        )}

        {/* File preview */}
        {preview && (
          <div style={S.previewBox}>
            {preview.type === 'image' && (
              <img src={preview.url} alt="" style={{maxHeight:100,maxWidth:180,borderRadius:6,objectFit:'cover'}}/>
            )}
            {preview.type === 'video' && (
              <video src={preview.url} style={{maxHeight:80,maxWidth:160,borderRadius:6}} controls/>
            )}
            {preview.type === 'audio' && (
              <audio src={preview.url} controls style={{height:36}}/>
            )}
            {!['image','video','audio'].includes(preview.type) && (
              <div style={S.fileChip}>
                <span style={{fontSize:20}}>{FILE_ICONS.file}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--txt1)'}}>{preview.name}</div>
                  <div style={{fontSize:11,color:'var(--txt3)'}}>{formatBytes(preview.size)}</div>
                </div>
              </div>
            )}
            <button onClick={clearPreview} style={S.cancelBtn}>✕</button>
          </div>
        )}

        {/* Input row */}
        <div style={S.inputRow}>
          <input ref={fileRef} type="file" style={{display:'none'}} onChange={pickFile}
            accept="image/*,video/*,audio/*,.pdf,.xlsx,.xls,.csv,.docx,.txt,.zip"/>
          <button onClick={() => fileRef.current?.click()} style={S.attachBtn} title="Attach file">
            📎
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={editMsg ? 'Edit message…' : replyTo ? 'Write a reply…' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
            rows={1}
            style={S.textInput}
          />
          <Button
            onClick={editMsg ? handleEdit : handleSend}
            loading={sending}
            disabled={sending || (!text.trim() && !preview)}
            style={{flexShrink:0,padding:'10px 18px'}}>
            {editMsg ? '✓ Save' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── MessageList ───────────────────────────────────────────────────────────────
function MessageList({ messages, userId, onReply, onEdit, onDelete }) {
  let lastDate = ''
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2,padding:'8px 16px'}}>
      {messages.map(msg => {
        const dateLabel = formatDate(msg.created_at)
        const showDate  = dateLabel !== lastDate
        lastDate = dateLabel
        return (
          <div key={msg.id}>
            {showDate && (
              <div style={{textAlign:'center',margin:'16px 0 8px',display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:1,background:'var(--border)'}}/>
                <span style={{fontSize:11,color:'var(--txt3)',fontWeight:600}}>{dateLabel}</span>
                <div style={{flex:1,height:1,background:'var(--border)'}}/>
              </div>
            )}
            <MessageBubble msg={msg} userId={userId}
              onReply={onReply} onEdit={onEdit} onDelete={onDelete}/>
          </div>
        )
      })}
    </div>
  )
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, userId, onReply, onEdit, onDelete, isReply=false }) {
  const [hover, setHover]   = useState(false)
  const isMine = msg.user_id === userId

  return (
    <div style={{...bubbleWrap(isMine, isReply)}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>

      {/* Avatar — show for others */}
      {!isMine && !isReply && (
        <Avatar url={msg.author?.avatar_url} name={msg.author?.name||'?'} size={30}/>
      )}

      <div style={{flex:1, maxWidth: isReply ? '100%' : 'min(520px, 75%)'}}>
        {/* Name + time */}
        {!isMine && (
          <div style={{fontSize:11,fontWeight:600,color:'var(--accent-h)',marginBottom:3}}>
            {msg.author?.name}
          </div>
        )}

        {/* Bubble */}
        <div style={bubble(isMine)}>
          {/* Text */}
          {msg.body && (
            <p style={{fontSize:14,lineHeight:1.5,whiteSpace:'pre-wrap',margin:0,
              color: isMine ? '#fff' : 'var(--txt1)'}}>
              {msg.body}
            </p>
          )}
          {/* File attachment */}
          {msg.file_url && <FileAttachment msg={msg} isMine={isMine}/>}
          {/* Time + edited */}
          <div style={{display:'flex',gap:6,alignItems:'center',marginTop:4,justifyContent:'flex-end'}}>
            {msg.edited_at && <span style={{fontSize:10,opacity:.6}}>edited</span>}
            <span style={{fontSize:10,opacity:.65}}>{formatTime(msg.created_at)}</span>
          </div>
        </div>

        {/* Action bar on hover */}
        {hover && !isReply && (
          <div style={actionBar(isMine)}>
            <ActionBtn label="↩ Reply"  onClick={() => onReply(msg)}/>
            {isMine && msg.body && <ActionBtn label="✏️ Edit" onClick={() => onEdit(msg)}/>}
            {isMine && <ActionBtn label="🗑" onClick={() => onDelete(msg.id)} danger/>}
          </div>
        )}

        {/* Replies thread */}
        {msg.replies?.length > 0 && (
          <div style={replyThread}>
            {msg.replies.map(r => (
              <MessageBubble key={r.id} msg={r} userId={userId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} isReply/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',
      color: danger ? 'var(--danger)' : 'var(--txt2)',
      borderRadius:6,padding:'3px 9px',fontSize:11,cursor:'pointer',fontWeight:500}}>
      {label}
    </button>
  )
}

// ── File attachment renderer ───────────────────────────────────────────────────
function FileAttachment({ msg, isMine }) {
  const { file_url, file_name, file_type, file_size } = msg
  const textColor = isMine ? 'rgba(255,255,255,.85)' : 'var(--txt2)'

  if (file_type === 'image') return (
    <a href={file_url} target="_blank" rel="noreferrer" style={{display:'block',marginTop:msg.body?6:0}}>
      <img src={file_url} alt={file_name}
        style={{maxWidth:260,maxHeight:200,borderRadius:8,display:'block',objectFit:'cover',border:'1px solid rgba(255,255,255,.1)'}}/>
    </a>
  )

  if (file_type === 'video') return (
    <video src={file_url} controls
      style={{maxWidth:280,maxHeight:180,borderRadius:8,display:'block',marginTop:msg.body?6:0}}/>
  )

  if (file_type === 'audio') return (
    <div style={{marginTop:msg.body?6:0}}>
      <audio src={file_url} controls style={{width:'100%',height:36}}/>
      <div style={{fontSize:11,color:textColor,marginTop:3}}>{file_name}</div>
    </div>
  )

  // Generic file chip (PDF, Excel, CSV, etc.)
  return (
    <a href={file_url} target="_blank" rel="noreferrer" style={{textDecoration:'none',display:'block',marginTop:msg.body?6:0}}>
      <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(0,0,0,.15)',
        borderRadius:8,padding:'10px 12px',border:'1px solid rgba(255,255,255,.08)'}}>
        <span style={{fontSize:26}}>{FILE_ICONS[file_type]||FILE_ICONS.file}</span>
        <div style={{minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color: isMine?'#fff':'var(--txt1)',
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>
            {file_name}
          </div>
          <div style={{fontSize:11,color:textColor}}>{formatBytes(file_size)}</div>
        </div>
        <span style={{marginLeft:'auto',fontSize:18,opacity:.7}}>↗</span>
      </div>
    </a>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    height: 'calc(100vh - 56px)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    maxWidth: 1000,
    margin: '0 auto',
    width: '100%',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontFamily: 'var(--font-d)',
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--txt1)',
    margin: 0,
  },
  headerSub: {
    fontSize: 12,
    color: 'var(--txt3)',
    margin: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--txt2)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  tabBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--txt2)',
    borderRadius: 7,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  composer: {
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-card)',
    flexShrink: 0,
    padding: '10px 16px',
  },
  replyBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-elevated)',
    borderLeft: '3px solid var(--accent)',
    borderRadius: 6,
    padding: '6px 10px',
    marginBottom: 8,
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--txt3)',
    cursor: 'pointer',
    fontSize: 14,
    padding: '0 4px',
    flexShrink: 0,
  },
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 8,
  },
  fileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  inputRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  attachBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 18,
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--txt1)',
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    fontFamily: 'var(--font-b)',
    lineHeight: 1.5,
    maxHeight: 120,
    overflowY: 'auto',
  },
}

const bubbleWrap = (isMine, isReply) => ({
  display: 'flex',
  gap: 8,
  padding: isReply ? '4px 0' : '3px 0',
  flexDirection: isMine ? 'row-reverse' : 'row',
  alignItems: 'flex-end',
  marginLeft: isReply ? 38 : 0,
})

const bubble = (isMine) => ({
  background: isMine ? 'var(--accent)' : 'var(--bg-card)',
  border: isMine ? 'none' : '1px solid var(--border)',
  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  padding: '10px 14px',
  maxWidth: '100%',
})

const actionBar = (isMine) => ({
  display: 'flex',
  gap: 5,
  marginTop: 4,
  justifyContent: isMine ? 'flex-end' : 'flex-start',
})

const replyThread = {
  marginTop: 6,
  paddingLeft: 8,
  borderLeft: '2px solid var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}
