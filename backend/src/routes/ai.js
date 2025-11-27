import express from 'express'

const router = express.Router()

// Mock AI analyze endpoint (matches frontend expectations)
router.post('/analyze', async (req, res) => {
  const { tradeIds, trades: providedTrades } = req.body || {}
  const tradesToAnalyze = providedTrades || []

  const insights = {
    summary: `Analyzed ${tradesToAnalyze.length} trades. Found ${Math.floor(
      tradesToAnalyze.length / 2
    )} patterns.`,
    patterns: [
      {
        id: 'pattern_1',
        title: 'FOMO Entries Lead to Losses',
        summary: 'Trades entered with high Greed emotion tend to result in losses.',
        examples: [
          'Example: BTCUSD trade entered with high Greed, resulted in a loss.',
          'Example: NQ revenge trade with Greed, resulted in a loss.',
        ],
        rules: [
          'Wait for confirmation before entering on momentum',
          'Avoid entering when Greed emotion is above 7',
          'Set strict stop losses on FOMO entries',
        ],
        confidence: 0.85,
      },
      {
        id: 'pattern_2',
        title: 'High Conviction Trades Perform Better',
        summary: 'Trades with conviction 7+ show significantly better win rates.',
        examples: [
          'High conviction AAPL trade resulted in a good profit',
          'High conviction GBPUSD trade resulted in a strong profit',
        ],
        rules: [
          'Only take trades with conviction 7 or higher',
          'Lower conviction trades need stronger technical confirmation',
          'Track conviction vs performance correlation',
        ],
        confidence: 0.78,
      },
    ],
    recommendations: [
      'Focus on high-conviction setups (7+)',
      'Avoid FOMO and revenge trading',
      'Implement trailing stops for winners',
      'Review emotional state before entry',
    ],
  }

  return res.json(insights)
})

// Mock AI parse decision graph
router.post('/parse', async (req, res) => {
  const { tradeId } = req.body || {}

  const graph = {
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        label: 'Market Signal',
        data: {},
        position: { x: 250, y: 0 },
      },
      {
        id: 'emotion',
        type: 'emotion',
        label: 'Pre-Entry Emotions',
        data: { emotion: 'Confidence' },
        position: { x: 250, y: 100 },
      },
      {
        id: 'belief',
        type: 'belief',
        label: 'Trading Belief',
        data: { value: 7 },
        position: { x: 250, y: 200 },
      },
      {
        id: 'action',
        type: 'action',
        label: 'Trade Action',
        data: { tradeId },
        position: { x: 250, y: 300 },
      },
      {
        id: 'outcome',
        type: 'outcome',
        label: 'Trade Outcome',
        data: { value: 0 },
        position: { x: 250, y: 400 },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'emotion' },
      { id: 'e2', source: 'emotion', target: 'belief' },
      { id: 'e3', source: 'belief', target: 'action' },
      { id: 'e4', source: 'action', target: 'outcome' },
    ],
  }

  return res.json(graph)
})

export default router


