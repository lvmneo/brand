import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../shared/api'

type OrderItem = {
  id: string
  quantity: number
  product: {
    id: string
    title: string
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

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await getMyOrders()
      setOrders(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-5xl font-bold">Мои заказы</h1>
          <div className="text-sm text-slate-500">
            Всего заказов: {orders.length}
          </div>
        </div>

        {isLoading && (
          <div className="text-slate-600">Загрузка заказов...</div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed p-6 text-slate-600">
            У вас пока нет заказов
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm text-slate-500">Номер заказа</div>
                  <div className="font-semibold break-all">{order.id}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Дата</div>
                  <div className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Сумма</div>
                  <div className="font-semibold">{order.totalAmount} ₽</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Статус</div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      statusClassMap[order.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {statusMap[order.status] || order.status}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/profile/orders/${order.id}`}
                    className="inline-flex rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border p-3"
                  >
                    <img
                      src={item.product.imageUrl || 'https://placehold.co/100x100'}
                      alt={item.product.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="font-medium">{item.product.title}</div>
                      <div className="text-sm text-slate-500">
                        {item.quantity} шт.
                      </div>
                    </div>

                    <div className="font-semibold">
                      {item.product.price * item.quantity} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}