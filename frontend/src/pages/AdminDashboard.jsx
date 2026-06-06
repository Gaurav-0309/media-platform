import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, media: 0, users: 0, storage: 0 })
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // fetch events
      const eventsRes = await api.get('/events')
      const eventsData = eventsRes.data
      setEvents(eventsData)

      // fetch media count from all events
      let totalMedia = 0
      let totalStorage = 0
      await Promise.all(eventsData.map(async (event) => {
        try {
          const mediaRes = await api.get(`/media/event/${event._id}?limit=1000`)
          totalMedia += mediaRes.data.total || 0
          totalStorage += mediaRes.data.media?.reduce((sum, m) => sum + (m.fileSize || 0), 0) || 0
        } catch {}
      }))

      // fetch users via auth/me to at least confirm connection
      // we count from notifications actor diversity as proxy
      const notifsRes = await api.get('/social/notifications')
      const uniqueUsers = new Set(notifsRes.data.map(n => n.actor?._id).filter(Boolean))

      setStats({
        events: eventsData.length,
        media: totalMedia,
        users: uniqueUsers.size || '—',
        storage: totalStorage > 0 ? (totalStorage / (1024 * 1024)).toFixed(1) + ' MB' : '—'
      })
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event and all its photos?')) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e._id !== id))
      setStats(prev => ({ ...prev, events: prev.events - 1 }))
      toast.success('Event deleted')
    } catch { toast.error('Failed to delete') }
  }

  const tabStyle = (tab) => ({
    padding: '8px 20px', borderRadius: '10px', border: 'none',
    cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    background: activeTab === tab ? '#7F77DD' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? '#fff' : '#888',
    transition: 'all 0.2s'
  })

  const cardStyle = {
    background: '#111',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px'
  }

  const statCards = [
    { label: 'Total Events',  value: stats.events,  icon: '📅', color: '#7F77DD' },
    { label: 'Total Photos',  value: stats.media,   icon: '🖼️', color: '#1D9E75' },
    { label: 'Members',       value: stats.users,   icon: '👥', color: '#F59E0B' },
    { label: 'Storage Used',  value: stats.storage, icon: '☁️', color: '#EF4444' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
          Admin Dashboard ⚙️
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Manage your platform</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle('events')}   onClick={() => setActiveTab('events')}>Events</button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {statCards.map(({ label, value, icon, color }) => (
              <div key={label} style={cardStyle}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color, marginBottom: '4px' }}>
                  {loading ? (
                    <div style={{ width: '60px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                  ) : value}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Events Preview */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              Recent Events
            </h2>
            {loading ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
            ) : events.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '32px', fontSize: '14px' }}>No events yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.slice(0, 5).map(event => (
                  <div key={event._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>{event.title}</p>
                      <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>{event.category} · {new Date(event.eventDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span style={{ background: event.isPrivate ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: event.isPrivate ? '#eab308' : '#22c55e', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>
                      {event.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
            All Events ({events.length})
          </h2>
          {loading ? (
            <p style={{ color: '#666' }}>Loading...</p>
          ) : events.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '32px' }}>No events yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Event', 'Category', 'Date', 'Access', 'Created By', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                      {event.title}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(127,119,221,0.15)', color: '#7F77DD', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {event.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                      {new Date(event.eventDate).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: event.isPrivate ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: event.isPrivate ? '#eab308' : '#22c55e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {event.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                      {event.createdBy?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => deleteEvent(event._id)}
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}