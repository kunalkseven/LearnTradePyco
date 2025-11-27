import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import DashboardPage from './pages/index'
import TradeDetailPage from './pages/trade/[id]'
import LogTradePage from './pages/log'
import SettingsPage from './pages/settings'
import ImportPage from './pages/import'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/login'
import RegisterPage from './pages/auth/register'
import ForgotPasswordPage from './pages/auth/forgot-password'
import ResetPasswordPage from './pages/auth/reset-password'

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
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
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
])

