import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { useGetTradesQuery } from '../api/apiSlice'
import { syncTrades } from '../features/trades/tradesSlice'
import { sampleTrades } from '../utils/sampleData'

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const dispatch = useAppDispatch()

  // Check if current user is admin (demo user)
  const isAdminUser = user?.email === 'admin007@gmail.com'

  // Load sample trades for admin user on mount
  useEffect(() => {
    if (isAdminUser) {
      dispatch(syncTrades(sampleTrades))
    }
  }, [isAdminUser, dispatch])

  // Fetch trades from backend API when authenticated (skip for admin/demo user)
  const { data: tradesFromAPI, isLoading } = useGetTradesQuery(undefined, {
    skip: !isAuthenticated || isAdminUser, // Skip API call for admin
  })

  // Sync trades from API to Redux store (only for non-admin users)
  useEffect(() => {
    if (tradesFromAPI && !isAdminUser) {
      dispatch(syncTrades(tradesFromAPI))
    }
  }, [tradesFromAPI, dispatch, isAdminUser])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Show loading state while fetching trades (not for admin)
  if (isLoading && !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trades...</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
