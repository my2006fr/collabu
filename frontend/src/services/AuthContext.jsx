import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfile, refreshToken } from './api'
import { connectSocket, disconnectSocket } from './socket'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() =>
    getProfile().then(d => setUser(d.user)).catch(() => {}), [])

  // Auto-refresh access token 1 minute before expiry
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!localStorage.getItem('token')) return
      try {
        const rtoken = localStorage.getItem('refresh_token')
        if (!rtoken) return
        // Temporarily swap so refreshToken() sends the refresh token
        const old = localStorage.getItem('token')
        localStorage.setItem('token', rtoken)
        const data = await refreshToken()
        localStorage.setItem('token', data.token)
      } catch {
        // refresh failed — token expired, log out silently
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        disconnectSocket()
      }
    }, 6 * 24 * 60 * 60 * 1000) // every 6 days (token lasts 7)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getProfile()
        .then(d => { setUser(d.user); connectSocket(token) })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function storeAuth(token, refreshTok, u) {
    localStorage.setItem('token', token)
    if (refreshTok) localStorage.setItem('refresh_token', refreshTok)
    setUser(u)
    connectSocket(token)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    disconnectSocket()
  }

  return (
    <Ctx.Provider value={{ user, loading, storeAuth, logout, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
