const express = require('express')
const router = express.Router()
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController')
const { protect, requireRole } = require('../middleware/auth')

router.get('/', getEvents)                                                        // public
router.get('/:id', getEvent)                                                      // public
router.post('/', protect, requireRole('ADMIN','PHOTOGRAPHER'), createEvent)       // restricted
router.put('/:id', protect, requireRole('ADMIN','PHOTOGRAPHER'), updateEvent)     // restricted
router.delete('/:id', protect, requireRole('ADMIN'), deleteEvent)                 // admin only

module.exports = router