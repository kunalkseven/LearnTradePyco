import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, Upload, TrendingUp } from 'lucide-react'
import { useAppSelector } from '../app/hooks'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Import', href: '/import', icon: Upload },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
    const location = useLocation()
    const { user } = useAppSelector((state) => state.auth)

    return (
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-7 h-7 text-primary-600" />
                    <span className="text-xl font-bold text-gray-900">TradeJournal</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User Info at Bottom */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
