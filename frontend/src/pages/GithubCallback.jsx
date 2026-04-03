import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

// This page handles GitHub OAuth redirect
// It reads the ?code= param, posts it to parent window, then closes
export default function GithubCallback() {
  const navigate = useNavigate()
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      // If opened as popup, send code to parent
      if (window.opener) {
        window.opener.postMessage({ type: 'github_oauth_code', code }, '*')
        window.close()
      } else {
        // Fallback: redirect to profile with code in state
        navigate('/profile', { state: { github_code: code } })
      }
    } else {
      navigate('/profile')
    }
  }, [])

  return <Spinner fullPage/>
}
