const Media = require('../models/Media')
const Notification = require('../models/Notification')
const User = require('../models/User')

// helper — creates a notification and emits it via socket
const createNotification = async (io, { recipient, actor, type, mediaId }) => {
  if (recipient.toString() === actor.toString()) return // don't notify yourself
  const notif = await Notification.create({ recipient, actor: actor, type, media: mediaId })
  const populated = await notif.populate('actor', 'name avatarUrl')
  io.to(recipient.toString()).emit('notification', populated)
}

// POST /api/social/:id/like
const toggleLike = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    const alreadyLiked = media.likes.includes(req.user._id)
    if (alreadyLiked) {
      media.likes.pull(req.user._id)
    } else {
      media.likes.push(req.user._id)
      await createNotification(req.io, {
        recipient: media.uploadedBy,
        actor: req.user._id,
        type: 'LIKE',
        mediaId: media._id
      })
    }
    await media.save()
    res.json({ likes: media.likes.length, liked: !alreadyLiked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/social/:id/comment
const addComment = async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ message: 'Comment cannot be empty' })

    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    media.comments.push({ user: req.user._id, content })
    await media.save()

    await createNotification(req.io, {
      recipient: media.uploadedBy,
      actor: req.user._id,
      type: 'COMMENT',
      mediaId: media._id
    })

    const populated = await Media.findById(media._id)
      .select('comments')
      .populate('comments.user', 'name avatarUrl')

    res.status(201).json(populated.comments.at(-1))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/social/:id/comment/:commentId
const deleteComment = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    const comment = media.comments.id(req.params.commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' })

    comment.deleteOne()
    await media.save()
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/social/:id/favourite
const toggleFavourite = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    const alreadySaved = media.favouritedBy.includes(req.user._id)
    if (alreadySaved) {
      media.favouritedBy.pull(req.user._id)
    } else {
      media.favouritedBy.push(req.user._id)
    }
    await media.save()
    res.json({ favourited: !alreadySaved, total: media.favouritedBy.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/social/favourites — get my favourited photos
const getMyFavourites = async (req, res) => {
  try {
    const media = await Media.find({ favouritedBy: req.user._id })
      .populate('uploadedBy', 'name avatarUrl')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 })
    res.json(media)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/social/:id/tag
const tagUser = async (req, res) => {
  try {
    const { userId } = req.body
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    const userToTag = await User.findById(userId)
    if (!userToTag) return res.status(404).json({ message: 'User not found' })

    if (media.taggedUsers.includes(userId))
      return res.status(400).json({ message: 'User already tagged' })

    media.taggedUsers.push(userId)
    await media.save()

    await createNotification(req.io, {
      recipient: userId,
      actor: req.user._id,
      type: 'PHOTO_TAG',
      mediaId: media._id
    })

    res.json({ message: `${userToTag.name} tagged successfully` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/social/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'name avatarUrl')
      .populate('media', 'thumbnailUrl cdnUrl')
      .sort({ createdAt: -1 })
      .limit(30)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/social/notifications/read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { toggleLike, addComment, deleteComment, toggleFavourite, getMyFavourites, tagUser, getNotifications, markAllRead }