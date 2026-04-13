"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function detectCardBrand(cardNumber) {
    if (cardNumber.startsWith('4'))
        return 'Visa';
    if (/^5[1-5]/.test(cardNumber))
        return 'Mastercard';
    if (/^220[0-4]/.test(cardNumber) || cardNumber.startsWith('2'))
        return 'Мир';
    return 'Банковская карта';
}
router.get('/my', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        const orders = await prisma_1.prisma.order.findMany({
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
        });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения заказов' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { items, recipientName, phone, city, address, comment, deliveryMethod, paymentMethod, cardNumber, cardHolder, expiry, cvv, sbpBank, paymentConfirmed, } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }
        if (!recipientName?.trim() || !phone?.trim() || !city?.trim()) {
            return res.status(400).json({ message: 'Заполни имя, телефон и город' });
        }
        if (!deliveryMethod || !['COURIER', 'PICKUP'].includes(deliveryMethod)) {
            return res.status(400).json({ message: 'Выбери способ доставки' });
        }
        if (!paymentMethod || !['CARD', 'SBP', 'CASH'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Выбери способ оплаты' });
        }
        if (deliveryMethod === 'COURIER' && !address?.trim()) {
            return res.status(400).json({ message: 'Укажи адрес доставки' });
        }
        if (paymentMethod === 'CARD') {
            const digitsOnly = String(cardNumber || '').replace(/\D/g, '');
            if (digitsOnly.length !== 16) {
                return res.status(400).json({ message: 'Номер карты должен содержать 16 цифр' });
            }
            if (!cardHolder?.trim()) {
                return res.status(400).json({ message: 'Укажи имя держателя карты' });
            }
            if (!expiry?.trim() || !/^\d{2}\/\d{2}$/.test(expiry.trim())) {
                return res.status(400).json({ message: 'Укажи срок действия карты в формате MM/YY' });
            }
            if (!cvv?.trim() || !/^\d{3}$/.test(cvv.trim())) {
                return res.status(400).json({ message: 'CVV должен содержать 3 цифры' });
            }
            if (!paymentConfirmed) {
                return res.status(400).json({ message: 'Подтверди demo-оплату картой' });
            }
        }
        if (paymentMethod === 'SBP') {
            if (!sbpBank?.trim()) {
                return res.status(400).json({ message: 'Выбери банк для СБП' });
            }
            if (!paymentConfirmed) {
                return res.status(400).json({ message: 'Подтверди demo-оплату по СБП' });
            }
        }
        const invalidItem = items.find((item) => !item?.productId ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0);
        if (invalidItem) {
            return res.status(400).json({ message: 'Некорректное количество товара' });
        }
        const groupedItems = items.reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {});
        const productIds = Object.keys(groupedItems);
        const products = await prisma_1.prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
        });
        if (products.length !== productIds.length) {
            return res.status(400).json({ message: 'Некоторые товары не найдены' });
        }
        for (const product of products) {
            const requestedQty = groupedItems[product.id];
            if (product.stock < requestedQty) {
                return res.status(400).json({
                    message: `Недостаточно товара "${product.title}" на складе. Осталось: ${product.stock}`,
                });
            }
        }
        const normalizedItems = productIds.map((productId) => {
            const product = products.find((p) => p.id === productId);
            return {
                productId,
                quantity: groupedItems[productId],
                price: product.price,
            };
        });
        const productsTotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryPrice = deliveryMethod === 'COURIER' ? 299 : 0;
        const totalAmount = productsTotal + deliveryPrice;
        const sanitizedCardNumber = String(cardNumber || '').replace(/\D/g, '');
        const cardLast4 = paymentMethod === 'CARD' ? sanitizedCardNumber.slice(-4) : null;
        const cardBrand = paymentMethod === 'CARD' ? detectCardBrand(sanitizedCardNumber) : null;
        const transactionId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const paymentStatus = paymentMethod === 'CASH' ? 'PENDING' : paymentConfirmed ? 'PAID' : 'FAILED';
        const createdOrder = await prisma_1.prisma.$transaction(async (tx) => {
            for (const item of normalizedItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            return tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    deliveryPrice,
                    recipientName: recipientName.trim(),
                    phone: phone.trim(),
                    city: city.trim(),
                    address: deliveryMethod === 'PICKUP' ? 'Самовывоз' : String(address).trim(),
                    comment: comment?.trim() || null,
                    deliveryMethod,
                    paymentMethod,
                    paymentStatus,
                    cardLast4,
                    cardBrand,
                    transactionId,
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
            });
        });
        res.status(201).json(createdOrder);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка создания заказа' });
    }
});
router.get('/my/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!userId) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        if (!orderId) {
            return res.status(400).json({ message: 'ID заказа не передан' });
        }
        const order = await prisma_1.prisma.order.findFirst({
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
        });
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения заказа' });
    }
});
exports.default = router;
