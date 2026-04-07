import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { adminMiddleware } from '../middleware/admin'

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get('/stats', async (_req, res) => {
  try {
    const usersCount = await prisma.user.count()
    const productsCount = await prisma.product.count()
    const ordersCount = await prisma.order.count()

    const revenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    })

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      revenue: revenue._sum.totalAmount || 0,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения статистики' })
  }
})

router.get('/orders', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(orders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения заказов' })
  }
})

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка обновления статуса заказа' })
  }
})

router.get('/products', async (_req, res) => {
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
    res.status(500).json({ message: 'Ошибка получения товаров' })
  }
})

router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения пользователей' })
  }
})

export default router