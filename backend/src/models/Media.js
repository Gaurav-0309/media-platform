const mongoose = require('mongoose')

const mediaSchema = new mongoose.Schema({
  eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  s3Key:        { type: String, required: true },
  cdnUrl:       { type: String, required: true },
  thumbnailUrl: { type: String },
  mediaType:    { type: String, enum: ['IMAGE','VIDEO'], default: 'IMAGE' },
  isPrivate:    { type: Boolean, default: false },
  fileSize:     { type: Number },
  aiTags:       [{ label: String, confidence: Number }],  // Rekognition results
  likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content:   { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  taggedUsers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favouritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

module.exports = mongoose.model('Media', mediaSchema)