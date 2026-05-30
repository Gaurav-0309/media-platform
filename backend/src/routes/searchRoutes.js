const express = require('express')
const router = express.Router()
const { search } = require('../controllers/searchController')
const { protect } = require('../middleware/auth')

const Media = require('../models/Media')

const Tag = require('../models/Tag')

// GET /api/search/tags?q=bea
router.get('/tags', async (req, res) => {
  try {
    const { q } = req.query
    const tags = await Media.aggregate([
      { $unwind: '$aiTags' },
      { $group: { _id: '$aiTags.label', count: { $sum: 1 } } },
      { $match: { _id: { $regex: q || '', $options: 'i' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { label: '$_id', count: 1, _id: 0 } }
    ])
    res.json(tags)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', search)

module.exports = router