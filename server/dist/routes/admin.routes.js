"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-');
        cb(null, `${Date.now()}-${baseName}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
router.use(auth_1.authMiddleware, admin_1.adminMiddleware);
router.get('/stats', async (_req, res) => {
    try {
        const usersCount = await prisma_1.prisma.user.count();
        const productsCount = await prisma_1.prisma.product.count();
        const ordersCount = await prisma_1.prisma.order.count();
        const revenue = await prisma_1.prisma.order.aggregate({
            where: {
                status: {
                    in: ['PAID', 'SHIPPED', 'DELIVERED'],
                },
            },
            _sum: {
                totalAmount: true,
            },
        });
        res.json({
            usersCount,
            productsCount,
            ordersCount,
            revenue: revenue._sum.totalAmount || 0,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения статистики' });
    }
});
router.get('/orders', async (_req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
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
        });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения заказов' });
    }
});
router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Некорректный статус' });
        }
        const existingOrder = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });
        if (!existingOrder) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        if (existingOrder.status === 'CANCELLED' && status !== 'CANCELLED') {
            return res.status(400).json({
                message: 'Нельзя изменить статус уже отменённого заказа',
            });
        }
        if (existingOrder.status === status) {
            return res.json(existingOrder);
        }
        const updatedOrder = await prisma_1.prisma.$transaction(async (tx) => {
            if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
                for (const item of existingOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            }
            return tx.order.update({
                where: { id },
                data: { status },
            });
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления статуса заказа' });
    }
});
router.get('/products', async (_req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            include: {
                brand: true,
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения товаров' });
    }
});
router.get('/brands', async (_req, res) => {
    try {
        const brands = await prisma_1.prisma.brand.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json(brands);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения брендов' });
    }
});
router.get('/categories', async (_req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения категорий' });
    }
});
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }
        const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
        const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка загрузки изображения' });
    }
});
router.post('/products', async (req, res) => {
    try {
        const { title, slug, description, price, oldPrice, stock, imageUrl, brandId, categoryId, } = req.body;
        if (!title || !slug || !description || price === undefined || !brandId || !categoryId) {
            return res.status(400).json({ message: 'Заполни обязательные поля' });
        }
        const existingProduct = await prisma_1.prisma.product.findUnique({
            where: { slug },
        });
        if (existingProduct) {
            return res.status(400).json({ message: 'Товар с таким slug уже существует' });
        }
        const product = await prisma_1.prisma.product.create({
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
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка создания товара' });
    }
});
router.patch('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, description, price, oldPrice, stock, imageUrl, brandId, categoryId, } = req.body;
        if (!title || !slug || !description || price === undefined || !brandId || !categoryId) {
            return res.status(400).json({ message: 'Заполни обязательные поля' });
        }
        const existingProduct = await prisma_1.prisma.product.findFirst({
            where: {
                slug,
                NOT: {
                    id,
                },
            },
        });
        if (existingProduct) {
            return res.status(400).json({ message: 'Другой товар уже использует такой slug' });
        }
        const updatedProduct = await prisma_1.prisma.product.update({
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
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления товара' });
    }
});
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.product.delete({
            where: { id },
        });
        res.json({ message: 'Товар удален' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка удаления товара' });
    }
});
router.get('/users', async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения пользователей' });
    }
});
router.post('/brands', async (req, res) => {
    try {
        const { name, slug, description, logoUrl, isVerified } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: 'Название и slug обязательны' });
        }
        const existingBrand = await prisma_1.prisma.brand.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },
        });
        if (existingBrand) {
            return res.status(400).json({ message: 'Бренд с таким названием или slug уже существует' });
        }
        const brand = await prisma_1.prisma.brand.create({
            data: {
                name,
                slug,
                description: description || null,
                logoUrl: logoUrl || null,
                isVerified: Boolean(isVerified),
            },
        });
        res.status(201).json(brand);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка создания бренда' });
    }
});
router.patch('/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, logoUrl, isVerified } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: 'Название и slug обязательны' });
        }
        const existingBrand = await prisma_1.prisma.brand.findFirst({
            where: {
                NOT: { id },
                OR: [{ name }, { slug }],
            },
        });
        if (existingBrand) {
            return res.status(400).json({ message: 'Другой бренд уже использует такое название или slug' });
        }
        const brand = await prisma_1.prisma.brand.update({
            where: { id },
            data: {
                name,
                slug,
                description: description || null,
                logoUrl: logoUrl || null,
                isVerified: Boolean(isVerified),
            },
        });
        res.json(brand);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления бренда' });
    }
});
router.delete('/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.brand.delete({
            where: { id },
        });
        res.json({ message: 'Бренд удален' });
    }
    catch (error) {
        console.error(error);
        if (error?.code === 'P2003') {
            return res.status(400).json({
                message: 'Нельзя удалить бренд, пока к нему привязаны товары',
            });
        }
        res.status(500).json({ message: 'Ошибка удаления бренда' });
    }
});
router.post('/categories', async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: 'Название и slug обязательны' });
        }
        const existingCategory = await prisma_1.prisma.category.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },
        });
        if (existingCategory) {
            return res.status(400).json({
                message: 'Категория с таким названием или slug уже существует',
            });
        }
        const category = await prisma_1.prisma.category.create({
            data: {
                name,
                slug,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка создания категории' });
    }
});
router.patch('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: 'Название и slug обязательны' });
        }
        const existingCategory = await prisma_1.prisma.category.findFirst({
            where: {
                NOT: { id },
                OR: [{ name }, { slug }],
            },
        });
        if (existingCategory) {
            return res.status(400).json({
                message: 'Другая категория уже использует такое название или slug',
            });
        }
        const category = await prisma_1.prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
            },
        });
        res.json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления категории' });
    }
});
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.category.delete({
            where: { id },
        });
        res.json({ message: 'Категория удалена' });
    }
    catch (error) {
        console.error(error);
        if (error?.code === 'P2003') {
            return res.status(400).json({
                message: 'Нельзя удалить категорию, пока к ней привязаны товары',
            });
        }
        res.status(500).json({ message: 'Ошибка удаления категории' });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка получения пользователя' });
    }
});
exports.default = router;
