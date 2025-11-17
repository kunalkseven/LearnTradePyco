import { configureStore } from '@reduxjs/toolkit'
import tradesReducer from '../features/trades/tradesSlice'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import { apiSlice } from '../api/apiSlice'

export const store = configureStore({
  reducer: {
    trades: tradesReducer,
    auth: authReducer,
    ui: uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

