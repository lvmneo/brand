import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { createOrder } from '../shared/api'

type DeliveryMethod = 'COURIER' | 'PICKUP'
type PaymentMethod = 'CARD' | 'SBP' | 'CASH'

export default function CartPage() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const token = useAuthStore((state) => state.token)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('COURIER')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD')
  const [cardNumber, setCardNumber] = useState('')

  const productsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const deliveryPrice = deliveryMethod === 'COURIER' ? 299 : 0
  const totalPrice = productsTotal + deliveryPrice

  const handleCheckout = async () => {
    if (!token) {
      alert('Сначала войди в аккаунт')
      navigate('/login')
      return
    }

    if (!recipientName.trim() || !phone.trim() || !city.trim()) {
      alert('Заполни имя, телефон и город')
      return
    }

    if (deliveryMethod === 'COURIER' && !address.trim()) {
      alert('Укажи адрес доставки')
      return
    }

    if (paymentMethod === 'CARD') {
      const digitsOnly = cardNumber.replace(/\D/g, '')
      if (digitsOnly.length < 16) {
        alert('Укажи корректный номер карты')
        return
      }
    }

    try {
      setIsSubmitting(true)

      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      await createOrder({
        items: orderItems,
        recipientName,
        phone,
        city,
        address,
        comment,
        deliveryMethod,
        paymentMethod,
        cardNumber,
      })

      clearCart()
      alert('Заказ успешно оформлен')
      navigate('/profile/orders')
    } catch (error: any) {
      console.error('Ошибка оформления заказа:', error)

      const message =
        error?.response?.data?.message || 'Ошибка оформления заказа'

      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
        <h1 className="text-4xl font-bold text-neutral-900">Корзина</h1>
        <p className="mt-4 text-slate-600">Корзина пока пуста</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="space-y-6">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900">Оформление заказа</h1>
              <p className="mt-2 text-sm text-slate-500">
                Проверь товары, укажи доставку и способ оплаты
              </p>
            </div>

            <button
              onClick={clearCart}
              className="cursor-pointer rounded-2xl border border-[#d7e3f8] px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
            >
              Очистить корзину
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-[#d7e3f8] bg-[#f8fbff] p-4"
              >
                <img
                  src={item.imageUrl || 'https://placehold.co/120x120'}
                  alt={item.title}
                  className="h-24 w-24 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-neutral-900">{item.title}</h2>
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
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="text-2xl font-bold text-neutral-900">Данные получателя</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Имя получателя"
              className="rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон"
              className="rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
            />

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Город"
              className="rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={deliveryMethod === 'PICKUP' ? 'Самовывоз' : 'Адрес доставки'}
              disabled={deliveryMethod === 'PICKUP'}
              className="rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Комментарий к заказу"
            className="mt-4 w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
          />
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="text-2xl font-bold text-neutral-900">Доставка</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setDeliveryMethod('COURIER')}
              className={`rounded-2xl border p-4 text-left transition ${
                deliveryMethod === 'COURIER'
                  ? 'border-[#005bff] bg-[#eef5ff]'
                  : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
              }`}
            >
              <div className="font-semibold">Курьер</div>
              <div className="mt-1 text-sm text-slate-500">Доставка по адресу — 299 ₽</div>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('PICKUP')}
              className={`rounded-2xl border p-4 text-left transition ${
                deliveryMethod === 'PICKUP'
                  ? 'border-[#005bff] bg-[#eef5ff]'
                  : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
              }`}
            >
              <div className="font-semibold">Самовывоз</div>
              <div className="mt-1 text-sm text-slate-500">Из пункта выдачи — бесплатно</div>
            </button>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="text-2xl font-bold text-neutral-900">Способ оплаты</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'CARD'
                  ? 'border-[#005bff] bg-[#eef5ff]'
                  : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
              }`}
            >
              <div className="font-semibold">Карта онлайн</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('SBP')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'SBP'
                  ? 'border-[#005bff] bg-[#eef5ff]'
                  : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
              }`}
            >
              <div className="font-semibold">СБП</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'CASH'
                  ? 'border-[#005bff] bg-[#eef5ff]'
                  : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
              }`}
            >
              <div className="font-semibold">При получении</div>
            </button>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="mt-4">
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Номер карты"
                className="w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
              />
              <p className="mt-2 text-xs text-slate-500">
                Для диплома это демо-форма: в заказ сохраняются только последние 4 цифры карты.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
        <h2 className="text-2xl font-bold text-neutral-900">Ваш заказ</h2>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Товары</span>
            <span className="font-semibold">{productsTotal} ₽</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Доставка</span>
            <span className="font-semibold">{deliveryPrice} ₽</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Итого</span>
              <span>{totalPrice} ₽</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-[#005bff] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
        </button>

        <p className="mt-3 text-xs text-slate-500">
          Нажимая кнопку, ты подтверждаешь оформление заказа в демо-режиме.
        </p>
      </aside>
    </div>
  )
}