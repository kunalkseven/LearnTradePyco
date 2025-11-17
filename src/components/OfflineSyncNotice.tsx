import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { setPendingSyncCount } from '../features/ui/uiSlice'
import { localSync } from '../utils/localSync'

export default function OfflineSyncNotice() {
  const dispatch = useAppDispatch()
  const { isOffline, pendingSyncCount } = useAppSelector((state) => state.ui)

  useEffect(() => {
    const updateSyncCount = async () => {
      const queue = await localSync.getQueue()
      dispatch(setPendingSyncCount(queue.length))
    }

    updateSyncCount()
    const interval = setInterval(updateSyncCount, 5000)
    return () => clearInterval(interval)
  }, [dispatch])

  if (!isOffline && pendingSyncCount === 0) return null

  const handleSync = async () => {
    if (navigator.onLine) {
      await localSync.flushQueue()
      const queue = await localSync.getQueue()
      dispatch(setPendingSyncCount(queue.length))
    }
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg
        ${isOffline ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-blue-100 border-2 border-blue-400'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div>
          {isOffline ? (
            <p className="text-sm font-medium text-yellow-800">
              You're offline. Changes will sync when you're back online.
            </p>
          ) : (
            <p className="text-sm font-medium text-blue-800">
              {pendingSyncCount} item{pendingSyncCount !== 1 ? 's' : ''} pending sync
            </p>
          )}
        </div>
        {!isOffline && pendingSyncCount > 0 && (
          <button
            onClick={handleSync}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sync now"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  )
}

