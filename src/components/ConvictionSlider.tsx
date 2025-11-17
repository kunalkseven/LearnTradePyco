import { useState } from 'react'

interface ConvictionSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export default function ConvictionSlider({
  value,
  onChange,
  className = '',
}: ConvictionSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getLabel = (val: number): string => {
    if (val <= 2) return 'Very Low'
    if (val <= 4) return 'Low'
    if (val <= 6) return 'Medium'
    if (val <= 8) return 'High'
    return 'Very High'
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Conviction: {value}/10 ({getLabel(value)})
      </label>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          aria-label="Conviction level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
        />
        {showTooltip && (
          <div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap"
            style={{ left: `${((value - 1) / 9) * 100}%` }}
          >
            {value}/10
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}

