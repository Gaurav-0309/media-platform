import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const user = await login(form.email, form.password)
    toast.success(`Welcome back, ${user.name}!`)
    navigate('/')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid email or password')
  }
}

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    padding: '12px 16px', color: '#fff', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Welcome back 👋</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" required style={inputStyle} placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" required style={inputStyle} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? '#444' : '#7F77DD',
            color: '#fff', border: 'none', borderRadius: '12px',
            padding: '14px', fontSize: '15px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
            transition: 'background 0.2s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7F77DD', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}