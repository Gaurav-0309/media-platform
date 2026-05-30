const express = require('express')
const router = express.Router()
const { upload, uploadSelfie, getMyPhotos, indexPhotoFaces } = require('../controllers/aiController')
const { protect, requireRole } = require('../middleware/auth')

router.post('/selfie',              protect, upload.single('selfie'), uploadSelfie)
router.get('/my-photos',            protect, getMyPhotos)
router.post('/index-photo/:mediaId', protect, requireRole('ADMIN','PHOTOGRAPHER'), indexPhotoFaces)

module.exports = router