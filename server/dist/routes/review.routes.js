"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = Array.isArray(req.params.productId)
            ? req.params.productId[0]
            : req.params.productId;
        if (!productId) {
            return res.status(400).json({ message: 'productId не передан' });
        }
        const reviews = await prisma_1.prisma.review.findMany({
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
        });
        const stats = await prisma_1.prisma.review.aggregate({
            where: { productId },
            _avg: {
                rating: true,
            },
            _count: {
                id: true,
            },
        });
        res.json({
            reviews,
            averageRating: stats._avg.rating || 0,
            reviewsCount: stats._count.id || 0,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения отзывов' });
    }
});
router.get('/can-review/:productId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const productId = Array.isArray(req.params.productId)
            ? req.params.productId[0]
            : req.params.productId;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        if (!productId) {
            return res.status(400).json({ message: 'productId не передан' });
        }
        const purchased = await prisma_1.prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                },
            },
        });
        const delivered = await prisma_1.prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });
        const existingReview = await prisma_1.prisma.review.findFirst({
            where: {
                userId,
                productId,
            },
        });
        return res.json({
            canReview: Boolean(delivered) && !existingReview,
            alreadyReviewed: Boolean(existingReview),
            purchased: Boolean(purchased),
            delivered: Boolean(delivered),
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка проверки возможности отзыва' });
    }
});
router.get('/my', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        const reviews = await prisma_1.prisma.review.findMany({
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
        });
        return res.json(reviews);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка получения моих отзывов' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { productId, rating, text } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        if (!productId || !rating || !text || !String(text).trim()) {
            return res.status(400).json({ message: 'Заполни все поля отзыва' });
        }
        const normalizedRating = Number(rating);
        if (normalizedRating < 1 || normalizedRating > 5) {
            return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
        }
        const delivered = await prisma_1.prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });
        if (!delivered) {
            return res.status(403).json({
                message: 'Оставить отзыв можно только после доставки товара',
            });
        }
        const existingReview = await prisma_1.prisma.review.findFirst({
            where: {
                userId,
                productId,
            },
        });
        if (existingReview) {
            return res.status(400).json({ message: 'Ты уже оставлял отзыв на этот товар' });
        }
        const review = await prisma_1.prisma.review.create({
            data: {
                productId,
                userId,
                rating: normalizedRating,
                text: String(text).trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return res.status(201).json(review);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Ошибка создания отзыва' });
    }
});
exports.default = router;
