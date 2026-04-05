import { useEffect, useState } from 'react'
import { getMe, getMyOrders } from '../shared/api'

type Order = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  items: any[]
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        getMe(),
        getMyOrders(),
      ])

      setUser(userRes.data)
      setOrders(ordersRes.data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Профиль</h1>

      {user && (
        <div style={{ marginBottom: 20 }}>
          <div><b>Имя:</b> {user.name}</div>
          <div><b>Email:</b> {user.email}</div>
        </div>
      )}

      <h2>Мои заказы</h2>

      {orders.length === 0 && <div>Заказов пока нет</div>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: '1px solid #ccc',
            marginBottom: 15,
            padding: 10,
          }}
        >
          <div><b>Заказ:</b> {order.id}</div>
          <div><b>Статус:</b> {order.status}</div>
          <div><b>Сумма:</b> {order.totalAmount} ₽</div>

          <div style={{ marginTop: 10 }}>
            {order.items.map((item: any) => (
              <div key={item.id}>
                {item.product.title} × {item.quantity}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}