import { TrendingUp, LogOut, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { openLogModal } from '../features/ui/uiSlice'
import { logout } from '../features/auth/authSlice'
import { clearAllTrades } from '../features/trades/tradesSlice'
import { useNavigate } from 'react-router-dom'

export default function MobileHeader() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(clearAllTrades())
        dispatch(logout())
        navigate('/login')
    }

    return (
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                    <span className="text-lg font-bold text-gray-900">TradeJournal</span>
                </div>
                <div className="flex items-center gap-2">
                    {user && (
                        <span className="text-xs text-gray-600 max-w-[100px] truncate hidden sm:inline">
                            {user.name}
                        </span>
                    )}
                    <button
                        onClick={() => dispatch(openLogModal())}
                        className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        aria-label="Quick Log"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
