import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Favourites() {
  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/social/favourites')
      .then(r => setFavourites(r.data))
      .catch(() => toast.error('Failed to load favourites'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Favourites ❤️</h1>
        <p className="text-gray-400 text-sm">Photos you've saved across all events</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : favourites.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">⭐</p>
          <p className="text-gray-400">No favourites yet</p>
          <p className="text-gray-600 text-sm mt-2">Star photos while browsing events to save them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {favourites.map(photo => (
            <div key={photo._id} className="aspect-square bg-white/5 rounded-xl overflow-hidden relative group cursor-pointer">
              <img src={photo.thumbnailUrl || photo.cdnUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-3 opacity-0 group-hover:opacity-100 transition">
                <p className="text-xs text-white font-medium">{photo.eventId?.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}