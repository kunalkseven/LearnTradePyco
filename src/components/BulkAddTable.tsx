import { useState } from 'react'
import { Trade } from '../types'

interface BulkTradeRow {
    id: string
    instrument: string
    direction: 'long' | 'short'
    entryPrice: string
    exitPrice: string
    size: string
    entryTime: string
    exitTime: string
    conviction: string
    quickReason: string
    preEntryEmotions: string
    tags: string
    preEntryJournal: string
    exitReason: string
}

interface BulkAddTableProps {
    onImport: (trades: Trade[]) => void
}

export default function BulkAddTable({ onImport }: BulkAddTableProps) {
    const [rows, setRows] = useState<BulkTradeRow[]>([
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
    ])

    function createEmptyRow(): BulkTradeRow {
        return {
            id: `temp_${Date.now()}_${Math.random()}`,
            instrument: '',
            direction: 'long',
            entryPrice: '',
            exitPrice: '',
            size: '',
            entryTime: '',
            exitTime: '',
            conviction: '5',
            quickReason: '',
            preEntryEmotions: '',
            tags: '',
            preEntryJournal: '',
            exitReason: '',
        }
    }

    const updateRow = (id: string, field: keyof BulkTradeRow, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row))
    }

    const addRow = () => {
        setRows([...rows, createEmptyRow()])
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id))
        }
    }

    const handleImport = () => {
        const validTrades: Trade[] = rows
            .filter(row => row.instrument && row.entryPrice && row.size)
            .map((row, idx) => ({
                id: `bulk_${Date.now()}_${idx}`,
                userId: 'user1',
                instrument: row.instrument,
                direction: row.direction,
                entryPrice: parseFloat(row.entryPrice) || 0,
                exitPrice: row.exitPrice ? parseFloat(row.exitPrice) : undefined,
                size: parseFloat(row.size) || 1,
                entryTime: row.entryTime || new Date().toISOString(),
                exitTime: row.exitTime || undefined,
                conviction: parseInt(row.conviction) || 5,
                quickReason: row.quickReason || undefined,
                preEntryEmotions: row.preEntryEmotions
                    ? row.preEntryEmotions.split(',').map(e => ({
                        type: e.trim() as any,
                        intensity: 5,
                        timestamp: new Date().toISOString()
                    }))
                    : [],
                postExitEmotions: [],
                tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                preEntryJournal: row.preEntryJournal || undefined,
                exitReason: row.exitReason || undefined,
                status: row.exitPrice ? 'closed' : 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as Trade))

        if (validTrades.length === 0) {
            alert('Please fill in at least Instrument, Entry Price, and Size for one trade')
            return
        }

        onImport(validTrades)

        // Reset to 3 empty rows
        setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()])
    }

    const clearAll = () => {
        setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()])
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Bulk Add Trades</h2>
                    <p className="text-sm text-gray-600 mt-1">Add multiple trades at once using the table below</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearAll}
                        className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Import {rows.filter(r => r.instrument && r.entryPrice && r.size).length} Trades
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Instrument<span className="text-red-500">*</span>
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Direction
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Entry Price<span className="text-red-500">*</span>
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Exit Price
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Size<span className="text-red-500">*</span>
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Entry Time
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Exit Time
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Conviction
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Quick Reason
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Pre-Entry Emotions
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Tags
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Pre-Entry Journal
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Exit Reason
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.instrument}
                                        onChange={(e) => updateRow(row.id, 'instrument', e.target.value)}
                                        placeholder="AAPL"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        value={row.direction}
                                        onChange={(e) => updateRow(row.id, 'direction', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="long">Long</option>
                                        <option value="short">Short</option>
                                    </select>
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.entryPrice}
                                        onChange={(e) => updateRow(row.id, 'entryPrice', e.target.value)}
                                        placeholder="0.00"
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.exitPrice}
                                        onChange={(e) => updateRow(row.id, 'exitPrice', e.target.value)}
                                        placeholder="0.00"
                                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={row.size}
                                        onChange={(e) => updateRow(row.id, 'size', e.target.value)}
                                        placeholder="1"
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="datetime-local"
                                        value={row.entryTime}
                                        onChange={(e) => updateRow(row.id, 'entryTime', e.target.value)}
                                        className="w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="datetime-local"
                                        value={row.exitTime}
                                        onChange={(e) => updateRow(row.id, 'exitTime', e.target.value)}
                                        className="w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={row.conviction}
                                        onChange={(e) => updateRow(row.id, 'conviction', e.target.value)}
                                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.quickReason}
                                        onChange={(e) => updateRow(row.id, 'quickReason', e.target.value)}
                                        placeholder="Breakout..."
                                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.preEntryEmotions}
                                        onChange={(e) => updateRow(row.id, 'preEntryEmotions', e.target.value)}
                                        placeholder="Fear, Greed..."
                                        title="Comma separated emotions"
                                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.tags}
                                        onChange={(e) => updateRow(row.id, 'tags', e.target.value)}
                                        placeholder="Setup A, Gap..."
                                        title="Comma separated tags"
                                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.preEntryJournal}
                                        onChange={(e) => updateRow(row.id, 'preEntryJournal', e.target.value)}
                                        placeholder="Journal..."
                                        className="w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={row.exitReason}
                                        onChange={(e) => updateRow(row.id, 'exitReason', e.target.value)}
                                        placeholder="Target hit..."
                                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length === 1}
                                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm"
                                        title="Remove row"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={addRow}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                    <span>+</span> Add Row
                </button>
                <p className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                </p>
            </div>
        </div>
    )
}
