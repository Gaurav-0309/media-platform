import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, media: 0, users: 0, likes: 0 })
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, notifsRes] = await Promise.all([
        api.get('/events'),
        api.get('/social/notifications'),
      ])
      setEvents(eventsRes.data)
      setStats(prev => ({ ...prev, events: eventsRes.data.length }))
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e._id !== id))
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

  const cardStyle = { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Admin Dashboard ⚙️</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Manage your platform</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle('events')}   onClick={() => setActiveTab('events')}>Events</button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Events', value: events.length, icon: '📅' },
            { label: 'Total Photos',  value: '—',          icon: '🖼️' },
            { label: 'Members',       value: '—',          icon: '👥' },
            { label: 'Storage Used',  value: '—',          icon: '☁️' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#7F77DD', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>All Events</h2>
          {loading ? (
            <p style={{ color: '#666' }}>Loading...</p>
          ) : events.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '32px' }}>No events yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Event', 'Category', 'Date', 'Access', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#fff' }}>{event.title}</td>
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
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => deleteEvent(event._id)}
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}