import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { updateSettings } from '../features/auth/authSlice'
import { localSync } from '../utils/localSync'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [riskLimits, setRiskLimits] = useState(user?.settings.riskLimits || {
    maxPositionSize: 10000,
    maxDailyLoss: 500,
    maxDrawdown: 2000,
  })
  const [checklistEnabled, setChecklistEnabled] = useState(
    user?.settings.preTradeChecklist.enabled || false
  )
  const [checklistItems, setChecklistItems] = useState(
    user?.settings.preTradeChecklist.items || []
  )
  const [newChecklistItem, setNewChecklistItem] = useState('')

  const handleSave = () => {
    dispatch(
      updateSettings({
        riskLimits,
        preTradeChecklist: {
          enabled: checklistEnabled,
          items: checklistItems,
        },
      })
    )
    // Save to local storage
    localStorage.setItem('user_settings', JSON.stringify({ riskLimits, preTradeChecklist: { enabled: checklistEnabled, items: checklistItems } }))
  }

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, newChecklistItem.trim()])
      setNewChecklistItem('')
    }
  }

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  const handleExport = () => {
    const data = {
      trades: JSON.parse(localStorage.getItem('trades') || '[]'),
      settings: user?.settings,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trading-journal-export-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      await localSync.clearCache()
      localStorage.clear()
      // In a real app, would call API to delete user data
      alert('Data deleted. Please refresh the page.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Risk Limits */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Limits</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Position Size
              </label>
              <input
                type="number"
                value={riskLimits.maxPositionSize}
                onChange={(e) =>
                  setRiskLimits({ ...riskLimits, maxPositionSize: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Daily Loss
              </label>
              <input
                type="number"
                value={riskLimits.maxDailyLoss}
                onChange={(e) =>
                  setRiskLimits({ ...riskLimits, maxDailyLoss: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Drawdown
              </label>
              <input
                type="number"
                value={riskLimits.maxDrawdown}
                onChange={(e) =>
                  setRiskLimits({ ...riskLimits, maxDrawdown: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Pre-Trade Checklist */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pre-Trade Checklist</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={checklistEnabled}
                onChange={(e) => setChecklistEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Enable checklist</span>
            </label>
          </div>
          {checklistEnabled && (
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChecklistItem()
                    }
                  }}
                  placeholder="Add checklist item"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleAddChecklistItem}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Export Data (JSON)
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete All Data
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

