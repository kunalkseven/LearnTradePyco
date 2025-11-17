import localforage from 'localforage'
import { OfflineQueueItem } from '../types'

const QUEUE_KEY = 'offline_queue'
const TRADES_KEY = 'trades_cache'

// Initialize localForage
localforage.config({
  name: 'TradingJournal',
  storeName: 'trades',
  description: 'Trading journal offline storage',
})

export const localSync = {
  // Add item to offline queue
  async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.getQueue()
    const newItem: OfflineQueueItem = {
      ...item,
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retries: 0,
    }
    queue.push(newItem)
    await localforage.setItem(QUEUE_KEY, queue)
  },

  // Get current queue
  async getQueue(): Promise<OfflineQueueItem[]> {
    const queue = await localforage.getItem<OfflineQueueItem[]>(QUEUE_KEY)
    return queue || []
  },

  // Remove item from queue
  async removeFromQueue(itemId: string): Promise<void> {
    const queue = await this.getQueue()
    const filtered = queue.filter((item) => item.id !== itemId)
    await localforage.setItem(QUEUE_KEY, filtered)
  },

  // Flush queue when online
  async flushQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline - cannot flush queue')
      return
    }

    const queue = await this.getQueue()
    if (queue.length === 0) return

    console.log(`Flushing ${queue.length} items from queue`)

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    for (const item of queue) {
      try {
        const url = `${apiBaseUrl}${item.endpoint}`
        const response = await fetch(url, {
          method: item.type === 'delete' ? 'DELETE' : item.type === 'update' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.payload),
        })

        if (response.ok) {
          await this.removeFromQueue(item.id)
          console.log(`Successfully synced item ${item.id}`)
        } else {
          // Increment retries
          item.retries += 1
          if (item.retries >= 3) {
            // Remove after 3 failed retries
            await this.removeFromQueue(item.id)
            console.error(`Failed to sync item ${item.id} after ${item.retries} retries`)
          } else {
            // Update queue with incremented retries
            const updatedQueue = await this.getQueue()
            const index = updatedQueue.findIndex((q) => q.id === item.id)
            if (index !== -1) {
              updatedQueue[index] = item
              await localforage.setItem(QUEUE_KEY, updatedQueue)
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error)
        item.retries += 1
        if (item.retries < 3) {
          const updatedQueue = await this.getQueue()
          const index = updatedQueue.findIndex((q) => q.id === item.id)
          if (index !== -1) {
            updatedQueue[index] = item
            await localforage.setItem(QUEUE_KEY, updatedQueue)
          }
        } else {
          await this.removeFromQueue(item.id)
        }
      }
    }
  },

  // Cache trade locally
  async cacheTrade(trade: unknown): Promise<void> {
    const trades = await this.getCachedTrades()
    trades.push(trade)
    await localforage.setItem(TRADES_KEY, trades)
  },

  // Get cached trades
  async getCachedTrades(): Promise<unknown[]> {
    const trades = await localforage.getItem<unknown[]>(TRADES_KEY)
    return trades || []
  },

  // Clear cache
  async clearCache(): Promise<void> {
    await localforage.removeItem(TRADES_KEY)
    await localforage.removeItem(QUEUE_KEY)
  },
}

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online - flushing queue')
    localSync.flushQueue()
  })

  window.addEventListener('offline', () => {
    console.log('Gone offline')
  })
}

