import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import brandRoutes from './routes/brand.routes'
import productRoutes from './routes/product.routes'
import authRoutes from './routes/auth.routes'
import orderRoutes from './routes/order.routes'
import adminRoutes from './routes/admin.routes'
import reviewRoutes from './routes/review.routes'
import path from 'path'


dotenv.config()

const app = express()

app.use(cors({
  origin: [
   'http://localhost:5173',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',
      'https://brand-3p1g1jlv-lvmneos-projects.vercel.app', // ← добавь все свои домены
      'https://brand-git-main-lvmneos-projects.vercel.app',
      'https://brand-fawn-phi.vercel.app',
  ],
  credentials: true,
}))

app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.get('/', (_req, res) => {
  res.json({ message: 'API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewRoutes)

export default app