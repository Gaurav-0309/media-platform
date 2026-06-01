import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('tag')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return toast.error('Enter a search term')
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      params.append('type', type)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      const { data } = await api.get(`/search?${params}`)
      setResults(data.results || [])
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '10px 16px',
    color: '#fff', fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box'
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Search 🔍</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Search photos by tag, event, username or date</p>
      </div>

      <form onSubmit={handleSearch} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '16px' }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search..." style={inputStyle} />
          <button type="submit"
            style={{ background: '#7F77DD', border: 'none', color: '#fff', borderRadius: '12px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>Search Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ ...inputStyle, background: '#1a1a1a' }}>
              <option value="tag">By AI Tag</option>
              <option value="event">By Event Name</option>
              <option value="user">By Username</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </form>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: '#666' }}>No results found for "{query}"</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            Found {results.length} result(s) for "{query}"
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {results.map(item => (
              <div key={item._id}
                onClick={() => navigate(`/events/${item.eventId?._id || item.eventId}`)}
                style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={item.thumbnailUrl || item.cdnUrl} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px 10px 10px' }}>
                  <p style={{ color: '#fff', fontSize: '12px', margin: 0 }}>{item.eventId?.title}</p>
                  {item.aiTags?.length > 0 && (
                    <p style={{ color: '#7F77DD', fontSize: '11px', margin: '2px 0 0' }}>
                      🏷️ {item.aiTags[0].label}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}