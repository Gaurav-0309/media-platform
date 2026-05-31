require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

const app = express()
const server = http.createServer(app)

// ← CORS updated here
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cig-media-platform.onrender.com'
  ],
  credentials: true
}))

// ← Socket.io CORS updated here
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://cig-media-platform.onrender.com'
    ],
    methods: ['GET', 'POST']
  }
})

app.use(express.json())

app.use((req, res, next) => {
  req.io = io
  next()
})

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('No token'))
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)
  socket.join(socket.userId)
  socket.on('disconnect', () => console.log(`User disconnected: ${socket.userId}`))
})

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')
    const { createFaceCollection } = require('./services/rekognitionService')
    await createFaceCollection()
  })
  .catch(err => console.log('DB error:', err))

const authRoutes   = require('./routes/authRoutes')
const eventRoutes  = require('./routes/eventRoutes')
const mediaRoutes  = require('./routes/mediaRoutes')
const socialRoutes = require('./routes/socialRoutes')
const searchRoutes = require('./routes/searchRoutes')
const aiRoutes     = require('./routes/aiRoutes')

app.use('/api/auth',   authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/media',  mediaRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/ai',     aiRoutes)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))