import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка при получении товаров' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
      },
    })

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' })
    }

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка при получении товара' })
  }
})

export default router