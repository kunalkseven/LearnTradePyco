import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { router } from './routes'
import './styles/index.css'

// MSW is DISABLED - All users use real backend API
// To enable MSW for development/demo, set VITE_ENABLE_MSW=true in .env
const shouldEnableMocking = import.meta.env.VITE_ENABLE_MSW === 'true'

async function enableMocking() {
  if (!shouldEnableMocking) {
    console.log('🚀 Using real backend API (MSW disabled)')
    return
  }

  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
    console.log('🔧 MSW enabled for development')
  } catch (error) {
    console.warn('Failed to start MSW:', error)
  }
}

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>
  )
}

enableMocking().finally(renderApp)

