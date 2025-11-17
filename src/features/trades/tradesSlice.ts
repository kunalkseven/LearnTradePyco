import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Trade, TradeFilters } from '../../types'
import { sampleTrades } from '../../utils/sampleData'

interface TradesState {
  trades: Trade[]
  filters: TradeFilters
  selectedTradeId: string | null
}

const initialState: TradesState = {
  trades: sampleTrades,
  filters: {},
  selectedTradeId: null,
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload)
    },
    updateTrade: (state, action: PayloadAction<{ id: string; updates: Partial<Trade> }>) => {
      const index = state.trades.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.trades[index] = { ...state.trades[index], ...action.payload.updates }
      }
    },
    deleteTrade: (state, action: PayloadAction<string>) => {
      state.trades = state.trades.filter((t) => t.id !== action.payload)
    },
    setFilters: (state, action: PayloadAction<TradeFilters>) => {
      state.filters = action.payload
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setSelectedTrade: (state, action: PayloadAction<string | null>) => {
      state.selectedTradeId = action.payload
    },
    syncTrades: (state, action: PayloadAction<Trade[]>) => {
      // Merge remote trades with local, keeping local changes
      const localTrades = state.trades
      const remoteTrades = action.payload
      
      // Create a map of local trades by ID
      const localMap = new Map(localTrades.map((t) => [t.id, t]))
      
      // Merge: prefer local if exists, otherwise use remote
      const merged = remoteTrades.map((remote) => {
        const local = localMap.get(remote.id)
        return local || remote
      })
      
      // Add any local-only trades
      remoteTrades.forEach((remote) => localMap.delete(remote.id))
      const localOnly = Array.from(localMap.values())
      
      state.trades = [...merged, ...localOnly]
    },
  },
})

export const {
  addTrade,
  updateTrade,
  deleteTrade,
  setFilters,
  clearFilters,
  setSelectedTrade,
  syncTrades,
} = tradesSlice.actions

export default tradesSlice.reducer

