import { useMemo, useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { Trade } from '../types'
import TradeCard from './TradeCard'

interface TradeListProps {
  onTradeClick?: (trade: Trade) => void
}

export default function TradeList(_props: TradeListProps) {
  const { trades, filters } = useAppSelector((state) => state.trades)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTrades = useMemo(() => {
    let result = [...trades]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (trade) =>
          trade.instrument.toLowerCase().includes(query) ||
          trade.quickReason?.toLowerCase().includes(query) ||
          trade.preEntryJournal?.toLowerCase().includes(query)
      )
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((trade) =>
        filters.tags!.some((tag) => trade.tags?.includes(tag))
      )
    }

    // Emotion filter
    if (filters.emotions && filters.emotions.length > 0) {
      result = result.filter((trade) =>
        filters.emotions!.some((emotion) =>
          trade.preEntryEmotions.some((e) => e.type === emotion)
        )
      )
    }

    // P/L range filter
    if (filters.pnlRange) {
      result = result.filter((trade) => {
        const pnl = trade.pnl || 0
        return pnl >= filters.pnlRange!.min && pnl <= filters.pnlRange!.max
      })
    }

    // Date range filter
    if (filters.dateRange) {
      result = result.filter((trade) => {
        const entryDate = new Date(trade.entryTime)
        const start = new Date(filters.dateRange!.start)
        const end = new Date(filters.dateRange!.end)
        return entryDate >= start && entryDate <= end
      })
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((trade) => trade.status === filters.status)
    }

    return result.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
  }, [trades, filters, searchQuery])

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search trades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Search trades"
        />
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No trades found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  )
}

