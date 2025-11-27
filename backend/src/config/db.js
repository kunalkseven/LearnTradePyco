import mongoose from 'mongoose'

let isConnected = false
let retryCount = 0
const MAX_RETRIES = 5
const RETRY_INTERVAL = 5000 // 5 seconds

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please configure your MongoDB Atlas connection string.')
    console.warn('⚠️  Server will start but database operations will fail until MongoDB is configured.')
    return false
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of default 30s
    })
    console.log('✅ Connected to MongoDB')
    isConnected = true
    retryCount = 0
    return true
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB')
    console.error('Error:', err.message)

    // Check if it's an IP whitelist error
    if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.error('\n⚠️  IP WHITELIST ERROR DETECTED')
      console.error('📋 To fix this:')
      console.error('   1. Go to MongoDB Atlas Dashboard')
      console.error('   2. Navigate to: Network Access → IP Access List')
      console.error('   3. Add your current IP address or allow 0.0.0.0/0 for development')
      console.error('')
    }

    isConnected = false

    // Retry connection with exponential backoff
    if (retryCount < MAX_RETRIES) {
      retryCount++
      const delay = RETRY_INTERVAL * retryCount
      console.log(`🔄 Retrying connection in ${delay / 1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`)
      setTimeout(() => connectDB(), delay)
    } else {
      console.warn('⚠️  Max retry attempts reached. Server will continue running without database.')
      console.warn('⚠️  Please fix MongoDB connection and restart the server.')
    }

    return false
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB')
  isConnected = true
})

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message)
  isConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB')
  isConnected = false
})

// Export connection status checker
export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1
}


