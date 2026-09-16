import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()

  const login = async (credential) => {
    try {
      const res = await api.post('/auth/google', { credential })
      onLogin(res.data.user)

      toast.success(`Welcome, ${res.data.user.name || 'member'}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch(error) {
      toast.error('Google sign-in could not be completed.'+error)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="brand-mark large">T</span>
        <span className="eyebrow">Welcome to TiFund</span>
        <h1>Sign in securely</h1>
        <p>Use your Google account to access your member space.</p>

        <GoogleLogin
          onSuccess={(response) => login(response.credential)}
          onError={() => toast.error('Google sign-in failed.')}
          useOneTap
        />
      </div>
    </section>
  )
}
