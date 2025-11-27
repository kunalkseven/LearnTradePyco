import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Trade } from '../models/Trade.js'

dotenv.config()

async function recalculatePnL() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Find all trades with exitPrice but no pnl
        const trades = await Trade.find({
            exitPrice: { $exists: true, $ne: null },
            $or: [
                { pnl: { $exists: false } },
                { pnl: null },
                { pnl: 0 }
            ]
        })

        console.log(`Found ${trades.length} trades to update`)

        let updated = 0
        for (const trade of trades) {
            if (trade.entryPrice && trade.size && trade.exitPrice) {
                const priceDiff = trade.direction === 'long'
                    ? trade.exitPrice - trade.entryPrice
                    : trade.entryPrice - trade.exitPrice

                trade.pnl = priceDiff * trade.size
                trade.pnlPercent = (priceDiff / trade.entryPrice) * 100
                trade.status = 'closed'

                await trade.save()
                updated++
                console.log(`✅ Updated ${trade.instrument} - P/L: ${trade.pnl}`)
            }
        }

        console.log(`\n✅ Successfully updated ${updated} trades`)
        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

recalculatePnL()
