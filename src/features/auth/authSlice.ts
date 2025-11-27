import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

const storedUser = localStorage.getItem('auth_user')
const storedToken = localStorage.getItem('auth_token')

const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  isAuthenticated: Boolean(storedToken),
  token: storedToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('auth_token', action.payload.token)
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // Clear demo user flag on logout
      localStorage.removeItem('isDemoUser')
    },
    updateSettings: (state, action: PayloadAction<Partial<User['settings']>>) => {
      if (state.user) {
        state.user.settings = { ...state.user.settings, ...action.payload }
        localStorage.setItem('auth_user', JSON.stringify(state.user))
      }
    },
  },
})

export const { setCredentials, logout, updateSettings } = authSlice.actions

export default authSlice.reducer

