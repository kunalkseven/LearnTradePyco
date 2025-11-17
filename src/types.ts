export type EmotionType =
  | 'Fear'
  | 'Greed'
  | 'Calm'
  | 'Frustration'
  | 'Excitement'
  | 'Boredom'
  | 'Confidence'
  | 'Doubt'

export interface Emotion {
  type: EmotionType
  intensity: number // 1-10
  timestamp: string
}

export interface Trade {
  id: string
  userId: string
  instrument: string
  direction: 'long' | 'short'
  entryPrice: number
  entryTime: string
  exitPrice?: number
  exitTime?: string
  size: number
  conviction: number // 1-10
  quickReason?: string
  preEntryEmotions: Emotion[]
  postExitEmotions?: Emotion[]
  preEntryJournal?: string
  postExitJournal?: string
  exitReason?: string
  screenshots?: string[]
  tags?: string[]
  pnl?: number
  pnlPercent?: number
  status: 'open' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface TradeJournal {
  tradeId: string
  entry: string
  exit?: string
  reflections?: string
  lessons?: string
}

export interface AIInsight {
  id: string
  title: string
  summary: string
  examples: string[]
  rules: string[]
  confidence: number
  feedback?: 'positive' | 'negative' | null
}

export interface AIAnalysisResponse {
  summary: string
  patterns: AIInsight[]
  recommendations: string[]
}

export interface SimilarTradeResult {
  tradeId: string
  similarity: number
  commonFactors: string[]
}

export interface User {
  id: string
  email: string
  name: string
  settings: UserSettings
}

export interface UserSettings {
  riskLimits: {
    maxPositionSize: number
    maxDailyLoss: number
    maxDrawdown: number
  }
  preTradeChecklist: {
    enabled: boolean
    items: string[]
  }
  currency: string
  timezone: string
}

export interface DecisionGraphNode {
  id: string
  type: 'trade' | 'belief' | 'trigger' | 'emotion' | 'action' | 'outcome'
  label: string
  data: {
    tradeId?: string
    emotion?: EmotionType
    value?: number
  }
  position: { x: number; y: number }
}

export interface DecisionGraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface DecisionGraph {
  nodes: DecisionGraphNode[]
  edges: DecisionGraphEdge[]
}

export interface OfflineQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  payload: unknown
  timestamp: string
  retries: number
}

export interface TradeFilters {
  search?: string
  tags?: string[]
  emotions?: EmotionType[]
  pnlRange?: { min: number; max: number }
  dateRange?: { start: string; end: string }
  status?: 'open' | 'closed' | 'all'
}

