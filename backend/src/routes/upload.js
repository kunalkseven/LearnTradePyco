import express from 'express'

const router = express.Router()

// Simple mock upload endpoint – in production you would integrate S3, Cloudinary, etc.
router.post('/', (req, res) => {
  // We don't actually process files here – just return a fake URL
  const url = `https://example.com/uploads/${Date.now()}_mock.png`
  return res.json({ url })
})

export default router


