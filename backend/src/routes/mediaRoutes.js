const express = require('express')
const router = express.Router()
const multer = require('multer')
const QRCode = require('qrcode')
const { uploadMedia, bulkUpload, getEventMedia, deleteMedia, downloadMedia } = require('../controllers/mediaController')
const { protect, requireRole } = require('../middleware/auth')

const storage = multer.memoryStorage()
const multiUpload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

router.post('/upload',       protect, requireRole('ADMIN','PHOTOGRAPHER'), multiUpload.single('file'),        uploadMedia)
router.post('/upload/bulk',  protect, requireRole('ADMIN','PHOTOGRAPHER'), multiUpload.array('files', 50),    bulkUpload)
router.get('/event/:eventId/qr', protect, async (req, res) => {
  try {
    const shareUrl = `${process.env.FRONTEND_URL}/events/${req.params.eventId}`
    const qrBuffer = await QRCode.toBuffer(shareUrl, { width: 300, margin: 2 })
    res.set({ 'Content-Type': 'image/png' })
    res.send(qrBuffer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get('/event/:eventId', getEventMedia)
router.get('/:id/download',  protect, downloadMedia)
router.delete('/:id',        protect, requireRole('ADMIN','PHOTOGRAPHER'), deleteMedia)

module.exports = router