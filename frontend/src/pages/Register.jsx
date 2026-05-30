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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-1">Create account 🚀</h1>
        <p className="text-gray-400 text-sm mb-8">Join the CIG Media Platform</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Full Name',       key: 'name',     type: 'text',     placeholder: 'Your name' },
            { label: 'Email',           key: 'email',    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password',        key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-gray-400 mb-1 block">{label}</label>
              <input
                type={type} required
                value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                placeholder={placeholder}
              />
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="VIEWER">Viewer</option>
              <option value="MEMBER">Club Member</option>
              <option value="PHOTOGRAPHER">Photographer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition mt-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}