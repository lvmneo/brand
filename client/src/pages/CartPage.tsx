import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { createOrder } from '../shared/api'

export default function CartPage() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const token = useAuthStore((state) => state.token)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handleCheckout = async () => {
    if (!token) {
      alert('Сначала войди в аккаунт')
      navigate('/login')
      return
    }

    try {
      setIsSubmitting(true)

      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      await createOrder({ items: orderItems })

      clearCart()
      alert('Заказ успешно оформлен')
      navigate('/profile')
    }  catch (error: any) {
  console.error('Ошибка оформления заказа:', error)

  const message =
    error?.response?.data?.message || 'Ошибка оформления заказа'

  alert(message)
}
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Корзина</h1>
        <p className="mt-4 text-slate-600">Корзина пока пуста</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Корзина</h1>

        <button
          onClick={clearCart}
          className="cursor-pointer rounded-xl border px-4 py-2 text-sm"
        >
          Очистить корзину
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
          >
            <img
              src={item.imageUrl || 'https://placehold.co/120x120'}
              alt={item.title}
              className="h-24 w-24 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-slate-600">{item.price} ₽</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => decreaseQuantity(item.id)}
                className="cursor-pointer rounded-lg border px-3 py-1"
              >
                -
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() => increaseQuantity(item.id)}
                className="cursor-pointer rounded-lg border px-3 py-1"
              >
                +
              </button>
            </div>

            <div className="w-28 text-right font-bold">
              {item.price * item.quantity} ₽
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="cursor-pointer rounded-lg border px-3 py-1 text-sm"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Итого: {totalPrice} ₽</h2>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="mt-4 cursor-pointer rounded-xl bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
        </button>
      </div>
    </div>
  )
}