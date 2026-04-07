import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизован' })
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ только для администратора' })
  }

  next()
}