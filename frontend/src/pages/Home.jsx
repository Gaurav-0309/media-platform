import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Home() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')
  const [category, setCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', category: 'Cultural', eventDate: '', isPrivate: false
  })

  const categories = ['Cultural', 'Sports', 'Workshop', 'Trip', 'Competition', 'Party', 'Other']
  const canCreate = ['ADMIN', 'PHOTOGRAPHER'].includes(user?.role)

  useEffect(() => { fetchEvents() }, [sort, category])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (sort)     params.append('sort', sort)
      if (category) params.append('category', category)
      if (search)   params.append('search', search)
      const { data } = await api.get(`/events?${params}`)
      setEvents(data)
    } catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  const handleSearch = (e) => { e.preventDefault(); fetchEvents() }

  const createEvent = async (e) => {
    e.preventDefault()
    try {
      await api.post('/events', newEvent)
      toast.success('Event created!')
      setShowCreateModal(false)
      setNewEvent({ title: '', description: '', category: 'Cultural', eventDate: '', isPrivate: false })
      fetchEvents()
    } catch { toast.error('Failed to create event') }
  }

  const updateEvent = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/events/${editingEvent._id}`, editingEvent)
      setEvents(prev => prev.map(ev => ev._id === editingEvent._id ? { ...ev, ...editingEvent } : ev))
      setEditingEvent(null)
      toast.success('Event updated!')
    } catch { toast.error('Failed to update event') }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event and all its photos?')) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e._id !== id))
      toast.success('Event deleted')
    } catch { toast.error('Failed to delete event') }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    padding: '12px 16px', color: '#fff', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  const selectStyle = {
    background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '12px 16px', color: '#fff',
    fontSize: '14px', outline: 'none', width: '100%',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Events</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Browse all club events and their media</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreateModal(true)}
            style={{ background: '#7F77DD', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            + Create Event
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
          style={{ ...inputStyle, flex: 1, minWidth: '200px', padding: '10px 16px' }} />
        <button type="submit"
          style={{ background: '#7F77DD', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}>
          Search
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ ...selectStyle, width: 'auto', padding: '10px 16px' }}>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ ...selectStyle, width: 'auto', padding: '10px 16px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </form>

      {/* Events Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ color: '#666', fontSize: '16px' }}>No events found</p>
          {canCreate && <p style={{ color: '#444', fontSize: '14px', marginTop: '8px' }}>Create your first event to get started</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {events.map(event => (
            <div key={event._id}
              onClick={() => navigate(`/events/${event._id}`)}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(127,119,221,0.5)'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1)' }}>

              {/* Banner */}
              <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(127,119,221,0.3), rgba(83,74,183,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                {event.category === 'Cultural' ? '🎭' : event.category === 'Sports' ? '⚽' :
                 event.category === 'Workshop' ? '🛠️' : event.category === 'Trip' ? '✈️' :
                 event.category === 'Party' ? '🎉' : '📸'}
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.title}
                  </h3>
                  {event.isPrivate && (
                    <span style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      Private
                    </span>
                  )}
                </div>

                <p style={{ color: '#555', fontSize: '13px', marginBottom: '12px' }}>
                  {event.description || 'No description'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ background: 'rgba(127,119,221,0.15)', color: '#7F77DD', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                    {event.category}
                  </span>
                  <span style={{ color: '#555', fontSize: '12px' }}>
                    {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p style={{ color: '#444', fontSize: '12px', marginBottom: '12px' }}>
                  by {event.createdBy?.name || 'Unknown'}
                </p>

                {/* Admin Actions */}
                {user?.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingEvent(event) }}
                      style={{ flex: 1, background: 'rgba(127,119,221,0.1)', border: '1px solid rgba(127,119,221,0.2)', color: '#7F77DD', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteEvent(event._id) }}
                      style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Create New Event</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Event Title</label>
                <input required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={inputStyle} placeholder="Annual Photography Fest" />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  style={{ ...inputStyle, height: '80px', resize: 'none' }} placeholder="Describe the event..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })} style={selectStyle}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Date</label>
                  <input type="date" required value={newEvent.eventDate}
                    onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={newEvent.isPrivate}
                  onChange={e => setNewEvent({ ...newEvent, isPrivate: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#7F77DD' }} />
                <span style={{ fontSize: '14px', color: '#888' }}>Make this event private</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '12px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, background: '#7F77DD', border: 'none', color: '#fff', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Edit Event</h2>
              <button onClick={() => setEditingEvent(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={updateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Event Title</label>
                <input value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea value={editingEvent.description || ''} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  style={{ ...inputStyle, height: '80px', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={editingEvent.category} onChange={e => setEditingEvent({ ...editingEvent, category: e.target.value })} style={selectStyle}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '6px' }}>Date</label>
                  <input type="date" value={editingEvent.eventDate?.split('T')[0] || ''}
                    onChange={e => setEditingEvent({ ...editingEvent, eventDate: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editingEvent.isPrivate}
                  onChange={e => setEditingEvent({ ...editingEvent, isPrivate: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#7F77DD' }} />
                <span style={{ fontSize: '14px', color: '#888' }}>Private event</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingEvent(null)}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '12px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, background: '#7F77DD', border: 'none', color: '#fff', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}