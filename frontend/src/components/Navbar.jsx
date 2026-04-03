import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { useTheme } from '../services/ThemeContext'
import { Avatar } from './FormComponents'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const loc = useLocation()
  const active = p => loc.pathname === p || loc.pathname.startsWith(p + '/')

  const navLinks = [
    { to: '/feed',      label: '🌐 Feed' },
    { to: '/dashboard', label: '📁 Projects' },
  ]

  return (
    <nav style={{
      background: 'rgba(11,11,18,.95)', borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Link to="/feed" style={{
          fontFamily: 'var(--font-d)', fontWeight: 800, fontSize: 18,
          color: 'var(--txt1)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6, marginRight: 12, flexShrink: 0,
        }}>
          <span style={{ color: 'var(--accent)', fontSize: 20 }}>⬡</span>CollabU
        </Link>

        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'all .15s',
            color:      active(to) ? 'var(--txt1)'       : 'var(--txt2)',
            background: active(to) ? 'var(--bg-elevated)' : 'transparent',
          }}>
            {label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '5px 9px', color: 'var(--txt2)', fontSize: 15, cursor: 'pointer',
          }}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <Link to="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '4px 10px 4px 5px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--bg-elevated)',
          textDecoration: 'none',
        }}>
          <Avatar url={user?.avatar_url} name={user?.name} size={26} />
          <span style={{
            fontSize: 13, color: 'var(--txt1)', fontWeight: 500,
            maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.name}
          </span>
        </Link>

        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            padding: '6px 12px', borderRadius: 7, background: 'transparent',
            color: 'var(--txt3)', fontSize: 13, border: '1px solid var(--border)', cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
