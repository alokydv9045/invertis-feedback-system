import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { authRoutes } from './routes/auth.js'
import { formRoutes } from './routes/forms.js'
import { reviewRoutes } from './routes/reviews.js'
import { analyticsRoutes } from './routes/analytics.js'
import { adminRoutes } from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/forms', formRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', service: 'IFS Backend' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 IFS Backend running on http://localhost:${PORT}`)
})
