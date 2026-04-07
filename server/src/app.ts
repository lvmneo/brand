import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import brandRoutes from './routes/brand.routes'
import productRoutes from './routes/product.routes'
import authRoutes from './routes/auth.routes'
import orderRoutes from './routes/order.routes'
import adminRoutes from './routes/admin.routes'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://127.0.0.1:4173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ],
  credentials: true,
}))

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

export default app