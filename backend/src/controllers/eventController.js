const Event = require('../models/Event')

// POST /api/events — create event
const createEvent = async (req, res) => {
  try {
    const { title, description, category, eventDate, isPrivate } = req.body
    const event = await Event.create({
      title, description, category, eventDate, isPrivate,
      createdBy: req.user._id
    })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/events — get all events
const getEvents = async (req, res) => {
  try {
    const { sort, category, search } = req.query
    const isAdmin = ['ADMIN','PHOTOGRAPHER','MEMBER'].includes(req.user?.role)

    let filter = {}
    if (!isAdmin) filter.isPrivate = false
    if (category) filter.category = category
    if (search) filter.title = { $regex: search, $options: 'i' }

    let sortOption = { createdAt: -1 }
    if (sort === 'date') sortOption = { eventDate: -1 }
    if (sort === 'name') sortOption = { title: 1 }

    const events = await Event.find(filter)
      .sort(sortOption)
      .populate('createdBy', 'name avatarUrl')

    res.json(events)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/events/:id — get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl')
    if (!event) return res.status(404).json({ message: 'Event not found' })

    const isAdmin = ['ADMIN','PHOTOGRAPHER','MEMBER'].includes(req.user?.role)
    if (event.isPrivate && !isAdmin)
      return res.status(403).json({ message: 'Private event' })

    res.json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/events/:id — update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' })

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/events/:id — delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ message: 'Event not found' })

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN')
      return res.status(403).json({ message: 'Not authorized' })

    await event.deleteOne()
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent }