import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
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

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const { items } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' })
    }

    const productIds = items.map((item: { productId: string }) => item.productId)

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Некоторые товары не найдены' })
    }

    const normalizedItems = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = products.find((p) => p.id === item.productId)

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product!.price,
        }
      }
    )

    const totalAmount = normalizedItems.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + item.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка создания заказа' })
  }
})

router.get('/my/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    if (!orderId) {
      return res.status(400).json({ message: 'ID заказа не передан' })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                imageUrl: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения заказа' })
  }
})

export default router