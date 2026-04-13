"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const brands = await prisma_1.prisma.brand.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(brands);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении брендов' });
    }
});
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const brand = await prisma_1.prisma.brand.findUnique({
            where: { slug },
            include: {
                products: {
                    include: {
                        category: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!brand) {
            return res.status(404).json({ message: 'Бренд не найден' });
        }
        res.json(brand);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении бренда' });
    }
});
exports.default = router;
