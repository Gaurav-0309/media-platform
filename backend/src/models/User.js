const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['ADMIN','PHOTOGRAPHER','MEMBER','VIEWER'], default: 'VIEWER' },
  avatarUrl:    { type: String },
  selfieUrl:    { type: String },   // for facial recognition
  faceId:       { type: String },   // AWS Rekognition Face ID
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)