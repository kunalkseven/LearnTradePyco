import mongoose from 'mongoose'

const emotionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const tradeSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true }, // Custom string ID from frontend
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instrument: { type: String, required: true },
    direction: { type: String, enum: ['long', 'short'], required: true },
    entryPrice: { type: Number, required: true },
    entryTime: { type: Date, required: true },
    exitPrice: { type: Number },
    exitTime: { type: Date },
    size: { type: Number, required: true },
    conviction: { type: Number, min: 1, max: 10, required: true },
    quickReason: { type: String },
    preEntryEmotions: { type: [emotionSchema], default: [] },
    postExitEmotions: { type: [emotionSchema], default: [] },
    preEntryJournal: { type: String },
    postExitJournal: { type: String },
    exitReason: { type: String },
    screenshots: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    pnl: { type: Number },
    pnlPercent: { type: Number },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  {
    timestamps: true,
  }
)

export const Trade = mongoose.model('Trade', tradeSchema)


