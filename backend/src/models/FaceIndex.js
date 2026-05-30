const mongoose = require('mongoose')

const faceIndexSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  rekognitionFaceId: { type: String, required: true },
  confidence:        { type: Number },
}, { timestamps: true })

module.exports = mongoose.model('FaceIndex', faceIndexSchema)