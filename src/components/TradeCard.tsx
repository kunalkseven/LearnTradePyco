import { Link } from 'react-router-dom'
import { Trade } from '../types'
import { formatCurrency, formatDate, getEmotionColor, getEmotionIcon } from '../utils/helpers'

interface TradeCardProps {
  trade: Trade
}

export default function TradeCard({ trade }: TradeCardProps) {
  const pnl = trade.pnl || 0
  const pnlPercent = trade.pnlPercent || 0
  const isProfit = pnl > 0
  const isLoss = pnl < 0

  // Guard: Don't render if trade doesn't have a valid ID
  if (!trade.id || trade.id === 'undefined' || trade.id === 'null') {
    console.error('TradeCard received trade without valid ID:', trade)
    return null
  }

  return (
    <Link
      to={`/trade/${trade.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-200 hover:border-primary-200"
      aria-label={`View trade ${trade.instrument} ${trade.direction}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {trade.instrument} <span className="text-sm font-medium text-gray-500">({trade.direction})</span>
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(trade.entryTime)}</p>
        </div>
        <div className="text-right">
          {trade.status === 'closed' ? (
            <>
              <p className={`text-lg font-bold ${isProfit ? 'text-emerald-600' : isLoss ? 'text-red-600' : 'text-gray-600'}`}>
                {isProfit ? '+' : ''}{formatCurrency(pnl)}
              </p>
              <p className={`text-sm font-medium ${isProfit ? 'text-emerald-600' : isLoss ? 'text-red-600' : 'text-gray-600'}`}>
                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
              </p>
            </>
          ) : (
            <span className="px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-lg">
              Open
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Conviction:</span>
          <span className="text-sm font-semibold text-gray-900">{trade.conviction}/10</span>
        </div>
        {trade.quickReason && (
          <p className="text-sm text-gray-600 truncate flex-1">{trade.quickReason}</p>
        )}
      </div>

      {trade.preEntryEmotions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {trade.preEntryEmotions.map((emotion, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${getEmotionColor(emotion.type)}`}
            >
              {getEmotionIcon(emotion.type)} {emotion.type}
            </span>
          ))}
        </div>
      )}

      {trade.screenshots && trade.screenshots.length > 0 && (
        <div className="mt-3">
          <img
            src={trade.screenshots[0]}
            alt="Trade screenshot"
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      {trade.tags && trade.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {trade.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

