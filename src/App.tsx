import { Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { openLogModal } from './features/ui/uiSlice'
import LogTradeModal from './components/LogTradeModal'
import OfflineSyncNotice from './components/OfflineSyncNotice'
import TradeList from './components/TradeList'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import MobileHeader from './components/MobileHeader'
import { Plus, LogOut } from 'lucide-react'
import { logout } from './features/auth/authSlice'
import { clearAllTrades } from './features/trades/tradesSlice'
import { useNavigate } from 'react-router-dom'

export default function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const isDashboard = location.pathname === '/'

  const handleLogout = () => {
    dispatch(clearAllTrades())
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Desktop Header/Toolbar */}
        <div className="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/import' && 'Import Trades'}
              {location.pathname === '/settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name}
              </span>
            )}
            <button
              onClick={() => dispatch(openLogModal())}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Quick Log
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="pb-20 lg:pb-8">
          <Outlet />
          {isDashboard && (
            <div className="px-4 lg:px-6 py-6 lg:py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Trades</h2>
              <TradeList />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals */}
      <LogTradeModal />
      <OfflineSyncNotice />
    </div>
  )
}

