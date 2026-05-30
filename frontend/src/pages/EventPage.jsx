import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function EventPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [event, setEvent] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [comment, setComment] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const canUpload = ['ADMIN', 'PHOTOGRAPHER'].includes(user?.role)
  const canDelete = (item) => user?.role === 'ADMIN' || item.uploadedBy?._id === user?._id

  useEffect(() => { fetchEvent(); fetchMedia(1) }, [id])

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`)
      setEvent(data)
    } catch { toast.error('Event not found') }
  }

  const fetchMedia = async (pageNum = 1) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/media/event/${id}?page=${pageNum}&limit=20`)
      if (pageNum === 1) setMedia(data.media)
      else setMedia(prev => [...prev, ...data.media])
      setHasMore(pageNum < data.pages)
      setPage(pageNum)
    } catch { toast.error('Failed to load media') }
    finally { setLoading(false) }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!canUpload) return toast.error('You do not have upload permission')
    setUploading(true)
    try {
      if (acceptedFiles.length === 1) {
        const formData = new FormData()
        formData.append('file', acceptedFiles[0])
        formData.append('eventId', id)
        formData.append('isPrivate', 'false')
        await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        const formData = new FormData()
        acceptedFiles.forEach(f => formData.append('files', f))
        formData.append('eventId', id)
        formData.append('isPrivate', 'false')
        await api.post('/media/upload/bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success(`${acceptedFiles.length} photo(s) uploaded!`)
      fetchMedia(1)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }, [id, canUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'video/*': [] }, disabled: !canUpload || uploading
  })

  const handleLike = async (mediaId) => {
    try {
      const { data } = await api.post(`/social/${mediaId}/like`)
      setMedia(prev => prev.map(m => m._id === mediaId ? { ...m, likes: Array(data.likes).fill(null), _liked: data.liked } : m))
      if (selectedPhoto?._id === mediaId)
        setSelectedPhoto(prev => ({ ...prev, likes: Array(data.likes).fill(null), _liked: data.liked }))
    } catch { toast.error('Failed to like') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      await api.post(`/social/${selectedPhoto._id}/comment`, { content: comment })
      setComment('')
      const { data } = await api.get(`/media/event/${id}`)
      const updated = data.media.find(m => m._id === selectedPhoto._id)
      if (updated) setSelectedPhoto(updated)
      toast.success('Comment added!')
    } catch { toast.error('Failed to comment') }
  }

  const handleFavourite = async (mediaId) => {
    try {
      const { data } = await api.post(`/social/${mediaId}/favourite`)
      toast.success(data.favourited ? 'Added to favourites!' : 'Removed from favourites')
    } catch { toast.error('Failed') }
  }

  const handleDownload = async (mediaId) => {
    try {
      const response = await api.get(`/media/${mediaId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-${mediaId}.jpg`
      a.click()
      toast.success('Download started!')
    } catch { toast.error('Download failed') }
  }

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this photo permanently?')) return
    try {
      await api.delete(`/media/${mediaId}`)
      setMedia(prev => prev.filter(m => m._id !== mediaId))
      setSelectedPhoto(null)
      toast.success('Photo deleted')
    } catch { toast.error('Failed to delete photo') }
  }

  const btnBase = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13px', display: 'flex', alignItems: 'center',
    gap: '6px', padding: '4px 0', transition: 'color 0.2s'
  }

  if (!event && !loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>Event not found</div>
  )

  return (
    <div>
      {/* Event Header */}
      {event && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>{event.title}</h1>
            {event.isPrivate && (
              <span style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                Private
              </span>
            )}
          </div>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>{event.description}</p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#555', flexWrap: 'wrap' }}>
            <span>📅 {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>🏷️ {event.category}</span>
            <span>👤 {event.createdBy?.name}</span>
            <span>🖼️ {media.length} photos</span>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {canUpload && (
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? '#7F77DD' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '16px', padding: '40px', textAlign: 'center',
          marginBottom: '32px', cursor: uploading ? 'not-allowed' : 'pointer',
          background: isDragActive ? 'rgba(127,119,221,0.08)' : 'transparent',
          transition: 'all 0.2s', opacity: uploading ? 0.5 : 1
        }}>
          <input {...getInputProps()} />
          {uploading ? (
            <div>
              <div style={{ width: '32px', height: '32px', border: '2px solid #7F77DD', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#666', fontSize: '14px' }}>Uploading and processing with AI tagging...</p>
            </div>
          ) : isDragActive ? (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📂</div>
              <p style={{ color: '#7F77DD', fontWeight: '600' }}>Drop files here!</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>☁️</div>
              <p style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>Drag & drop photos or videos here</p>
              <p style={{ color: '#555', fontSize: '13px' }}>or click to browse — bulk upload supported</p>
            </div>
          )}
        </div>
      )}

      {/* Media Grid */}
      {loading && media.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
          <p style={{ color: '#666' }}>No photos yet</p>
          {canUpload && <p style={{ color: '#444', fontSize: '14px', marginTop: '8px' }}>Upload the first photo for this event!</p>}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {media.map(item => (
              <div key={item._id} className="media-card"
                style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedPhoto(item)}>
                <img src={item.thumbnailUrl || item.cdnUrl} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />

                <div className="media-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                  {canDelete(item) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item._id) }}
                        style={{ background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '8px', color: '#fff', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}>
                        🗑️
                      </button>
                    </div>
                  )}
                  <div className="stats-overlay" style={{ display: 'flex', gap: '10px', opacity: 0, transition: 'opacity 0.2s' }}>
                    <span style={{ fontSize: '13px', color: '#fff' }}>❤️ {item.likes?.length || 0}</span>
                    <span style={{ fontSize: '13px', color: '#fff' }}>💬 {item.comments?.length || 0}</span>
                  </div>
                </div>

                {item.aiTags?.length > 0 && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.65)', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', color: '#fff' }}>
                    🏷️ {item.aiTags[0].label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button onClick={() => fetchMedia(page + 1)}
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', borderRadius: '12px', padding: '12px 32px', fontSize: '14px', cursor: 'pointer' }}>
                Load more photos
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#111', borderRadius: '20px', overflow: 'hidden', maxWidth: '960px', width: '100%', maxHeight: '90vh', display: 'flex' }}>

            {/* Image */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <img src={selectedPhoto.cdnUrl} alt="" style={{ maxHeight: '80vh', objectFit: 'contain', width: '100%' }} />
            </div>

            {/* Sidebar */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Uploader info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                    {selectedPhoto.uploadedBy?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>{selectedPhoto.uploadedBy?.name}</p>
                    <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{new Date(selectedPhoto.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPhoto(null)}
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              {/* AI Tags */}
              {selectedPhoto.aiTags?.length > 0 && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '11px', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Tags</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedPhoto.aiTags.map((tag, i) => (
                      <span key={i} style={{ background: 'rgba(127,119,221,0.15)', color: '#7F77DD', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {tag.label} {tag.confidence}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
                <button onClick={() => handleLike(selectedPhoto._id)}
                  style={{ ...btnBase, color: selectedPhoto._liked ? '#ef4444' : '#888' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = selectedPhoto._liked ? '#ef4444' : '#888'}>
                  {selectedPhoto._liked ? '❤️' : '🤍'} {selectedPhoto.likes?.length || 0}
                </button>
                <button onClick={() => handleFavourite(selectedPhoto._id)}
                  style={{ ...btnBase, color: '#888', marginLeft: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#eab308'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                  ⭐ Save
                </button>
                <button onClick={() => handleDownload(selectedPhoto._id)}
                  style={{ ...btnBase, color: '#888', marginLeft: 'auto' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                  ⬇️ Download
                </button>
                {canDelete(selectedPhoto) && (
                  <button onClick={() => handleDelete(selectedPhoto._id)}
                    style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '8px', color: '#ef4444', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Comments */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Comments ({selectedPhoto.comments?.length || 0})
                </p>
                {selectedPhoto.comments?.length === 0 ? (
                  <p style={{ color: '#444', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No comments yet</p>
                ) : selectedPhoto.comments?.map((c, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#7F77DD' }}>{c.user?.name || 'User'} </span>
                    <span style={{ fontSize: '13px', color: '#888' }}>{c.content}</span>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                <button type="submit"
                  style={{ background: '#7F77DD', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .media-card:hover .media-overlay { background: rgba(0,0,0,0.5) !important; }
        .media-card:hover .delete-btn { opacity: 1 !important; }
        .media-card:hover .stats-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}