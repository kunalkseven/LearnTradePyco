import { useMemo, useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { useAnalyzeWithAIMutation } from '../api/apiSlice'
import { AIInsight } from '../types'
import {
  getWinRate,
  getAveragePnL,
  getExpectancy,
  getAverageConviction,
  formatCurrency,
} from '../utils/helpers'
import InsightCard from './InsightCard'

import DateRangeFilter from './DateRangeFilter'

export default function Dashboard() {
  const { trades, filters } = useAppSelector((state) => state.trades)
  const { user } = useAppSelector((state) => state.auth)
  const [analyzeWithAI, { isLoading: isAnalyzing }] = useAnalyzeWithAIMutation()
  const [insights, setInsights] = useState<AIInsight[]>([])

  const filteredTrades = useMemo(() => {
    if (!filters.dateRange) return trades

    const start = new Date(filters.dateRange.start)
    const end = new Date(filters.dateRange.end)

    return trades.filter((trade) => {
      const entryDate = new Date(trade.entryTime)
      return entryDate >= start && entryDate <= end
    })
  }, [trades, filters.dateRange])

  const kpis = useMemo(() => {
    return {
      winRate: getWinRate(filteredTrades),
      avgPnL: getAveragePnL(filteredTrades),
      tradesCount: filteredTrades.length,
      expectancy: getExpectancy(filteredTrades),
      avgConviction: getAverageConviction(filteredTrades),
    }
  }, [filteredTrades])

  const chartData = useMemo(() => {
    const closedTrades = filteredTrades
      .filter((t) => t.status === 'closed' && t.exitTime)
      .sort((a, b) => new Date(a.exitTime!).getTime() - new Date(b.exitTime!).getTime())
      .map((trade) => ({
        date: new Date(trade.exitTime!).toLocaleDateString(),
        pnl: trade.pnl || 0,
        cumulative: 0,
      }))

    // Calculate cumulative P/L
    let cumulative = 0
    return closedTrades.map((item) => {
      cumulative += item.pnl
      return { ...item, cumulative }
    })
  }, [filteredTrades])

  const emotionData = useMemo(() => {
    const emotionMap = new Map<string, { count: number; totalPnL: number }>()

    filteredTrades.forEach((trade) => {
      trade.preEntryEmotions.forEach((emotion) => {
        const key = emotion.type
        const existing = emotionMap.get(key) || { count: 0, totalPnL: 0 }
        emotionMap.set(key, {
          count: existing.count + 1,
          totalPnL: existing.totalPnL + (trade.pnl || 0),
        })
      })
    })

    return Array.from(emotionMap.entries()).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      avgPnL: data.totalPnL / data.count,
    }))
  }, [filteredTrades])

  const handleAnalyze = async () => {
    try {
      const result = await analyzeWithAI({
        userId: user?.id || 'user1',
        trades: filteredTrades.slice(0, 20), // Last 20 trades of filtered set
      }).unwrap()
      setInsights(result.patterns || [])
    } catch (error) {
      console.error('Failed to analyze:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Get AI Insights'}
        </button>
      </div>

      <DateRangeFilter />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Avg P/L</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.avgPnL)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.tradesCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Expectancy</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.expectancy)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Avg Conviction</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.avgConviction.toFixed(1)}/10</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">P/L Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cumulative" stroke="#0ea5e9" name="Cumulative P/L" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emotions vs P/L</h2>
          {emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPnL" name="Avg P/L">
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgPnL > 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p className="text-center">
                No emotions logged yet.<br />
                <span className="text-sm">Add emotions to your trades to see insights.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

