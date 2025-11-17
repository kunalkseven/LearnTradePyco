import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

const initialState: AuthState = {
  user: {
    id: 'user1',
    email: 'trader@example.com',
    name: 'Demo Trader',
    settings: {
      riskLimits: {
        maxPositionSize: 10000,
        maxDailyLoss: 500,
        maxDrawdown: 2000,
      },
      preTradeChecklist: {
        enabled: true,
        items: [
          'Check market conditions',
          'Verify risk/reward ratio',
          'Confirm entry signal',
        ],
      },
      currency: 'USD',
      timezone: 'UTC',
    },
  },
  isAuthenticated: true,
  token: 'mock_token',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('auth_token')
    },
    updateSettings: (state, action: PayloadAction<Partial<User['settings']>>) => {
      if (state.user) {
        state.user.settings = { ...state.user.settings, ...action.payload }
      }
    },
  },
})

export const { setUser, logout, updateSettings } = authSlice.actions

export default authSlice.reducer

