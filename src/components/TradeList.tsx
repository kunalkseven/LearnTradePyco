import { useMemo, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearFilters, setFilters } from '../features/trades/tradesSlice'
import { EmotionType, Trade } from '../types'
import TradeCard from './TradeCard'
import DateRangeFilter from './DateRangeFilter'

interface TradeListProps {
  onTradeClick?: (trade: Trade) => void
}

export default function TradeList(_props: TradeListProps) {
  const dispatch = useAppDispatch()
  const { trades, filters } = useAppSelector((state) => state.trades)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const emotionOptions: EmotionType[] = [
    'Fear',
    'Greed',
    'Calm',
    'Frustration',
    'Excitement',
    'Boredom',
    'Confidence',
    'Doubt',
  ]
  const pnlOptions: { label: string; value: 'all' | 'profit' | 'loss' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Profits', value: 'profit' },
    { label: 'Losses', value: 'loss' },
  ]

  const toggleEmotionFilter = (emotion: EmotionType) => {
    const current = filters.emotions || []
    const exists = current.includes(emotion)
    const updated = exists ? current.filter((e) => e !== emotion) : [...current, emotion]
    dispatch(
      setFilters({
        ...filters,
        emotions: updated.length > 0 ? updated : undefined,
      })
    )
  }

  const handlePnlFilterChange = (value: 'all' | 'profit' | 'loss') => {
    dispatch(
      setFilters({
        ...filters,
        pnlType: value,
      })
    )
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const filteredTrades = useMemo(() => {
    // First, filter out any trades without valid IDs
    let result = trades.filter(trade => trade.id && trade.id !== 'undefined' && trade.id !== 'null')

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

    if (filters.pnlType && filters.pnlType !== 'all') {
      result = result.filter((trade) => {
        const pnl = trade.pnl || 0
        if (filters.pnlType === 'profit') {
          return pnl > 0
        }
        if (filters.pnlType === 'loss') {
          return pnl < 0
        }
        return true
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery])

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search trades by instrument, reason, or journal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
          aria-label="Search trades"
        />

        <DateRangeFilter />

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Filter by Emotion</p>
              <button
                type="button"
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionOptions.map((emotion) => {
                const isActive = filters.emotions?.includes(emotion)
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotionFilter(emotion)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${isActive
                      ? 'bg-primary-100 text-primary-700 border-primary-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    aria-pressed={isActive}
                  >
                    {emotion}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Filter by Result</p>
            <div className="flex flex-wrap gap-2">
              {pnlOptions.map((option) => {
                const isActive = (filters.pnlType || 'all') === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePnlFilterChange(option.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${isActive
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No trades found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredTrades.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
