import { Trade, EmotionType } from '../types'

export const calculatePnL = (trade: Trade): number => {
  if (!trade.exitPrice || !trade.entryPrice) return 0
  const priceDiff = trade.direction === 'long' 
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice
  return priceDiff * trade.size
}

export const calculatePnLPercent = (trade: Trade): number => {
  if (!trade.exitPrice || !trade.entryPrice) return 0
  const priceDiff = trade.direction === 'long'
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice
  return (priceDiff / trade.entryPrice) * 100
}

export const getWinRate = (trades: Trade[]): number => {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.pnl !== undefined)
  if (closedTrades.length === 0) return 0
  const winners = closedTrades.filter((t) => (t.pnl || 0) > 0)
  return (winners.length / closedTrades.length) * 100
}

export const getAveragePnL = (trades: Trade[]): number => {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.pnl !== undefined)
  if (closedTrades.length === 0) return 0
  const total = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  return total / closedTrades.length
}

export const getExpectancy = (trades: Trade[]): number => {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.pnl !== undefined)
  if (closedTrades.length === 0) return 0
  const winners = closedTrades.filter((t) => (t.pnl || 0) > 0)
  const losers = closedTrades.filter((t) => (t.pnl || 0) <= 0)
  
  const avgWin = winners.length > 0
    ? winners.reduce((sum, t) => sum + (t.pnl || 0), 0) / winners.length
    : 0
  const avgLoss = losers.length > 0
    ? Math.abs(losers.reduce((sum, t) => sum + (t.pnl || 0), 0) / losers.length)
    : 0
  
  const winRate = winners.length / closedTrades.length
  return avgWin * winRate - avgLoss * (1 - winRate)
}

export const getAverageConviction = (trades: Trade[]): number => {
  if (trades.length === 0) return 0
  const total = trades.reduce((sum, t) => sum + t.conviction, 0)
  return total / trades.length
}

export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getEmotionColor = (emotion: EmotionType): string => {
  const colors: Record<EmotionType, string> = {
    Fear: 'bg-red-100 text-red-800 border-red-300',
    Greed: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Calm: 'bg-green-100 text-green-800 border-green-300',
    Frustration: 'bg-orange-100 text-orange-800 border-orange-300',
    Excitement: 'bg-pink-100 text-pink-800 border-pink-300',
    Boredom: 'bg-gray-100 text-gray-800 border-gray-300',
    Confidence: 'bg-blue-100 text-blue-800 border-blue-300',
    Doubt: 'bg-purple-100 text-purple-800 border-purple-300',
  }
  return colors[emotion] || 'bg-gray-100 text-gray-800 border-gray-300'
}

export const getEmotionIcon = (emotion: EmotionType): string => {
  const icons: Record<EmotionType, string> = {
    Fear: '😨',
    Greed: '💰',
    Calm: '😌',
    Frustration: '😤',
    Excitement: '🤩',
    Boredom: '😑',
    Confidence: '💪',
    Doubt: '🤔',
  }
  return icons[emotion] || '😐'
}

