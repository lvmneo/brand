import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(brands)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка при получении брендов' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    })

    if (!brand) {
      return res.status(404).json({ message: 'Бренд не найден' })
    }

    res.json(brand)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка при получении бренда' })
  }
})

export default router