import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../api/axios'

const S = {
  sidebar: { width: '240px', background: '#111111', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'fixed', height: '100vh', top: 0, left: 0 },
  logo: { fontSize: '20px', fontWeight: '700', color: '#7F77DD', marginBottom: '4px' },
  role: { fontSize: '12px', color: '#555', marginBottom: '32px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  main: { marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topbar: { height: '64px', background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: '16px', position: 'sticky', top: 0, zIndex: 10 },
  content: { flex: 1, padding: '32px 32px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' },
  bellBtn: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '8px' },
  badge: { position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: '#fff', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifPanel: { position: 'absolute', right: 0, top: '52px', width: '320px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 50, maxHeight: '400px', overflowY: 'auto' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '14px', textAlign: 'left', padding: '12px 16px', borderRadius: '12px', width: '100%', transition: 'color 0.2s' },
}

const navLinkStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 16px', borderRadius: '12px',
  fontSize: '14px', fontWeight: '500',
  textDecoration: 'none', transition: 'all 0.2s',
  background: isActive ? '#7F77DD' : 'transparent',
  color: isActive ? '#fff' : '#888',
})

export default function Layout() {
  const { user, logout, token } = useAuthStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.get('/social/notifications').then(r => {
      setNotifications(r.data)
      setUnread(r.data.filter(n => !n.isRead).length)
    }).catch(() => {})

    const socket = io('https://media-platform-4br8.onrender.com', { auth: { token } })
    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev])
      setUnread(prev => prev + 1)
      toast(`🔔 ${notif.actor?.name} ${notif.type === 'LIKE' ? 'liked' : notif.type === 'COMMENT' ? 'commented on' : 'tagged you in'} a photo`)
    })
    return () => socket.disconnect()
  }, [])

  const markRead = async () => {
    setShowNotifs(!showNotifs)
    if (unread > 0) {
      await api.put('/social/notifications/read').catch(() => {})
      setUnread(0)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logo}>📸 CIG Media</div>
        <div style={S.role}>{user?.name} · {user?.role}</div>

        <nav style={S.nav}>
          <NavLink to="/" end style={({ isActive }) => navLinkStyle(isActive)}>🏠 Home</NavLink>
          <NavLink to="/my-photos" style={({ isActive }) => navLinkStyle(isActive)}>🤳 My Photos</NavLink>
          <NavLink to="/favourites" style={({ isActive }) => navLinkStyle(isActive)}>❤️ Favourites</NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" style={({ isActive }) => navLinkStyle(isActive)}>⚙️ Dashboard</NavLink>
          )}
        </nav>

        <button style={S.logoutBtn} onClick={() => { logout(); navigate('/login') }}
          onMouseEnter={e => e.target.style.color = '#ef4444'}
          onMouseLeave={e => e.target.style.color = '#555'}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <div style={S.main}>
        <header style={S.topbar}>
          <div style={{ position: 'relative' }}>
            <button style={S.bellBtn} onClick={markRead}>
              🔔
              {unread > 0 && <span style={S.badge}>{unread}</span>}
            </button>
            {showNotifs && (
              <div style={S.notifPanel}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', fontWeight: '600' }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: '13px' }}>No notifications yet</div>
                ) : notifications.map((n, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: !n.isRead ? 'rgba(127,119,221,0.08)' : 'transparent' }}>
                    <span style={{ fontWeight: '600', color: '#7F77DD', fontSize: '13px' }}>{n.actor?.name} </span>
                    <span style={{ color: '#888', fontSize: '13px' }}>
                      {n.type === 'LIKE' ? 'liked your photo' : n.type === 'COMMENT' ? 'commented on your photo' : 'tagged you in a photo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        </header>

        <main style={S.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}