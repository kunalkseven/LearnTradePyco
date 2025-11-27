import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { openLogModal } from './features/ui/uiSlice'
import LogTradeModal from './components/LogTradeModal'
import OfflineSyncNotice from './components/OfflineSyncNotice'
import TradeList from './components/TradeList'
import { logout } from './features/auth/authSlice'
import { clearAllTrades } from './features/trades/tradesSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const isDashboard = location.pathname === '/'

  const handleLogout = () => {
    dispatch(clearAllTrades()) // Clear trades first
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Trading Journal
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/import"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/import'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Import
                </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.name}
                </span>
              )}
              <button
                onClick={() => dispatch(openLogModal())}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Quick Log
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
        {isDashboard && (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Trades</h2>
            <TradeList />
          </div>
        )}
      </main>

      <LogTradeModal />
      <OfflineSyncNotice />
    </div>
  )
}

