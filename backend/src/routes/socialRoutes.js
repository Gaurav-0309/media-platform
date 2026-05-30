const express = require('express')
const router = express.Router()
const { toggleLike, addComment, deleteComment, toggleFavourite, getMyFavourites, tagUser, getNotifications, markAllRead } = require('../controllers/socialController')
const { protect } = require('../middleware/auth')

router.post('/:id/like',                 protect, toggleLike)
router.post('/:id/comment',              protect, addComment)
router.delete('/:id/comment/:commentId', protect, deleteComment)
router.post('/:id/favourite',            protect, toggleFavourite)
router.post('/:id/tag',                  protect, tagUser)
router.get('/favourites',                protect, getMyFavourites)
router.get('/notifications',             protect, getNotifications)
router.put('/notifications/read',        protect, markAllRead)

module.exports = router