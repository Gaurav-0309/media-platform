const Media = require('../models/Media')
const Event = require('../models/Event')
const User = require('../models/User')

// GET /api/search?q=beach&type=tag&eventId=xxx&from=2024-01-01&to=2024-12-31
const search = async (req, res) => {
  try {
    const { q, type, eventId, from, to, page = 1, limit = 20 } = req.query
    const isAdmin = ['ADMIN','PHOTOGRAPHER','MEMBER'].includes(req.user?.role)
    const skip = (parseInt(page) - 1) * parseInt(limit)

    let mediaFilter = {}
    if (!isAdmin) mediaFilter.isPrivate = false
    if (eventId) mediaFilter.eventId = eventId

    // date range filter
    if (from || to) {
      mediaFilter.createdAt = {}
      if (from) mediaFilter.createdAt.$gte = new Date(from)
      if (to)   mediaFilter.createdAt.$lte = new Date(to)
    }

    // search by AI tag
    if (type === 'tag' && q) {
      mediaFilter['aiTags.label'] = { $regex: q, $options: 'i' }
      const media = await Media.find(mediaFilter)
        .populate('uploadedBy', 'name avatarUrl')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit))
      const total = await Media.countDocuments(mediaFilter)
      return res.json({ results: media, total, type: 'tag' })
    }

    // search by event name
    if (type === 'event' && q) {
      const events = await Event.find({ title: { $regex: q, $options: 'i' } })
      const eventIds = events.map(e => e._id)
      mediaFilter.eventId = { $in: eventIds }
      const media = await Media.find(mediaFilter)
        .populate('uploadedBy', 'name avatarUrl')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit))
      const total = await Media.countDocuments(mediaFilter)
      return res.json({ results: media, total, type: 'event', events })
    }

    // search by uploader username
    if (type === 'user' && q) {
      const users = await User.find({ name: { $regex: q, $options: 'i' } })
      const userIds = users.map(u => u._id)
      mediaFilter.uploadedBy = { $in: userIds }
      const media = await Media.find(mediaFilter)
        .populate('uploadedBy', 'name avatarUrl')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit))
      const total = await Media.countDocuments(mediaFilter)
      return res.json({ results: media, total, type: 'user', users })
    }

    // global search across tags + events + users at once
    if (q) {
      const events = await Event.find({ title: { $regex: q, $options: 'i' } })
      const users  = await User.find({ name:  { $regex: q, $options: 'i' } })
      const eventIds = events.map(e => e._id)
      const userIds  = users.map(u => u._id)

      const media = await Media.find({
        ...mediaFilter,
        $or: [
          { 'aiTags.label': { $regex: q, $options: 'i' } },
          { eventId: { $in: eventIds } },
          { uploadedBy: { $in: userIds } },
        ]
      })
        .populate('uploadedBy', 'name avatarUrl')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit))

      const total = await Media.countDocuments({ ...mediaFilter, $or: [
        { 'aiTags.label': { $regex: q, $options: 'i' } },
        { eventId: { $in: eventIds } },
        { uploadedBy: { $in: userIds } },
      ]})

      return res.json({ results: media, total, type: 'global' })
    }

    res.status(400).json({ message: 'Please provide a search query' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { search }