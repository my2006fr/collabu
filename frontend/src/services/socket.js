import { io } from 'socket.io-client'

// In dev: connects to localhost:5000 directly (not through Vite proxy)
// In prod: connects to VITE_SOCKET_URL (your Render backend URL)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export function getSocket() {
  return socket
}

export function connectSocket(token) {
  if (socket?.connected) return socket
  socket = io(SOCKET_URL, {
    auth:               { token },
    transports:         ['websocket', 'polling'],   // polling fallback for Render
    reconnectionAttempts: 10,
    reconnectionDelay:  2000,
    timeout:            20000,
  })
  socket.on('connect',       ()    => console.info('[socket] connected'))
  socket.on('disconnect',    reason=> console.info('[socket] disconnected:', reason))
  socket.on('connect_error', err   => console.warn('[socket] error:', err.message))
  return socket
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null }
}

export function joinProjectRoom(pid) {
  socket?.emit('join_project_room', { project_id: Number(pid) })
}

export function leaveProjectRoom(pid) {
  socket?.emit('leave_project_room', { project_id: Number(pid) })
}

export function joinGlobalFeed() {
  socket?.emit('join_global_feed', {})
}
