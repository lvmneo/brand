import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { adminMiddleware } from '../middleware/admin'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

const uploadsDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')

    cb(null, `${Date.now()}-${baseName}${ext}`)
  },
})

const upload = multer({ storage })

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

router.get('/brands', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    res.json(brands)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения брендов' })
  }
})

router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка получения категорий' })
  }
})

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' })
    }

    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`

    res.json({ imageUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка загрузки изображения' })
  }
})

router.post('/products', async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      price,
      oldPrice,
      stock,
      imageUrl,
      brandId,
      categoryId,
    } = req.body

    if (!title || !slug || !description || price === undefined || !brandId || !categoryId) {
      return res.status(400).json({ message: 'Заполни обязательные поля' })
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return res.status(400).json({ message: 'Товар с таким slug уже существует' })
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: stock ? Number(stock) : 0,
        imageUrl: imageUrl || null,
        brandId,
        categoryId,
      },
      include: {
        brand: true,
        category: true,
      },
    })

    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка создания товара' })
  }
})



router.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      slug,
      description,
      price,
      oldPrice,
      stock,
      imageUrl,
      brandId,
      categoryId,
    } = req.body

    if (!title || !slug || !description || price === undefined || !brandId || !categoryId) {
      return res.status(400).json({ message: 'Заполни обязательные поля' })
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    })

    if (existingProduct) {
      return res.status(400).json({ message: 'Другой товар уже использует такой slug' })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: stock ? Number(stock) : 0,
        imageUrl: imageUrl || null,
        brandId,
        categoryId,
      },
      include: {
        brand: true,
        category: true,
      },
    })

    res.json(updatedProduct)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка обновления товара' })
  }
})

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.product.delete({
      where: { id },
    })

    res.json({ message: 'Товар удален' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка удаления товара' })
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

router.post('/brands', async (req, res) => {
  try {
    const { name, slug, description, logoUrl, isVerified } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: 'Название и slug обязательны' })
    }

    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingBrand) {
      return res.status(400).json({ message: 'Бренд с таким названием или slug уже существует' })
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        isVerified: Boolean(isVerified),
      },
    })

    res.status(201).json(brand)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка создания бренда' })
  }
})

router.patch('/brands/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description, logoUrl, isVerified } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: 'Название и slug обязательны' })
    }

    const existingBrand = await prisma.brand.findFirst({
      where: {
        NOT: { id },
        OR: [{ name }, { slug }],
      },
    })

    if (existingBrand) {
      return res.status(400).json({ message: 'Другой бренд уже использует такое название или slug' })
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
        isVerified: Boolean(isVerified),
      },
    })

    res.json(brand)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка обновления бренда' })
  }
})

router.delete('/brands/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.brand.delete({
      where: { id },
    })

    res.json({ message: 'Бренд удален' })
  } catch (error: any) {
    console.error(error)

    if (error?.code === 'P2003') {
      return res.status(400).json({
        message: 'Нельзя удалить бренд, пока к нему привязаны товары',
      })
    }

    res.status(500).json({ message: 'Ошибка удаления бренда' })
  }
})

export default router