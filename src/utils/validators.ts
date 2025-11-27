import { z } from 'zod'

export const tradeSchema = z.object({
  instrument: z.string().min(1, 'Instrument is required'),
  direction: z.enum(['long', 'short']),
  entryPrice: z.number().positive('Entry price must be positive'),
  entryTime: z.string().min(1, 'Entry time is required'), // Accept any non-empty string
  size: z.number().positive('Size must be positive'),
  conviction: z.number().min(1).max(10),
  quickReason: z.string().optional(),
  preEntryEmotions: z.array(
    z.object({
      type: z.string(),
      intensity: z.number().min(1).max(10),
      timestamp: z.string(),
    })
  ),
})

export const tradeUpdateSchema = z.object({
  exitPrice: z.number().positive().optional(),
  exitTime: z.string().datetime().optional(),
  exitReason: z.string().optional(),
  postExitEmotions: z.array(
    z.object({
      type: z.string(),
      intensity: z.number().min(1).max(10),
      timestamp: z.string(),
    })
  ).optional(),
  postExitJournal: z.string().optional(),
})

export const journalSchema = z.object({
  entry: z.string().min(1, 'Entry journal is required'),
  exit: z.string().optional(),
  reflections: z.string().optional(),
  lessons: z.string().optional(),
})

export type TradeFormData = z.infer<typeof tradeSchema>
export type TradeUpdateFormData = z.infer<typeof tradeUpdateSchema>
export type JournalFormData = z.infer<typeof journalSchema>

