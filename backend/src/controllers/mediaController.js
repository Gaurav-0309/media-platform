const { addWatermark } = require('../services/watermarkService')
const https = require('https')
const http = require('http')

const { detectLabels } = require('../services/rekognitionService')
const Media = require('../models/Media')
const { uploadToS3, generateThumbnail, compressImage, deleteFromS3 } = require('../services/s3Service')
const multer = require('multer')

// multer stores file in memory (not disk) so we can process with sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },  // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','video/mp4']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed'))
  }
})

// POST /api/media/upload
const uploadMedia = async (req, res) => {
  try {
    const { eventId, isPrivate } = req.body
    const file = req.file
    if (!file) return res.status(400).json({ message: 'No file uploaded' })

    const isImage = file.mimetype.startsWith('image/')
    let fileBuffer = file.buffer
    let thumbnailUrl = null

    if (isImage) {
      fileBuffer = await compressImage(file.buffer)
      const thumbBuffer = await generateThumbnail(file.buffer)
      const thumb = await uploadToS3(thumbBuffer, 'image/jpeg', 'thumbnails')
      thumbnailUrl = thumb.cdnUrl
    }

    const { key, cdnUrl } = await uploadToS3(fileBuffer, file.mimetype, 'media')

    // auto-tag using Rekognition (only for images)
    let aiTags = []
    if (isImage) {
      try {
        aiTags = await detectLabels(key)
      } catch {
        console.log('Tagging failed for this image, skipping')
      }
    }

    const media = await Media.create({
      eventId,
      uploadedBy: req.user._id,
      s3Key: key,
      cdnUrl,
      thumbnailUrl,
      mediaType: isImage ? 'IMAGE' : 'VIDEO',
      isPrivate: isPrivate === 'true',
      fileSize: file.size,
      aiTags,              // ← auto tags saved here
    })

    res.status(201).json(media)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/media/upload/bulk
const bulkUpload = async (req, res) => {
  try {
    const { eventId, isPrivate } = req.body
    const files = req.files
    if (!files?.length) return res.status(400).json({ message: 'No files uploaded' })

    const results = await Promise.all(files.map(async (file) => {
      const isImage = file.mimetype.startsWith('image/')
      let fileBuffer = file.buffer
      let thumbnailUrl = null

      if (isImage) {
        fileBuffer = await compressImage(file.buffer)
        const thumbBuffer = await generateThumbnail(file.buffer)
        const thumb = await uploadToS3(thumbBuffer, 'image/jpeg', 'thumbnails')
        thumbnailUrl = thumb.cdnUrl
      }

      const { key, cdnUrl } = await uploadToS3(fileBuffer, file.mimetype, 'media')

      let aiTags = []
      if (isImage) {
        try { aiTags = await detectLabels(key) } catch {}
      }

      return Media.create({
        eventId,
        uploadedBy: req.user._id,
        s3Key: key, cdnUrl, thumbnailUrl,
        mediaType: isImage ? 'IMAGE' : 'VIDEO',
        isPrivate: isPrivate === 'true',
        fileSize: file.size,
        aiTags,
      })
    }))

    res.status(201).json({ uploaded: results.length, media: results })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/media/event/:eventId
const getEventMedia = async (req, res) => {
  try {
    const isAdmin = ['ADMIN','PHOTOGRAPHER','MEMBER'].includes(req.user?.role)
    const filter = { eventId: req.params.eventId }
    if (!isAdmin) filter.isPrivate = false

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const media = await Media.find(filter)
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Media.countDocuments(filter)

    res.json({ media, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/media/:id
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' })

    await deleteFromS3(media.s3Key)
    if (media.thumbnailUrl) await deleteFromS3(media.thumbnailUrl)
    await media.deleteOne()

    res.json({ message: 'Media deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/media/:id/download
const downloadMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('eventId', 'title')
      .populate('uploadedBy', 'name')

    if (!media) return res.status(404).json({ message: 'Media not found' })

    // check access
    const isAdmin = ['ADMIN','PHOTOGRAPHER','MEMBER'].includes(req.user?.role)
    if (media.isPrivate && !isAdmin)
      return res.status(403).json({ message: 'Private media' })

    // fetch the image buffer from S3/CDN
    const imageBuffer = await fetchImageBuffer(media.cdnUrl)

    // build dynamic watermark text based on role
    const watermarkData = {
      clubName: 'CIG Club',
      eventName: media.eventId?.title || 'Event',
      userRole: req.user?.role || 'VIEWER'
    }

    const watermarkedBuffer = await addWatermark(imageBuffer, watermarkData)

    // send as downloadable file
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${media.eventId?.title || 'photo'}-${media._id}.jpg"`,
      'Content-Length': watermarkedBuffer.length
    })
    res.send(watermarkedBuffer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// helper — fetch image from URL into a buffer
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol.get(url, (response) => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    }).on('error', reject)
  })
}
module.exports = { uploadMedia, bulkUpload, getEventMedia, deleteMedia, downloadMedia }