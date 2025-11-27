import express from 'express'
import { body, validationResult } from 'express-validator'
import { Trade } from '../models/Trade.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get all trades for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id }).sort({ entryTime: -1 })

    // Ensure each trade has an id field (use custom id or fallback to _id)
    const tradesWithIds = trades.map(trade => {
      const tradeObj = trade.toObject()
      if (!tradeObj.id) {
        tradeObj.id = tradeObj._id.toString()
      }
      return tradeObj
    })

    return res.json(tradesWithIds)
  } catch (err) {
    console.error('Get trades error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Get single trade
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tradeId = req.params.id

    // Validate trade ID - reject invalid values
    if (!tradeId || tradeId === 'undefined' || tradeId === 'null' || tradeId.trim() === '') {
      return res.status(400).json({ error: 'Invalid trade ID' })
    }

    let trade

    // Check if it's a MongoDB ObjectId format
    if (tradeId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      trade = await Trade.findOne({ _id: tradeId, userId: req.user._id })
    } else {
      // It's a custom string ID (like trade_1234567_abc123)
      trade = await Trade.findOne({ id: tradeId, userId: req.user._id })
    }

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    // Ensure trade has an id field
    const tradeObj = trade.toObject()
    if (!tradeObj.id) {
      tradeObj.id = tradeObj._id.toString()
    }

    return res.json(tradeObj)
  } catch (err) {
    console.error('Get trade error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Create trade
router.post(
  '/',
  authMiddleware,
  [
    body('instrument').notEmpty(),
    body('direction').isIn(['long', 'short']),
    body('entryPrice').isNumeric(),
    body('size').isNumeric(),
    body('conviction').isInt({ min: 1, max: 10 }),
    body('entryTime').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const trade = await Trade.create({
        ...req.body,
        userId: req.user._id,
      })
      return res.status(201).json(trade)
    } catch (err) {
      console.error('Create trade error', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }
)

// Bulk create trades
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { trades } = req.body

    // Validate that trades is an array
    if (!Array.isArray(trades) || trades.length === 0) {
      return res.status(400).json({ error: 'Request must include a non-empty trades array' })
    }

    // Validate each trade has required fields
    const validatedTrades = trades.map((trade, index) => {
      if (!trade.instrument || !trade.direction || !trade.entryPrice || !trade.size || !trade.entryTime) {
        throw new Error(`Trade at index ${index} is missing required fields`)
      }

      return {
        ...trade,
        userId: req.user._id,
        // Ensure we don't carry over MongoDB _id from frontend
        _id: undefined,
      }
    })

    // Bulk insert all trades
    const createdTrades = await Trade.insertMany(validatedTrades)

    // Ensure all trades have id field
    const tradesWithIds = createdTrades.map(trade => {
      const tradeObj = trade.toObject()
      if (!tradeObj.id) {
        tradeObj.id = tradeObj._id.toString()
      }
      return tradeObj
    })

    console.log(`Successfully created ${tradesWithIds.length} trades in bulk`)
    return res.status(201).json({
      success: true,
      count: tradesWithIds.length,
      trades: tradesWithIds
    })
  } catch (err) {
    console.error('Bulk create trade error', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
})

// Update trade
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const tradeId = req.params.id

    // Validate trade ID
    if (!tradeId || tradeId === 'undefined' || tradeId === 'null' || tradeId.trim() === '') {
      return res.status(400).json({ error: 'Invalid trade ID' })
    }

    // Prepare update data (exclude _id and id fields from being updated)
    const updates = { ...req.body }
    delete updates._id
    delete updates.id
    delete updates.userId // Don't allow changing userId

    // Auto-calculate P/L if exitPrice is provided
    if (updates.exitPrice) {
      let currentTrade

      // Fetch current trade to get entry details
      if (tradeId.match(/^[0-9a-fA-F]{24}$/)) {
        currentTrade = await Trade.findOne({ _id: tradeId, userId: req.user._id })
      } else {
        currentTrade = await Trade.findOne({ id: tradeId, userId: req.user._id })
      }

      if (currentTrade && currentTrade.entryPrice && currentTrade.size) {
        const priceDiff = currentTrade.direction === 'long'
          ? updates.exitPrice - currentTrade.entryPrice
          : currentTrade.entryPrice - updates.exitPrice

        updates.pnl = priceDiff * currentTrade.size
        updates.pnlPercent = (priceDiff / currentTrade.entryPrice) * 100
        updates.status = 'closed'
      }
    }

    let trade

    // Check if it's a MongoDB ObjectId format
    if (tradeId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      trade = await Trade.findOneAndUpdate(
        { _id: tradeId, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      )
    } else {
      // It's a custom string ID (like trade_1234567_abc123)
      trade = await Trade.findOneAndUpdate(
        { id: tradeId, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      )
    }

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    // Ensure response has id field
    const tradeObj = trade.toObject()
    if (!tradeObj.id) {
      tradeObj.id = tradeObj._id.toString()
    }

    return res.json(tradeObj)
  } catch (err) {
    console.error('Update trade error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Delete trade
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tradeId = req.params.id

    // Validate trade ID
    if (!tradeId || tradeId === 'undefined' || tradeId === 'null' || tradeId.trim() === '') {
      return res.status(400).json({ error: 'Invalid trade ID' })
    }

    let trade

    // Check if it's a MongoDB ObjectId format
    if (tradeId.match(/^[0-9a-fA-F]{24}$/)) {
      trade = await Trade.findOneAndDelete({ _id: tradeId, userId: req.user._id })
    } else {
      trade = await Trade.findOneAndDelete({ id: tradeId, userId: req.user._id })
    }

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    return res.json({ message: 'Trade deleted', id: trade.id || trade._id.toString() })
  } catch (err) {
    console.error('Delete trade error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Add/update journal (post-exit journal)
router.post('/:id/journal', authMiddleware, async (req, res) => {
  const { journal } = req.body
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { postExitJournal: journal },
      { new: true }
    )
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }
    return res.json(trade)
  } catch (err) {
    console.error('Journal update error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Get similar trades (very simple similarity: same instrument or shared emotion)
router.get('/:id/similar', authMiddleware, async (req, res) => {
  try {
    const tradeId = req.params.id

    // Validate trade ID - reject invalid values
    if (!tradeId || tradeId === 'undefined' || tradeId === 'null' || tradeId.trim() === '') {
      return res.status(400).json({ error: 'Invalid trade ID' })
    }

    let trade

    // Check if it's a MongoDB ObjectId format
    if (tradeId.match(/^[0-9a-fA-F]{24}$/)) {
      trade = await Trade.findOne({ _id: tradeId, userId: req.user._id })
    } else {
      trade = await Trade.findOne({ id: tradeId, userId: req.user._id })
    }

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    const allTrades = await Trade.find({
      userId: req.user._id,
      _id: { $ne: trade._id },
    })

    const similar = allTrades
      .filter(
        (t) =>
          t.instrument === trade.instrument ||
          t.preEntryEmotions.some((e) =>
            trade.preEntryEmotions.some((te) => te.type === e.type)
          )
      )
      .slice(0, 5)
      .map((t) => ({
        tradeId: t.id || t._id.toString(), // Use custom ID if available, fallback to _id
        similarity: Math.random() * 0.3 + 0.7,
        commonFactors: [
          t.instrument === trade.instrument ? 'Same instrument' : '',
          t.direction === trade.direction ? 'Same direction' : '',
          'Similar emotions',
        ].filter(Boolean),
      }))

    return res.json(similar)
  } catch (err) {
    console.error('Similar trades error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router


