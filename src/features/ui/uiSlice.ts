import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isLogModalOpen: boolean
  isOffline: boolean
  pendingSyncCount: number
  theme: 'light' | 'dark'
}

const initialState: UIState = {
  isLogModalOpen: false,
  isOffline: !navigator.onLine,
  pendingSyncCount: 0,
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLogModal: (state) => {
      state.isLogModalOpen = true
    },
    closeLogModal: (state) => {
      state.isLogModalOpen = false
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload
    },
    setPendingSyncCount: (state, action: PayloadAction<number>) => {
      state.pendingSyncCount = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
  },
})

export const {
  openLogModal,
  closeLogModal,
  setOffline,
  setPendingSyncCount,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer

