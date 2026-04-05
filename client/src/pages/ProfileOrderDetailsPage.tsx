import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMyOrderById } from '../shared/api'
import { useCartStore } from '../store/cartStore'

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    slug: string
    description?: string
    imageUrl?: string | null
    price: number
  }
}

type Order = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

const statusMap: Record<string, string> = {
  PENDING: 'Создан',
  PAID: 'Оплачен',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

const statusClassMap: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function ProfileOrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addOrderToCart = useCartStore((state) => state.addOrderToCart)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadOrder(id)
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      const res = await getMyOrderById(orderId)
      setOrder(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepeatOrder = () => {
    if (!order) return

    addOrderToCart(order.items)
    navigate('/cart')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-3xl font-bold">Аккаунт</h2>

        <nav className="flex flex-col gap-3">
          <Link
            to="/profile"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100"
          >
            Профиль
          </Link>

          <Link
            to="/profile/orders"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
          >
            Мои заказы
          </Link>
        </nav>
      </aside>

      <section className="rounded-3xl border bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/profile/orders"
            className="text-sm text-slate-500 transition hover:text-black"
          >
            ← Назад к заказам
          </Link>

          {order && (
            <button
              onClick={handleRepeatOrder}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Повторить заказ
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-slate-500">Загрузка заказа...</div>
        ) : !order ? (
          <div className="text-slate-500">Заказ не найден</div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-sm text-slate-500">Номер заказа</div>
                <h1 className="mt-2 break-all text-4xl font-bold">{order.id}</h1>
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-sm text-slate-500">Дата</div>
                  <div className="mt-1 text-xl font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Сумма</div>
                  <div className="mt-1 text-xl font-semibold">
                    {order.totalAmount} ₽
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Статус</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        statusClassMap[order.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusMap[order.status] || order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border p-4"
                >
                  <img
                    src={item.product.imageUrl || 'https://placehold.co/120x120'}
                    alt={item.product.title}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="text-xl font-semibold">
                      {item.product.title}
                    </div>

                    {item.product.description && (
                      <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {item.product.description}
                      </div>
                    )}

                    <div className="mt-2 text-sm text-slate-500">
                      Количество: {item.quantity}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Цена за штуку: {item.price} ₽
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-500">Итого</div>
                    <div className="mt-1 text-xl font-bold">
                      {item.price * item.quantity} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}