import { useEffect, useState } from 'react'
import { getAdminStats, getAdminOrders, updateOrderStatus } from '../shared/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }

    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getAdminOrders(),
      ])

      setStats(statsRes.data)
      setOrders(ordersRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status)

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    } catch (e) {
      console.error(e)
      alert('Ошибка обновления')
    }
  }

  if (loading) return <div>Загрузка админки...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Админка</h1>

      {/* 📊 Статистика */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Пользователи</div>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Товары</div>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Заказы</div>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Выручка</div>
            <div className="text-2xl font-bold">{stats.revenue} ₽</div>
          </div>
        </div>
      )}

      {/* 📦 Заказы */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Все заказы</h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">ID</div>
                  <div className="font-semibold">{order.id}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Пользователь</div>
                  <div>{order.user?.email}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Сумма</div>
                  <div>{order.totalAmount} ₽</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Статус</div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="rounded-lg border px-2 py-1"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-sm">
                    {item.product.title} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}