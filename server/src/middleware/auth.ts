import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type JwtUser = {
  userId: string
  email: string
  name: string
}

export interface AuthRequest extends Request {
  user?: JwtUser
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Не авторизован' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtUser

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' })
  }
}