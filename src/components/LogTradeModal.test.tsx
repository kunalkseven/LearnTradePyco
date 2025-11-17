import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import LogTradeModal from './LogTradeModal'
import tradesReducer from '../features/trades/tradesSlice'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'

const createMockStore = () => {
  return configureStore({
    reducer: {
      trades: tradesReducer,
      auth: authReducer,
      ui: uiReducer,
    },
  })
}

describe('LogTradeModal', () => {
  it('renders when modal is open', () => {
    const store = createMockStore()
    store.dispatch({ type: 'ui/openLogModal' })

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogTradeModal />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText('Quick Log Trade')).toBeInTheDocument()
  })

  it('does not render when modal is closed', () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LogTradeModal />
        </BrowserRouter>
      </Provider>
    )

    expect(screen.queryByText('Quick Log Trade')).not.toBeInTheDocument()
  })

  // Add more tests for form submission, validation, etc.
})

