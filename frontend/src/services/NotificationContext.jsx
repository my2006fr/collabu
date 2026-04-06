/**
 * NotificationContext
 *
 * Provides unread count + notification list to the whole app.
 * Subscribes to the `new_notification` Socket.IO event so the bell
 * updates instantly without polling.
 *
 * MIGRATION PATH → microservice:
 *   Only this file and api.js need to change.
 *   Swap the Socket.IO listener for a WebSocket / SSE connection to the
 *   notification microservice.  All consumer components stay the same.
 */
import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react'
import { useAuth } from './AuthContext'
import { getSocket } from './socket'
import {
  getNotifications, getUnreadCount,
  markRead, markAllRead,
  deleteNotification, clearNotifications,
} from './api'

const Ctx = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [open,          setOpen]          = useState(false)   // bell dropdown open?

  // Track whether we've done the initial load
  const loaded = useRef(false)

  // ── Initial fetch ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getNotifications({ page: 1 })
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
      loaded.current = true
    } catch (_) {
      // silently fail — non-critical
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      load()
    } else {
      setNotifications([])
      setUnreadCount(0)
      loaded.current = false
    }
  }, [user, load])

  // ── Real-time: listen for new_notification on the socket ─────────────────
  useEffect(() => {
    if (!user) return
    let cleanup = () => {}

    // Socket may not be ready immediately — poll briefly
    const attach = () => {
      const sock = getSocket()
      if (!sock) return false

      const handler = (notif) => {
        setNotifications(prev => [notif, ...prev])
        setUnreadCount(c => c + 1)
      }

      sock.on('new_notification', handler)
      cleanup = () => sock.off('new_notification', handler)
      return true
    }

    if (!attach()) {
      // Socket not connected yet — retry for up to 3 s
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (attach() || attempts > 15) clearInterval(iv)
      }, 200)
      cleanup = () => clearInterval(iv)
    }

    return () => cleanup()
  }, [user])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleMarkRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    try { await markRead(id) } catch (_) { load() } // revert on error
  }, [load])

  const handleMarkAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    try { await markAllRead() } catch (_) { load() }
  }, [load])

  const handleDelete = useCallback(async (id) => {
    const target = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (target && !target.is_read) setUnreadCount(c => Math.max(0, c - 1))
    try { await deleteNotification(id) } catch (_) { load() }
  }, [notifications, load])

  const handleClearAll = useCallback(async () => {
    setNotifications([])
    setUnreadCount(0)
    try { await clearNotifications() } catch (_) { load() }
  }, [load])

  return (
    <Ctx.Provider value={{
      notifications,
      unreadCount,
      loading,
      open,
      setOpen,
      load,
      markRead:    handleMarkRead,
      markAllRead: handleMarkAllRead,
      deleteOne:   handleDelete,
      clearAll:    handleClearAll,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNotifications = () => useContext(Ctx)
