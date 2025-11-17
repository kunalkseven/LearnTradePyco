import { EmotionType } from '../types'
import { getEmotionColor, getEmotionIcon } from '../utils/helpers'

interface EmotionPickerProps {
  selected: EmotionType[]
  onChange: (emotions: EmotionType[]) => void
  multiSelect?: boolean
  className?: string
}

const ALL_EMOTIONS: EmotionType[] = [
  'Fear',
  'Greed',
  'Calm',
  'Frustration',
  'Excitement',
  'Boredom',
  'Confidence',
  'Doubt',
]

export default function EmotionPicker({
  selected,
  onChange,
  multiSelect = true,
  className = '',
}: EmotionPickerProps) {
  const handleClick = (emotion: EmotionType) => {
    if (multiSelect) {
      if (selected.includes(emotion)) {
        onChange(selected.filter((e) => e !== emotion))
      } else {
        onChange([...selected, emotion])
      }
    } else {
      onChange([emotion])
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Emotion picker">
      {ALL_EMOTIONS.map((emotion) => {
        const isSelected = selected.includes(emotion)
        const colorClass = getEmotionColor(emotion)
        return (
          <button
            key={emotion}
            type="button"
            onClick={() => handleClick(emotion)}
            className={`
              px-4 py-2 rounded-lg border-2 transition-all
              ${colorClass}
              ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500 scale-105' : 'opacity-70 hover:opacity-100'}
              focus:outline-none focus:ring-2 focus:ring-primary-500
            `}
            aria-pressed={isSelected}
            aria-label={`Select ${emotion} emotion`}
          >
            <span className="text-2xl mr-2">{getEmotionIcon(emotion)}</span>
            <span className="font-medium">{emotion}</span>
          </button>
        )
      })}
    </div>
  )
}

