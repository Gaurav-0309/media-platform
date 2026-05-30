import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function MyPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searched, setSearched] = useState(false)

  const uploadSelfie = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('selfie', file)
      await api.post('/ai/selfie', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Face registered! Searching your photos...')
      fetchMyPhotos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register face')
    } finally { setUploading(false) }
  }

  const fetchMyPhotos = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await api.get('/ai/my-photos')
      setPhotos(data.photos || [])
      if (data.photos?.length === 0) toast('No photos found with your face yet', { icon: '🔍' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch photos')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Photos 🤳</h1>
        <p className="text-gray-400 text-sm">Upload a selfie to find all photos where you appear across all events</p>
      </div>

      {/* Selfie Upload Card */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="text-6xl">🧠</div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white mb-1">Face Recognition</h2>
          <p className="text-gray-400 text-sm mb-4">Upload a clear front-facing selfie. Our AI will scan all event photos and find ones with your face.</p>
          <label className={`inline-block bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? 'Registering face...' : '📸 Upload Selfie'}
            <input type="file" accept="image/*" onChange={uploadSelfie} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : photos.length > 0 ? (
        <>
          <p className="text-gray-400 text-sm mb-4">Found {photos.length} photo(s) with your face</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map(photo => (
              <div key={photo._id} className="aspect-square bg-white/5 rounded-xl overflow-hidden relative group">
                <img src={photo.thumbnailUrl || photo.cdnUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-3 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-xs text-white font-medium">{photo.eventId?.title}</p>
                  <p className="text-xs text-gray-400">{new Date(photo.eventId?.eventDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : searched ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-400">No photos found with your face yet</p>
          <p className="text-gray-600 text-sm mt-2">Make sure event photos have been indexed first</p>
        </div>
      ) : null}
    </div>
  )
}