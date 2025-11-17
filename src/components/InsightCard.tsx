import { useState } from 'react'
import { AIInsight } from '../types'

interface InsightCardProps {
  insight: AIInsight
  onFeedback?: (insightId: string, feedback: 'positive' | 'negative') => void
}

export default function InsightCard({ insight, onFeedback }: InsightCardProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(insight.feedback || null)

  const handleFeedback = (type: 'positive' | 'negative') => {
    const newFeedback = feedback === type ? null : type
    setFeedback(newFeedback)
    if (onFeedback) {
      onFeedback(insight.id, newFeedback || type)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback('positive')}
            className={`
              p-1 rounded transition-colors
              ${feedback === 'positive' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'}
              focus:outline-none focus:ring-2 focus:ring-green-500
            `}
            aria-label="Thumbs up"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.707.707l4.5-4.5a1 1 0 000-1.414l-4.5-4.5A1 1 0 006 10.333zM15.818 8.384l-3.5-2A1 1 0 0011 7.5v5a1 1 0 00.318.736l3.5 2a1 1 0 001.364-1.472L14.5 11.5l1.682-1.264a1 1 0 00-1.364-1.472z" />
            </svg>
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            className={`
              p-1 rounded transition-colors
              ${feedback === 'negative' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}
              focus:outline-none focus:ring-2 focus:ring-red-500
            `}
            aria-label="Thumbs down"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.834a1 1 0 00-1.707-.707l-4.5 4.5a1 1 0 000 1.414l4.5 4.5A1 1 0 0014 9.667zM4.182 11.616l3.5 2A1 1 0 009 12.5v-5a1 1 0 00-.318-.736l-3.5-2a1 1 0 00-1.364 1.472L5.5 8.5l-1.682 1.264a1 1 0 001.364 1.472z" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{insight.summary}</p>
      
      {insight.examples.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Examples:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {insight.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </div>
      )}
      
      {insight.rules.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Practical Rules:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {insight.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

