require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { createFaceCollection } = require('./services/rekognitionService')
const User = require('./models/User')

const searchRoutes = require('./routes/searchRoutes')
const aiRoutes     = require('./routes/aiRoutes')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
})

app.use(cors())
app.use(express.json())

// attach io to every request so controllers can emit
app.use((req, res, next) => {
  req.io = io
  next()
})

// socket auth middleware
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

// when a user connects, join their personal room
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`)
  socket.join(socket.userId)

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`)
  })
})

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    createFaceCollection()   // ← add this line
  })
  .catch(err => console.log('DB error:', err))

// Routes
const authRoutes  = require('./routes/authRoutes')
const eventRoutes = require('./routes/eventRoutes')
const mediaRoutes = require('./routes/mediaRoutes')
const socialRoutes = require('./routes/socialRoutes')

app.use('/api/auth',   authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/media',  mediaRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/ai',     aiRoutes)


const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))