import { useState } from 'react'
import { useAppDispatch } from '../app/hooks'
import { addTrade } from '../features/trades/tradesSlice'
import { Trade } from '../types'
import { localSync } from '../utils/localSync'

export default function ImportPage() {
  const dispatch = useAppDispatch()
  const [preview, setPreview] = useState<Trade[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

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
          // Would call API here
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

  if (csvData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Trades</h1>
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
      </div>
    )
  }

  const headers = csvData[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Trades</h1>

      <div className="space-y-6">
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
                    {headers.map((header) => (
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
      </div>
    </div>
  )
}

