import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' })
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form.name, form.email, form.password, form.role)
      toast.success('Account created!')
      navigate('/')
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const selectStyle = {
    width: '100%',
    background: '#1e1e2e',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'auto',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '40px',
        margin: '20px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Create account 🚀
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
          Join the CIG Media Platform
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              placeholder="Your name"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Role
            </label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={selectStyle}
            >
              <option value="VIEWER"       style={{ background: '#1e1e2e', color: '#fff' }}>Viewer</option>
              <option value="MEMBER"       style={{ background: '#1e1e2e', color: '#fff' }}>Club Member</option>
              <option value="PHOTOGRAPHER" style={{ background: '#1e1e2e', color: '#fff' }}>Photographer</option>
              <option value="ADMIN"        style={{ background: '#1e1e2e', color: '#fff' }}>Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#444' : '#7F77DD',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#534AB7' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7F77DD' }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#7F77DD', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}