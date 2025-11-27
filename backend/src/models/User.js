import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleId: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    settings: {
      riskLimits: {
        maxPositionSize: { type: Number, default: 10000 },
        maxDailyLoss: { type: Number, default: 500 },
        maxDrawdown: { type: Number, default: 2000 },
      },
      preTradeChecklist: {
        enabled: { type: Boolean, default: false },
        items: { type: [String], default: [] },
      },
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
)

userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false
  return bcrypt.compare(password, this.passwordHash)
}

export const User = mongoose.model('User', userSchema)


