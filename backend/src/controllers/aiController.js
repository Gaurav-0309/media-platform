const User = require('../models/User')
const Media = require('../models/Media')
const FaceIndex = require('../models/FaceIndex')
const { uploadToS3 } = require('../services/s3Service')
const { indexFace, searchFacesByImage } = require('../services/rekognitionService')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// POST /api/ai/selfie — upload selfie and index face
const uploadSelfie = async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: 'No selfie uploaded' })

    // upload selfie to S3
    const { key, cdnUrl } = await uploadToS3(file.buffer, file.mimetype, 'selfies')

    // index the face in Rekognition collection
    const faceId = await indexFace(key, req.user._id.toString())

    // save faceId and selfie URL to user profile
    await User.findByIdAndUpdate(req.user._id, { selfieUrl: cdnUrl, faceId })

    res.json({
      message: 'Face registered successfully! You can now find your photos.',
      selfieUrl: cdnUrl,
      faceId
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/ai/my-photos — find all photos containing the logged-in user's face
const getMyPhotos = async (req, res) => {
  try {
    if (!req.user.faceId)
      return res.status(400).json({ message: 'Please upload a selfie first to enable this feature.' })

    // search using the user's stored selfie
    const user = await User.findById(req.user._id)
    const s3Key = user.selfieUrl.split('.amazonaws.com/')[1]

    const matches = await searchFacesByImage(s3Key)
    if (!matches.length) return res.json({ photos: [], message: 'No photos found with your face yet.' })

    // matches give us userIds — but we need mediaIds
    // check FaceIndex collection for stored matches
    const faceIds = matches.map(m => m.faceId)
    const indexed = await FaceIndex.find({ rekognitionFaceId: { $in: faceIds } })
      .populate({
        path: 'mediaId',
        populate: [
          { path: 'uploadedBy', select: 'name avatarUrl' },
          { path: 'eventId', select: 'title eventDate' }
        ]
      })

    const photos = indexed.map(f => f.mediaId).filter(Boolean)
    res.json({ photos, total: photos.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/ai/index-photo/:mediaId
// indexes all faces in a photo after upload (called internally or manually)
const indexPhotoFaces = async (req, res) => {
  try {
    const media = await Media.findById(req.params.mediaId)
    if (!media) return res.status(404).json({ message: 'Media not found' })

    const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition')
    const { IndexFacesCommand } = require('@aws-sdk/client-rekognition')

    const { indexFace: indexSingleFace } = require('../services/rekognitionService')
    const COLLECTION_ID = 'media-platform-faces'

    const rekognition = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    })

    const command = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME, Name: media.s3Key } },
      MaxFaces: 10,
      DetectionAttributes: []
    })

    const response = await rekognition.send(command)

    const saved = await Promise.all(response.FaceRecords.map(record =>
      FaceIndex.create({
        userId: req.user._id,
        mediaId: media._id,
        rekognitionFaceId: record.Face.FaceId,
        confidence: record.Face.Confidence
      })
    ))

    res.json({ message: `${saved.length} face(s) indexed from this photo` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { upload, uploadSelfie, getMyPhotos, indexPhotoFaces }