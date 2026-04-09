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
    const { items } = req.body as {
      items?: { productId: string; quantity: number }[]
    }

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' })
    }

    const invalidItem = items.find(
      (item) =>
        !item?.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    )

    if (invalidItem) {
      return res.status(400).json({ message: 'Некорректное количество товара' })
    }

    const groupedItems = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity
      return acc
    }, {})

    const productIds = Object.keys(groupedItems)

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

    for (const product of products) {
      const requestedQty = groupedItems[product.id]

      if (product.stock < requestedQty) {
        return res.status(400).json({
          message: `Недостаточно товара "${product.title}" на складе. Осталось: ${product.stock}`,
        })
      }
    }

    const normalizedItems = productIds.map((productId) => {
      const product = products.find((p) => p.id === productId)!

      return {
        productId,
        quantity: groupedItems[productId],
        price: product.price,
      }
    })

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return tx.order.create({
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
    })

    res.status(201).json(createdOrder)
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