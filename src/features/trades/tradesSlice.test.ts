import tradesReducer, { addTrade, updateTrade, deleteTrade, setFilters } from './tradesSlice'
import { Trade } from '../../types'

describe('tradesSlice', () => {
  const initialState = {
    trades: [],
    filters: {},
    selectedTradeId: null,
  }

  const mockTrade: Trade = {
    id: '1',
    userId: 'user1',
    instrument: 'EURUSD',
    direction: 'long',
    entryPrice: 1.0850,
    entryTime: '2024-01-15T09:30:00Z',
    size: 10000,
    conviction: 7,
    preEntryEmotions: [],
    status: 'open',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  }

  it('should handle initial state', () => {
    expect(tradesReducer(undefined, { type: 'unknown' })).toEqual({
      trades: expect.any(Array),
      filters: {},
      selectedTradeId: null,
    })
  })

  it('should handle addTrade', () => {
    const actual = tradesReducer(initialState, addTrade(mockTrade))
    expect(actual.trades).toHaveLength(1)
    expect(actual.trades[0]).toEqual(mockTrade)
  })

  it('should handle updateTrade', () => {
    const state = { ...initialState, trades: [mockTrade] }
    const actual = tradesReducer(
      state,
      updateTrade({ id: '1', updates: { exitPrice: 1.0880, status: 'closed' } })
    )
    expect(actual.trades[0].exitPrice).toBe(1.0880)
    expect(actual.trades[0].status).toBe('closed')
  })

  it('should handle deleteTrade', () => {
    const state = { ...initialState, trades: [mockTrade] }
    const actual = tradesReducer(state, deleteTrade('1'))
    expect(actual.trades).toHaveLength(0)
  })

  it('should handle setFilters', () => {
    const filters = { status: 'closed' as const }
    const actual = tradesReducer(initialState, setFilters(filters))
    expect(actual.filters).toEqual(filters)
  })
})

