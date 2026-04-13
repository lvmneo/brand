"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Доступ только для администратора' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
