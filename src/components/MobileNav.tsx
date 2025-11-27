import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Upload, Settings } from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Import', href: '/import', icon: Upload },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export default function MobileNav() {
    const location = useLocation()

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
            <div className="grid grid-cols-3 h-16">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex flex-col items-center justify-center gap-1 ${isActive ? 'text-primary-600' : 'text-gray-500'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
