import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../services/NotificationContext'
import { IconBell } from './Icons'
import { Avatar } from './FormComponents'

// ── Type → visual config ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  join_request:  { color: 'var(--accent)',  label: 'Join request',  bg: 'rgba(124,106,255,.12)' },
  join_accepted: { color: 'var(--success)', label: 'Accepted',      bg: 'rgba(34,201,122,.12)'  },
  join_rejected: { color: 'var(--danger)',  label: 'Declined',      bg: 'rgba(255,92,106,.12)'  },
  task_assigned: { color: 'var(--info)',    label: 'Task assigned',  bg: 'rgba(56,189,248,.12)'  },
  task_updated:  { color: 'var(--warning)', label: 'Task updated',   bg: 'rgba(245,166,35,.12)'  },
  new_member:    { color: 'var(--success)', label: 'New member',     bg: 'rgba(34,201,122,.12)'  },
  mention:       { color: 'var(--accent)',  label: 'Mention',        bg: 'rgba(124,106,255,.12)' },
}

const cfg = (type) => TYPE_CONFIG[type] || { color: 'var(--txt2)', label: type, bg: 'var(--bg-elevated)' }

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)     return 'just now'
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

// ── Single notification row ───────────────────────────────────────────────────
function NotifRow({ notif, onRead, onDelete, onNavigate }) {
  const { color, label, bg } = cfg(notif.type)

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        background: notif.is_read ? 'transparent' : bg,
        border: `1px solid ${notif.is_read ? 'transparent' : color}22`,
        cursor: notif.link ? 'pointer' : 'default',
        transition: 'background .15s',
        position: 'relative',
      }}
      onClick={() => {
        if (!notif.is_read) onRead(notif.id)
        if (notif.link) onNavigate(notif.link)
      }}
      onMouseEnter={e => {
        if (notif.is_read) e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = notif.is_read ? 'transparent' : bg
      }}
    >
      {/* Unread dot */}
      {!notif.is_read && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          width: 7, height: 7, borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
      )}

      {/* Actor avatar */}
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Avatar
          url={notif.actor?.avatar_url}
          name={notif.actor?.name || '?'}
          size={34}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Type badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.4px',
          textTransform: 'uppercase', color,
          background: bg, padding: '1px 6px', borderRadius: 4,
          display: 'inline-block', marginBottom: 3,
        }}>
          {label}
        </span>

        <p style={{
          fontSize: 13, fontWeight: notif.is_read ? 400 : 600,
          color: 'var(--txt1)', lineHeight: 1.35, margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {notif.title}
        </p>

        {notif.body && (
          <p style={{
            fontSize: 12, color: 'var(--txt2)', margin: '2px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {notif.body}
          </p>
        )}

        <span style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3, display: 'block' }}>
          {timeAgo(notif.created_at)}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(notif.id) }}
        title="Dismiss"
        style={{
          flexShrink: 0, alignSelf: 'flex-start', marginTop: 2,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--txt3)', fontSize: 16, lineHeight: 1,
          padding: '0 2px', borderRadius: 4,
          transition: 'color .12s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}
      >
        ×
      </button>
    </div>
  )
}

// ── Main bell component ───────────────────────────────────────────────────────
export default function NotificationBell() {
  const {
    notifications, unreadCount, loading,
    open, setOpen,
    markRead, markAllRead, deleteOne, clearAll,
  } = useNotifications()

  const navigate   = useNavigate()
  const panelRef   = useRef(null)
  const bellRef    = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, setOpen])

  const handleNavigate = (link) => {
    setOpen(false)
    navigate(link)
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>

      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36,
          background: open ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 8, cursor: 'pointer',
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={e => {
          if (!open) e.currentTarget.style.borderColor = 'var(--border-hover)'
        }}
        onMouseLeave={e => {
          if (!open) e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        <IconBell size={16} color={open ? 'var(--accent)' : 'var(--txt2)'} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            minWidth: 17, height: 17,
            background: 'var(--danger)',
            borderRadius: 9, border: '2px solid var(--bg)',
            fontSize: 10, fontWeight: 800,
            color: '#fff', lineHeight: '13px',
            textAlign: 'center', padding: '0 3px',
            fontFamily: 'var(--font-d)',
            animation: 'popIn .2s ease',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            maxHeight: 520,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: '0 8px 40px rgba(0,0,0,.5)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'popIn .18s ease',
            zIndex: 999,
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px 10px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-d)', fontWeight: 800,
                fontSize: 15, color: 'var(--txt1)',
              }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--accent-dim)', color: 'var(--accent-h)',
                  fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 8,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--accent-h)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '3px 7px', borderRadius: 5,
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--txt3)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '3px 7px', borderRadius: 5,
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '6px 8px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--txt3)', fontSize: 13 }}>
                Loading…
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconBell size={22} color="var(--txt3)" />
                </div>
                <p style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 600, margin: 0 }}>
                  You're all caught up
                </p>
                <p style={{ fontSize: 12, color: 'var(--txt3)', margin: 0 }}>
                  New notifications will appear here
                </p>
              </div>
            )}

            {!loading && notifications.map(n => (
              <NotifRow
                key={n.id}
                notif={n}
                onRead={markRead}
                onDelete={deleteOne}
                onNavigate={handleNavigate}
              />
            ))}
          </div>

          {/* Footer — unread filter hint */}
          {notifications.length > 0 && (
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border)',
              fontSize: 11, color: 'var(--txt3)',
              textAlign: 'center', flexShrink: 0,
            }}>
              Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
