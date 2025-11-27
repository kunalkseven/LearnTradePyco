import { useState } from 'react'
import { useAppDispatch } from '../app/hooks'
import { addTrade } from '../features/trades/tradesSlice'
import { Trade } from '../types'
import { localSync } from '../utils/localSync'
import BulkAddTable from '../components/BulkAddTable'
import { useBulkCreateTradesMutation } from '../api/apiSlice'

export default function ImportPage() {
  const dispatch = useAppDispatch()
  const [preview, setPreview] = useState<Trade[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'bulk' | 'csv'>('bulk')
  const [bulkCreateTrades] = useBulkCreateTradesMutation()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((line) => line.trim())
      const headers = lines[0].split(',').map((h) => h.trim())
      const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim()))

      setCsvData([headers, ...rows])

      // Auto-detect column mapping
      const mapping: Record<string, string> = {}
      headers.forEach((header) => {
        const lower = header.toLowerCase()
        if (lower.includes('instrument') || lower.includes('symbol')) {
          mapping.instrument = header
        } else if (lower.includes('direction') || lower.includes('side')) {
          mapping.direction = header
        } else if (lower.includes('entry') && lower.includes('price')) {
          mapping.entryPrice = header
        } else if (lower.includes('exit') && lower.includes('price')) {
          mapping.exitPrice = header
        } else if (lower.includes('size') || lower.includes('quantity')) {
          mapping.size = header
        } else if (lower.includes('entry') && lower.includes('time')) {
          mapping.entryTime = header
        }
      })
      setColumnMapping(mapping)
    }
    reader.readAsText(file)
  }

  const generatePreview = () => {
    if (csvData.length < 2) return

    const headers = csvData[0]
    const rows = csvData.slice(1)

    const trades: Trade[] = rows
      .filter((row) => row.some((cell) => cell))
      .map((row, idx) => {
        const getValue = (key: string) => {
          const colName = columnMapping[key]
          if (!colName) return undefined
          const colIndex = headers.indexOf(colName)
          return colIndex >= 0 ? row[colIndex] : undefined
        }

        return {
          id: `imported_${Date.now()}_${idx}`,
          userId: 'user1',
          instrument: getValue('instrument') || 'UNKNOWN',
          direction: (getValue('direction')?.toLowerCase() || 'long') as 'long' | 'short',
          entryPrice: Number(getValue('entryPrice')) || 0,
          exitPrice: getValue('exitPrice') ? Number(getValue('exitPrice')) : undefined,
          entryTime: getValue('entryTime') || new Date().toISOString(),
          exitTime: getValue('exitTime') || undefined,
          size: Number(getValue('size')) || 1,
          conviction: 5,
          preEntryEmotions: [],
          status: getValue('exitPrice') ? 'closed' : 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Trade
      })

    setPreview(trades)
  }

  const handleImport = async () => {
    for (const trade of preview) {
      dispatch(addTrade(trade))
      if (navigator.onLine) {
        try {
          console.log('Importing trade:', trade.id)
        } catch (error) {
          await localSync.addToQueue({
            type: 'create',
            endpoint: '/trades',
            payload: trade,
          })
        }
      } else {
        await localSync.addToQueue({
          type: 'create',
          endpoint: '/trades',
          payload: trade,
        })
      }
    }
    alert(`Imported ${preview.length} trades`)
    setPreview([])
    setCsvData([])
  }

  const handleBulkImport = async (trades: Trade[]) => {
    if (navigator.onLine) {
      try {
        // Use bulk API endpoint for efficiency
        const result = await bulkCreateTrades({ trades }).unwrap()

        // Add all created trades to Redux store
        result.trades.forEach(trade => {
          dispatch(addTrade(trade))
        })

        alert(`Successfully imported ${result.count} trade(s)!`)
      } catch (error) {
        console.error('Bulk import failed, falling back to local sync:', error)

        // Fallback: add to local queue
        for (const trade of trades) {
          dispatch(addTrade(trade))
          await localSync.addToQueue({
            type: 'create',
            endpoint: '/trades',
            payload: trade,
          })
        }
        alert(`Added ${trades.length} trade(s) to offline queue. They will be synced when online.`)
      }
    } else {
      // Offline: add to local queue
      for (const trade of trades) {
        dispatch(addTrade(trade))
        await localSync.addToQueue({
          type: 'create',
          endpoint: '/trades',
          payload: trade,
        })
      }
      alert(`Added ${trades.length} trade(s) to offline queue. They will be synced when online.`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Import Trades</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bulk'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Bulk Add (Table)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'csv'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            CSV Upload
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'bulk' ? (
        <BulkAddTable onImport={handleBulkImport} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="mt-4 text-sm text-gray-600">
              CSV should include columns for: instrument, direction, entryPrice, size, entryTime
            </p>
          </div>

          {csvData.length > 0 && (
            <>
              {/* Column Mapping */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Map Columns</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['instrument', 'direction', 'entryPrice', 'exitPrice', 'size', 'entryTime', 'exitTime'].map(
                    (field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field}
                        </label>
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, [field]: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select column...</option>
                          {csvData[0].map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  )}
                </div>
                <button
                  onClick={generatePreview}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Generate Preview
                </button>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Preview ({preview.length} trades)
                    </h2>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Import All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Instrument</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Direction</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Entry Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.slice(0, 10).map((trade, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm">{trade.instrument}</td>
                            <td className="px-4 py-2 text-sm">{trade.direction}</td>
                            <td className="px-4 py-2 text-sm">{trade.entryPrice}</td>
                            <td className="px-4 py-2 text-sm">{trade.size}</td>
                            <td className="px-4 py-2 text-sm">{trade.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
