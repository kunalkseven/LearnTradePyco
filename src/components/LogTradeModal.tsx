import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { closeLogModal } from '../features/ui/uiSlice'
import { addTrade } from '../features/trades/tradesSlice'
import { useCreateTradeMutation } from '../api/apiSlice'
import { tradeSchema, TradeFormData } from '../utils/validators'
import { Trade, EmotionType, Emotion } from '../types'
import { localSync } from '../utils/localSync'
import EmotionPicker from './EmotionPicker'
import ConvictionSlider from './ConvictionSlider'

export default function LogTradeModal() {
  const dispatch = useAppDispatch()
  const { isLogModalOpen } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const [createTrade] = useCreateTradeMutation()
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([])
  const [conviction, setConviction] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      entryTime: new Date().toISOString(),
      conviction: 5,
      preEntryEmotions: [],
    },
  })

  if (!isLogModalOpen) return null

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true)
    
    const emotions: Emotion[] = selectedEmotions.map((type) => ({
      type,
      intensity: 5,
      timestamp: new Date().toISOString(),
    }))

    const newTrade: Trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || 'user1',
      instrument: data.instrument,
      direction: data.direction,
      entryPrice: data.entryPrice,
      entryTime: data.entryTime,
      size: data.size,
      conviction,
      quickReason: data.quickReason,
      preEntryEmotions: emotions,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistic update
    dispatch(addTrade(newTrade))

    // Try to save to backend
    if (navigator.onLine) {
      try {
        await createTrade(newTrade).unwrap()
      } catch (error) {
        console.error('Failed to create trade:', error)
        // Add to offline queue
        await localSync.addToQueue({
          type: 'create',
          endpoint: '/trades',
          payload: newTrade,
        })
      }
    } else {
      // Offline - add to queue
      await localSync.addToQueue({
        type: 'create',
        endpoint: '/trades',
        payload: newTrade,
      })
    }

    // Reset form and close
    reset()
    setSelectedEmotions([])
    setConviction(5)
    setIsSubmitting(false)
    dispatch(closeLogModal())
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => dispatch(closeLogModal())}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-trade-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="log-trade-title" className="text-2xl font-bold text-gray-900">
            Quick Log Trade
          </h2>
          <button
            onClick={() => dispatch(closeLogModal())}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrument *
              </label>
              <input
                {...register('instrument')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="EURUSD, BTCUSD, etc."
                aria-invalid={errors.instrument ? 'true' : 'false'}
              />
              {errors.instrument && (
                <p className="mt-1 text-sm text-red-600">{errors.instrument.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction *
              </label>
              <select
                {...register('direction')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={errors.direction ? 'true' : 'false'}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Price *
              </label>
              <input
                {...register('entryPrice', { valueAsNumber: true })}
                type="number"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={errors.entryPrice ? 'true' : 'false'}
              />
              {errors.entryPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.entryPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size *
              </label>
              <input
                {...register('size', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={errors.size ? 'true' : 'false'}
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Time *
              </label>
              <input
                {...register('entryTime')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue={new Date().toISOString().slice(0, 16)}
                aria-invalid={errors.entryTime ? 'true' : 'false'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Reason
            </label>
            <input
              {...register('quickReason')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief reason for entry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pre-Entry Emotions
            </label>
            <EmotionPicker
              selected={selectedEmotions}
              onChange={setSelectedEmotions}
            />
          </div>

          <div>
            <ConvictionSlider value={conviction} onChange={setConviction} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => dispatch(closeLogModal())}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

