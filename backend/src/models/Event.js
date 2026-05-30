const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  category:    { type: String, required: true },
  eventDate:   { type: Date, required: true },
  isPrivate:   { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Event', eventSchema)