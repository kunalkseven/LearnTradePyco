import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Trade } from '../models/Trade.js'

dotenv.config()

async function checkEmotions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB\n')

        const trades = await Trade.find({})
        console.log(`Total trades: ${trades.length}\n`)

        console.log('=== EMOTION ANALYSIS ===\n')

        trades.forEach((trade, index) => {
            console.log(`${index + 1}. ${trade.instrument} (${trade.direction})`)
            console.log(`   Status: ${trade.status}`)
            console.log(`   P/L: ${trade.pnl || 'Not calculated'}`)

            if (trade.preEntryEmotions && trade.preEntryEmotions.length > 0) {
                console.log(`   ✅ Pre-Entry Emotions: ${trade.preEntryEmotions.map(e => e.type).join(', ')}`)
            } else {
                console.log(`   ❌ No pre-entry emotions`)
            }

            if (trade.postExitEmotions && trade.postExitEmotions.length > 0) {
                console.log(`   ✅ Post-Exit Emotions: ${trade.postExitEmotions.map(e => e.type).join(', ')}`)
            } else {
                console.log(`   ❌ No post-exit emotions`)
            }
            console.log('')
        })

        // Summary
        const withPreEmotions = trades.filter(t => t.preEntryEmotions && t.preEntryEmotions.length > 0)
        const withPostEmotions = trades.filter(t => t.postExitEmotions && t.postExitEmotions.length > 0)
        const withPnL = trades.filter(t => t.pnl !== undefined && t.pnl !== null)

        console.log('=== SUMMARY ===')
        console.log(`Trades with pre-entry emotions: ${withPreEmotions.length}/${trades.length}`)
        console.log(`Trades with post-exit emotions: ${withPostEmotions.length}/${trades.length}`)
        console.log(`Trades with P/L calculated: ${withPnL.length}/${trades.length}`)

        if (withPreEmotions.length > 0 && withPnL.length > 0) {
            console.log('\n✅ Emotions vs P/L chart should display!')
        } else {
            console.log('\n⚠️  Emotions vs P/L chart will be empty')
            if (withPreEmotions.length === 0) {
                console.log('   Reason: No trades have pre-entry emotions')
            }
            if (withPnL.length === 0) {
                console.log('   Reason: No trades have P/L calculated')
            }
        }

        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

checkEmotions()
