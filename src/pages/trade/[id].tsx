import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { useGetTradeQuery, useUpdateTradeMutation, useAnalyzeWithAIMutation, useGetSimilarTradesQuery } from '../../api/apiSlice'
import { updateTrade } from '../../features/trades/tradesSlice'
import { Trade, EmotionType } from '../../types'
import { formatCurrency, formatDate, getEmotionColor, getEmotionIcon, calculatePnL, calculatePnLPercent } from '../../utils/helpers'
import { localSync } from '../../utils/localSync'
import EmotionPicker from '../../components/EmotionPicker'
import DecisionGraph from '../../components/DecisionGraph'
import InsightCard from '../../components/InsightCard'
import ScreenshotUploader from '../../components/ScreenshotUploader'

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { trades } = useAppSelector((state) => state.trades)
  const { user } = useAppSelector((state) => state.auth)
  
  const { data: trade, isLoading } = useGetTradeQuery(id || '', { skip: !id })
  const [updateTradeMutation] = useUpdateTradeMutation()
  const [analyzeWithAI, { data: aiAnalysis, isLoading: isAnalyzing }] = useAnalyzeWithAIMutation()
  const { data: similarTrades } = useGetSimilarTradesQuery(id || '', { skip: !id })
  
  // Fallback to local store if API fails
  const localTrade = trades.find((t) => t.id === id)
  const currentTrade = trade || localTrade

  const [isEditing, setIsEditing] = useState(false)
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([])
  const [insights, setInsights] = useState(aiAnalysis?.patterns || [])

  const { register, handleSubmit } = useForm<Partial<Trade>>({
    defaultValues: currentTrade,
  })

  if (isLoading && !localTrade) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!currentTrade) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Trade not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const pnl = calculatePnL(currentTrade)
  const pnlPercent = calculatePnLPercent(currentTrade)
  const isProfit = pnl > 0

  const handleUpdate = async (data: Partial<Trade>) => {
    const updates: Partial<Trade> = {
      ...data,
      exitTime: data.exitTime || currentTrade.exitTime,
      exitPrice: data.exitPrice || currentTrade.exitPrice,
    }

    if (selectedEmotions.length > 0) {
      updates.postExitEmotions = selectedEmotions.map((type) => ({
        type,
        intensity: 5,
        timestamp: new Date().toISOString(),
      }))
    }

    // Optimistic update
    dispatch(updateTrade({ id: currentTrade.id, updates }))

    // Try to save to backend
    if (navigator.onLine) {
      try {
        await updateTradeMutation({ id: currentTrade.id, updates }).unwrap()
      } catch (error) {
        console.error('Failed to update trade:', error)
        await localSync.addToQueue({
          type: 'update',
          endpoint: `/trades/${currentTrade.id}`,
          payload: updates,
        })
      }
    } else {
      await localSync.addToQueue({
        type: 'update',
        endpoint: `/trades/${currentTrade.id}`,
        payload: updates,
      })
    }

    setIsEditing(false)
  }

  const handleAnalyze = async () => {
    try {
      const result = await analyzeWithAI({
        userId: user?.id || 'user1',
        tradeIds: [currentTrade.id],
        trades: [currentTrade],
      }).unwrap()
      setInsights(result.patterns || [])
    } catch (error) {
      console.error('Failed to analyze:', error)
    }
  }

  const handleImageUpload = async (url: string) => {
    const updates = {
      screenshots: [...(currentTrade.screenshots || []), url],
    }
    dispatch(updateTrade({ id: currentTrade.id, updates }))
    if (navigator.onLine) {
      try {
        await updateTradeMutation({ id: currentTrade.id, updates }).unwrap()
      } catch (error) {
        console.error('Failed to update screenshots:', error)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {currentTrade.instrument} - {currentTrade.direction}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Trade Info */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Trade Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Price
                    </label>
                    <input
                      {...register('exitPrice', { valueAsNumber: true })}
                      type="number"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Time
                    </label>
                    <input
                      {...register('exitTime')}
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exit Reason
                  </label>
                  <input
                    {...register('exitReason')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post-Exit Emotions
                  </label>
                  <EmotionPicker
                    selected={selectedEmotions}
                    onChange={setSelectedEmotions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post-Exit Journal
                  </label>
                  <textarea
                    {...register('postExitJournal')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">Entry Price</dt>
                  <dd className="text-lg font-semibold">{currentTrade.entryPrice}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Size</dt>
                  <dd className="text-lg font-semibold">{currentTrade.size}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Entry Time</dt>
                  <dd className="text-lg font-semibold">{formatDate(currentTrade.entryTime)}</dd>
                </div>
                {currentTrade.exitPrice && (
                  <>
                    <div>
                      <dt className="text-sm text-gray-600">Exit Price</dt>
                      <dd className="text-lg font-semibold">{currentTrade.exitPrice}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Exit Time</dt>
                      <dd className="text-lg font-semibold">
                        {currentTrade.exitTime ? formatDate(currentTrade.exitTime) : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">P/L</dt>
                      <dd className={`text-lg font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? '+' : ''}{formatCurrency(pnl)} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </dd>
                    </div>
                  </>
                )}
                <div>
                  <dt className="text-sm text-gray-600">Conviction</dt>
                  <dd className="text-lg font-semibold">{currentTrade.conviction}/10</dd>
                </div>
                {currentTrade.quickReason && (
                  <div className="col-span-2">
                    <dt className="text-sm text-gray-600">Quick Reason</dt>
                    <dd className="text-lg">{currentTrade.quickReason}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* Journals */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Journals</h2>
            {currentTrade.preEntryJournal && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pre-Entry</h3>
                <p className="text-gray-600">{currentTrade.preEntryJournal}</p>
              </div>
            )}
            {currentTrade.postExitJournal && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Post-Exit</h3>
                <p className="text-gray-600">{currentTrade.postExitJournal}</p>
              </div>
            )}
          </div>

          {/* Emotions Timeline */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emotions Timeline</h2>
            <div className="space-y-3">
              {currentTrade.preEntryEmotions.map((emotion, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded border ${getEmotionColor(emotion.type)}`}>
                    {getEmotionIcon(emotion.type)} {emotion.type}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(emotion.timestamp)}</span>
                </div>
              ))}
              {currentTrade.postExitEmotions?.map((emotion, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded border ${getEmotionColor(emotion.type)}`}>
                    {getEmotionIcon(emotion.type)} {emotion.type}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(emotion.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h2>
            <ScreenshotUploader
              onUploadComplete={handleImageUpload}
              existingImages={currentTrade.screenshots}
            />
          </div>

          {/* Decision Graph */}
          <DecisionGraph trade={currentTrade} />

          {/* AI Analysis */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
            {insights.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Similar Trades */}
          {similarTrades && similarTrades.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Trades</h2>
              <div className="space-y-2">
                {similarTrades.map((similar) => (
                  <button
                    key={similar.tradeId}
                    onClick={() => navigate(`/trade/${similar.tradeId}`)}
                    className="w-full text-left p-2 rounded hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium">Trade {similar.tradeId}</p>
                    <p className="text-xs text-gray-500">
                      {similar.commonFactors.join(', ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

