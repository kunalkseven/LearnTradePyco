import { isMongoConnected } from '../config/db.js'

// Middleware to check MongoDB connection status
export function checkMongoConnection(req, res, next) {
    if (!isMongoConnected()) {
        return res.status(503).json({
            error: 'Database temporarily unavailable',
            message: 'The server is running but cannot connect to the database. Please try again later.',
            details: 'MongoDB connection is not established. Check server logs for more information.'
        })
    }
    next()
}
