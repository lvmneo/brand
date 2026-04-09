import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/product/:productId', async (req, res) => {
  try {
    const productId = Array.isArray(req.params.productId)
  ? req.params.productId[0]
  : req.params.productId

if (!productId) {
  return res.status(400).json({ message: 'productId не передан' })
}

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    })

    res.json({
      reviews,
      averageRating: stats._avg.rating || 0,
      reviewsCount: stats._count.id || 0,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения отзывов' })
  }
})

router.get('/can-review/:productId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

     if (!productId) {
      return res.status(400).json({ message: 'productId не передан' })
    }

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
        },
      },
    })

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    })

    res.json({
      canReview: Boolean(purchased) && !existingReview,
      alreadyReviewed: Boolean(existingReview),
      purchased: Boolean(purchased),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка проверки отзыва' })
  }
})

router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.json(reviews)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Ошибка получения моих отзывов' })
  }
})


router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const { productId, rating, text } = req.body as {
  productId?: string
  rating?: number
  text?: string
}

    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    if (!productId || !rating || !text?.trim()) {
      return res.status(400).json({ message: 'Заполни все поля отзыва' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' })
    }

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
        },
      },
    })

    if (!purchased) {
      return res.status(403).json({
        message: 'Оставить отзыв может только пользователь, купивший товар',
      })
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    })

    if (existingReview) {
      return res.status(400).json({ message: 'Ты уже оставлял отзыв на этот товар' })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: Number(rating),
        text: text.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.status(201).json(review)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка создания отзыва' })
  }
})

export default router