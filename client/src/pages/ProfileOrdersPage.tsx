import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../shared/api'
import { useAuthStore } from '../store/authStore'

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
  const user = useAuthStore((state) => state.user)

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
      <aside className="h-fit rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
        <h2 className="text-2xl font-bold text-neutral-900">Аккаунт</h2>

        <div className="mt-6 space-y-3">
          <Link
            to="/profile"
            className="block rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
          >
            Профиль
          </Link>

          <Link
            to="/profile/orders"
            className="block rounded-2xl bg-black px-4 py-3 font-semibold text-white"
          >
            Мои заказы
          </Link>

          {user?.role === 'USER' && (
            <Link
              to="/profile/reviews"
              className="block rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
            >
              Мои отзывы
            </Link>
          )}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-bold text-neutral-900">Мои заказы</h1>
              <p className="mt-3 text-sm text-slate-500">
                История всех твоих заказов
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#005bff]">
              Всего заказов: {orders.length}
            </div>
          </div>

          {isLoading && (
            <div className="mt-8 text-slate-600">Загрузка заказов...</div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed p-8 text-slate-600">
              У вас пока нет заказов
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#d7e3f8] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Номер заказа</div>
                      <div className="mt-1 break-all font-semibold text-neutral-900">
                        {order.id}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Дата</div>
                      <div className="mt-1 font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Сумма</div>
                      <div className="mt-1 font-semibold">
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

                    <Link
                      to={`/profile/orders/${order.id}`}
                      className="rounded-2xl bg-[#005bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047cc]"
                    >
                      Подробнее
                    </Link>
                  </div>

                  <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="min-w-[220px] rounded-2xl border border-[#d7e3f8] bg-[#f8fbff] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.imageUrl || 'https://placehold.co/100x100'}
                            alt={item.product.title}
                            className="h-16 w-16 rounded-xl object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-neutral-900">
                              {item.product.title}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              {item.quantity} шт.
                            </div>
                            <div className="mt-1 text-sm font-semibold text-neutral-900">
                              {item.product.price * item.quantity} ₽
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}