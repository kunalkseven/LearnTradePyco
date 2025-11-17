import { http, HttpResponse } from 'msw'
import { sampleTrades } from '../utils/sampleData'
import { Trade, AIAnalysisResponse, DecisionGraph, SimilarTradeResult } from '../types'

let trades = [...sampleTrades]

export const handlers = [
  // Get all trades
  http.get('/api/trades', () => {
    return HttpResponse.json(trades)
  }),

  // Get single trade
  http.get('/api/trades/:id', ({ params }) => {
    const trade = trades.find((t) => t.id === params.id)
    if (!trade) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    return HttpResponse.json(trade)
  }),

  // Create trade
  http.post('/api/trades', async ({ request }) => {
    const newTrade = (await request.json()) as Trade
    const trade: Trade = {
      ...newTrade,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    trades.unshift(trade)
    return HttpResponse.json(trade, { status: 201 })
  }),

  // Update trade
  http.put('/api/trades/:id', async ({ params, request }) => {
    const updates = (await request.json()) as Partial<Trade>
    const index = trades.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    trades[index] = { ...trades[index], ...updates, updatedAt: new Date().toISOString() }
    return HttpResponse.json(trades[index])
  }),

  // Add journal
  http.post('/api/trades/:id/journal', async ({ params, request }) => {
    const { journal } = (await request.json()) as { journal: string }
    const index = trades.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    trades[index] = {
      ...trades[index],
      postExitJournal: journal,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(trades[index])
  }),

  // Upload image
  http.post('/api/upload', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file) {
      return HttpResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    // Mock URL
    const url = `https://example.com/uploads/${Date.now()}_${file.name}`
    return HttpResponse.json({ url })
  }),

  // AI Analyze
  http.post('/api/ai/analyze', async ({ request }) => {
    const { tradeIds, trades: providedTrades } = (await request.json()) as {
      userId: string
      tradeIds?: string[]
      trades?: Trade[]
    }

    const tradesToAnalyze = providedTrades || (tradeIds ? trades.filter((t) => tradeIds.includes(t.id)) : [])

    // Mock AI insights based on trade patterns
    const insights: AIAnalysisResponse = {
      summary: `Analyzed ${tradesToAnalyze.length} trades. Found ${Math.floor(tradesToAnalyze.length / 2)} patterns.`,
      patterns: [
        {
          id: 'pattern_1',
          title: 'FOMO Entries Lead to Losses',
          summary: 'Trades entered with high Greed emotion tend to result in losses.',
          examples: [
            'BTCUSD trade on 2024-01-16: Entered with Greed intensity 8, resulted in -$100 loss',
            'NQ trade on 2024-01-22: Revenge trade with Greed, resulted in -$50 loss',
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
            'AAPL trade: Conviction 9, resulted in $270 profit',
            'GBPUSD trade: Conviction 8, resulted in $600 profit',
          ],
          rules: [
            'Only take trades with conviction 7 or higher',
            'Lower conviction trades need stronger technical confirmation',
            'Track conviction vs performance correlation',
          ],
          confidence: 0.78,
        },
        {
          id: 'pattern_3',
          title: 'Cutting Winners Early',
          summary: 'Exiting profitable trades too early reduces overall returns.',
          examples: [
            'ETHUSD trade: Exited early due to Fear, missed additional $30 profit',
          ],
          rules: [
            'Use trailing stops instead of fear-based exits',
            'Let winners run to target or trailing stop',
            'Review exit emotions before closing position',
          ],
          confidence: 0.72,
        },
      ],
      recommendations: [
        'Focus on high-conviction setups (7+)',
        'Avoid FOMO and revenge trading',
        'Implement trailing stops for winners',
        'Review emotional state before entry',
      ],
    }

    return HttpResponse.json(insights)
  }),

  // AI Parse Decision Graph
  http.post('/api/ai/parse', async ({ request }) => {
    const { tradeId } = (await request.json()) as {
      tradeId: string
      journalText: string
    }

    // Mock decision graph
    const graph: DecisionGraph = {
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

    return HttpResponse.json(graph)
  }),

  // Get similar trades
  http.get('/api/trades/:id/similar', ({ params }) => {
    const trade = trades.find((t) => t.id === params.id)
    if (!trade) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Find similar trades (same instrument or similar emotions)
    const similar: SimilarTradeResult[] = trades
      .filter((t) => t.id !== trade.id && (t.instrument === trade.instrument || 
        t.preEntryEmotions.some((e) => trade.preEntryEmotions.some((te) => te.type === e.type))))
      .slice(0, 5)
      .map((t) => ({
        tradeId: t.id,
        similarity: Math.random() * 0.3 + 0.7, // Mock similarity 0.7-1.0
        commonFactors: [
          t.instrument === trade.instrument ? 'Same instrument' : '',
          t.direction === trade.direction ? 'Same direction' : '',
          'Similar emotions',
        ].filter(Boolean),
      }))

    return HttpResponse.json(similar)
  }),
]

