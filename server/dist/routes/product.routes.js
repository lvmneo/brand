"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
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
        res.status(500).json({ message: 'Ошибка при получении товаров' });
    }
});
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug },
            include: {
                brand: true,
                category: true,
            },
        });
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        res.json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении товара' });
    }
});
exports.default = router;
