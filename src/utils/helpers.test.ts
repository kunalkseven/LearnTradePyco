import { Trade } from '../types'
import {
  calculatePnL,
  getWinRate,
  getAveragePnL,
  getExpectancy,
} from './helpers'

describe('helpers', () => {
  const mockTrades: Trade[] = [
    {
      id: '1',
      userId: 'user1',
      instrument: 'EURUSD',
      direction: 'long',
      entryPrice: 1.0,
      exitPrice: 1.1,
      entryTime: '2024-01-01T00:00:00Z',
      exitTime: '2024-01-01T01:00:00Z',
      size: 1000,
      conviction: 7,
      preEntryEmotions: [],
      status: 'closed',
      pnl: 100,
      pnlPercent: 10,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T01:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      instrument: 'EURUSD',
      direction: 'long',
      entryPrice: 1.0,
      exitPrice: 0.9,
      entryTime: '2024-01-02T00:00:00Z',
      exitTime: '2024-01-02T01:00:00Z',
      size: 1000,
      conviction: 5,
      preEntryEmotions: [],
      status: 'closed',
      pnl: -100,
      pnlPercent: -10,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T01:00:00Z',
    },
  ]

  describe('calculatePnL', () => {
    it('calculates profit for long trade', () => {
      const trade = mockTrades[0]
      expect(calculatePnL(trade)).toBe(100)
    })

    it('calculates loss for long trade', () => {
      const trade = mockTrades[1]
      expect(calculatePnL(trade)).toBe(-100)
    })
  })

  describe('getWinRate', () => {
    it('calculates win rate correctly', () => {
      expect(getWinRate(mockTrades)).toBe(50)
    })

    it('returns 0 for empty array', () => {
      expect(getWinRate([])).toBe(0)
    })
  })

  describe('getAveragePnL', () => {
    it('calculates average P/L correctly', () => {
      expect(getAveragePnL(mockTrades)).toBe(0)
    })
  })

  describe('getExpectancy', () => {
    it('calculates expectancy correctly', () => {
      const expectancy = getExpectancy(mockTrades)
      expect(expectancy).toBe(0) // 50% win rate, equal wins/losses
    })
  })
})

