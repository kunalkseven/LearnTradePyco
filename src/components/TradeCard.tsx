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

  return (
    <Link
      to={`/trade/${trade.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200"
      aria-label={`View trade ${trade.instrument} ${trade.direction}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {trade.instrument} <span className="text-sm font-normal text-gray-500">({trade.direction})</span>
          </h3>
          <p className="text-sm text-gray-500">{formatDate(trade.entryTime)}</p>
        </div>
        <div className="text-right">
          {trade.status === 'closed' ? (
            <>
              <p className={`text-lg font-bold ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-600'}`}>
                {isProfit ? '+' : ''}{formatCurrency(pnl)}
              </p>
              <p className={`text-sm ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-600'}`}>
                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
              </p>
            </>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              Open
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Conviction:</span>
          <span className="text-sm font-medium">{trade.conviction}/10</span>
        </div>
        {trade.quickReason && (
          <p className="text-sm text-gray-600 truncate flex-1">{trade.quickReason}</p>
        )}
      </div>

      {trade.preEntryEmotions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {trade.preEntryEmotions.map((emotion, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded border ${getEmotionColor(emotion.type)}`}
            >
              {getEmotionIcon(emotion.type)} {emotion.type}
            </span>
          ))}
        </div>
      )}

      {trade.screenshots && trade.screenshots.length > 0 && (
        <div className="mt-2">
          <img
            src={trade.screenshots[0]}
            alt="Trade screenshot"
            className="w-full h-32 object-cover rounded border border-gray-200"
          />
        </div>
      )}

      {trade.tags && trade.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {trade.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

