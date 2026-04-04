import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import brandRoutes from './routes/brand.routes'
import productRoutes from './routes/product.routes'

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://127.0.0.1:4173',
  credentials: true,
}))

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' })
})

app.use('/api/brands', brandRoutes)
app.use('/api/products', productRoutes)

export default app