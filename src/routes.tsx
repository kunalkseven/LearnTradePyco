import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import DashboardPage from './pages/index'
import TradeDetailPage from './pages/trade/[id]'
import LogTradePage from './pages/log'
import SettingsPage from './pages/settings'
import ImportPage from './pages/import'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'trade/:id',
        element: <TradeDetailPage />,
      },
      {
        path: 'log',
        element: <LogTradePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'import',
        element: <ImportPage />,
      },
    ],
  },
])

