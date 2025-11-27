import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setFilters } from '../features/trades/tradesSlice'

type RangeType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all'

export default function DateRangeFilter() {
    const dispatch = useAppDispatch()
    const { filters } = useAppSelector((state) => state.trades)
    const [rangeType, setRangeType] = useState<RangeType>('all')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    const applyFilter = (type: RangeType, start?: string, end?: string) => {
        setRangeType(type)

        if (type === 'all') {
            dispatch(setFilters({ ...filters, dateRange: undefined }))
            return
        }

        const now = new Date()
        let startDate = new Date()
        let endDate = new Date()

        // Set time to end of day for end date
        endDate.setHours(23, 59, 59, 999)

        switch (type) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'weekly':
                // Start of week (Monday)
                const day = now.getDay()
                const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                startDate.setDate(diff)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'monthly':
                startDate.setDate(1)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'yearly':
                startDate.setMonth(0, 1)
                startDate.setHours(0, 0, 0, 0)
                break
            case 'custom':
                if (start && end) {
                    startDate = new Date(start)
                    endDate = new Date(end)
                    endDate.setHours(23, 59, 59, 999)
                } else {
                    return // Don't apply if dates missing
                }
                break
        }

        dispatch(setFilters({
            ...filters,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            }
        }))
    }

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            applyFilter('custom', customStart, customEnd)
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => applyFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => applyFilter('daily')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'daily'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Daily
                </button>
                <button
                    onClick={() => applyFilter('weekly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'weekly'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Weekly
                </button>
                <button
                    onClick={() => applyFilter('monthly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'monthly'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => applyFilter('yearly')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'yearly'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Yearly
                </button>
                <button
                    onClick={() => setRangeType('custom')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${rangeType === 'custom'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Custom
                </button>
            </div>

            {rangeType === 'custom' && (
                <div className="flex items-end gap-2 p-3 bg-gray-50 rounded-md">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                    </div>
                    <button
                        onClick={handleCustomApply}
                        disabled={!customStart || !customEnd}
                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    )
}
