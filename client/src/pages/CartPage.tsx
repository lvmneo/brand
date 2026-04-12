import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { createOrder } from '../shared/api'

type DeliveryMethod = 'COURIER' | 'PICKUP'
type PaymentMethod = 'CARD' | 'SBP' | 'CASH'

const sbpBanks = [
  'СберБанк',
  'Т-Банк',
  'Альфа-Банк',
  'ВТБ',
  'Газпромбанк',
]

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function CartPage() {
  const navigate = useNavigate()

  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const token = useAuthStore((state) => state.token)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false)
  const [isProcessingSbpPayment, setIsProcessingSbpPayment] = useState(false)

  const [cardPaymentConfirmed, setCardPaymentConfirmed] = useState(false)
  const [sbpPaymentConfirmed, setSbpPaymentConfirmed] = useState(false)

  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('COURIER')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD')

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const [sbpBank, setSbpBank] = useState('СберБанк')

  const productsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const deliveryPrice = deliveryMethod === 'COURIER' ? 299 : 0
  const totalPrice = productsTotal + deliveryPrice

  const isPaymentConfirmed =
    paymentMethod === 'CARD'
      ? cardPaymentConfirmed
      : paymentMethod === 'SBP'
      ? sbpPaymentConfirmed
      : true

  const sbpQrPayload = JSON.stringify({
    type: 'SBP_DEMO',
    merchant: 'BrandMart',
    amount: totalPrice,
    bank: sbpBank,
    city: city || 'Moscow',
    recipient: recipientName || 'Customer',
  })

  const sbpQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    sbpQrPayload
  )}`

  const handleMockCardPayment = async () => {
    const digitsOnly = cardNumber.replace(/\D/g, '')

    if (digitsOnly.length !== 16) {
      alert('Номер карты должен содержать 16 цифр')
      return
    }

    if (!cardHolder.trim()) {
      alert('Укажи имя держателя карты')
      return
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
      alert('Укажи срок действия в формате MM/YY')
      return
    }

    if (!/^\d{3}$/.test(cvv.trim())) {
      alert('CVV должен содержать 3 цифры')
      return
    }

    try {
      setIsProcessingCardPayment(true)
      await new Promise((resolve) => setTimeout(resolve, 1400))
      setCardPaymentConfirmed(true)
      setSbpPaymentConfirmed(false)
      alert('Demo-оплата картой подтверждена')
    } finally {
      setIsProcessingCardPayment(false)
    }
  }

  const handleMockSbpPayment = async () => {
    if (!sbpBank.trim()) {
      alert('Выбери банк для оплаты по СБП')
      return
    }

    try {
      setIsProcessingSbpPayment(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setSbpPaymentConfirmed(true)
      setCardPaymentConfirmed(false)
      alert('Demo-оплата по СБП подтверждена')
    } finally {
      setIsProcessingSbpPayment(false)
    }
  }

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

    if ((paymentMethod === 'CARD' || paymentMethod === 'SBP') && !isPaymentConfirmed) {
      alert(
        paymentMethod === 'CARD'
          ? 'Сначала подтверди demo-оплату картой'
          : 'Сначала подтверди demo-оплату по СБП'
      )
      return
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
        cardHolder,
        expiry,
        cvv,
        sbpBank,
        paymentConfirmed: isPaymentConfirmed,
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
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              Корзина
            </h1>
            <p className="mt-4 text-slate-600">Корзина пока пуста</p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                Оформление заказа
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Заполни данные получателя, выбери доставку и способ оплаты
              </p>
            </div>

            <button
              onClick={clearCart}
              className="cursor-pointer rounded-2xl border border-[#d7e3f8] px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
            >
              Очистить корзину
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900">Товары</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-[#d7e3f8] bg-[#f8fbff] p-4 md:flex-row md:items-center"
                  >
                    <img
                      src={item.imageUrl || 'https://placehold.co/120x120'}
                      alt={item.title}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                      <p className="mt-1 text-slate-600">{item.price} ₽</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="cursor-pointer rounded-xl border border-[#d7e3f8] bg-white px-3 py-1.5"
                      >
                        -
                      </button>

                      <span className="min-w-[24px] text-center">{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="cursor-pointer rounded-xl border border-[#d7e3f8] bg-white px-3 py-1.5"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-bold text-neutral-900 md:w-28 md:text-right">
                      {item.price * item.quantity} ₽
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cursor-pointer rounded-xl border border-[#d7e3f8] bg-white px-3 py-2 text-sm transition hover:bg-[#eef5ff]"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900">Получатель</h2>

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
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900">Доставка</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('COURIER')}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    deliveryMethod === 'COURIER'
                      ? 'border-[#005bff] bg-[#eef5ff]'
                      : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
                  }`}
                >
                  <div className="font-semibold">Курьер</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Доставка по адресу — 299 ₽
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod('PICKUP')
                    setAddress('')
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-[#005bff] bg-[#eef5ff]'
                      : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
                  }`}
                >
                  <div className="font-semibold">Самовывоз</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Из пункта выдачи — бесплатно
                  </div>
                </button>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900">Оплата</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    paymentMethod === 'CARD'
                      ? 'border-[#005bff] bg-[#eef5ff]'
                      : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
                  }`}
                >
                  <div className="font-semibold">Карта онлайн</div>
                  <div className="mt-1 text-sm text-slate-500">Visa / Mastercard / Мир</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SBP')}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    paymentMethod === 'SBP'
                      ? 'border-[#005bff] bg-[#eef5ff]'
                      : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
                  }`}
                >
                  <div className="font-semibold">СБП</div>
                  <div className="mt-1 text-sm text-slate-500">Оплата по QR</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                    paymentMethod === 'CASH'
                      ? 'border-[#005bff] bg-[#eef5ff]'
                      : 'border-[#d7e3f8] bg-white hover:bg-[#f8fbff]'
                  }`}
                >
                  <div className="font-semibold">При получении</div>
                  <div className="mt-1 text-sm text-slate-500">Оплата в момент вручения</div>
                </button>
              </div>

              {paymentMethod === 'CARD' && (
                <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
                  <div className="mb-4 text-lg font-semibold text-neutral-900">
                    Данные карты
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={cardNumber}
                      onChange={(e) => {
                        setCardNumber(formatCardNumber(e.target.value))
                        setCardPaymentConfirmed(false)
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10 md:col-span-2"
                    />

                    <input
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value.toUpperCase())
                        setCardPaymentConfirmed(false)
                      }}
                      placeholder="IVAN IVANOV"
                      className="rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        value={expiry}
                        onChange={(e) => {
                          setExpiry(formatExpiry(e.target.value))
                          setCardPaymentConfirmed(false)
                        }}
                        placeholder="MM/YY"
                        className="rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                      />

                      <input
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                          setCardPaymentConfirmed(false)
                        }}
                        placeholder="CVV"
                        className="rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleMockCardPayment}
                    disabled={isProcessingCardPayment}
                    className="mt-5 cursor-pointer rounded-2xl bg-[#005bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessingCardPayment
                      ? 'Проверяем карту...'
                      : cardPaymentConfirmed
                      ? 'Оплата картой подтверждена'
                      : 'Подтвердить demo-оплату картой'}
                  </button>

                  <p className="mt-3 text-xs text-slate-500">
                    Полный номер карты и CVV в заказ не сохраняются.
                  </p>
                </div>
              )}

              {paymentMethod === 'SBP' && (
                <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
                  <div className="mb-4 text-lg font-semibold text-neutral-900">
                    Оплата по СБП
                  </div>

                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="rounded-3xl border border-[#d7e3f8] bg-white p-4">
                      <img
                        src={sbpQrUrl}
                        alt="QR для оплаты по СБП"
                        className="h-[220px] w-[220px] rounded-2xl object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <select
                        value={sbpBank}
                        onChange={(e) => {
                          setSbpBank(e.target.value)
                          setSbpPaymentConfirmed(false)
                        }}
                        className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                      >
                        {sbpBanks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>

                      <div className="rounded-2xl border border-[#d7e3f8] bg-white p-4 text-sm text-slate-600">
                        <div>Получатель: Brand Mart</div>
                        <div className="mt-1">Сумма: {totalPrice} ₽</div>
                        <div className="mt-1">Банк: {sbpBank}</div>
                        <div className="mt-1">Назначение: Оплата заказа</div>
                      </div>

                      <button
                        type="button"
                        onClick={handleMockSbpPayment}
                        disabled={isProcessingSbpPayment}
                        className="cursor-pointer rounded-2xl bg-[#005bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessingSbpPayment
                          ? 'Проверяем платёж...'
                          : sbpPaymentConfirmed
                          ? 'СБП-оплата подтверждена'
                          : 'Я оплатил через СБП'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5 text-sm text-slate-600">
                  Оплата будет произведена при получении заказа.
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit xl:sticky xl:top-28">
            <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
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

              <div className="mt-5 rounded-2xl bg-[#f8fbff] p-4 text-sm text-slate-600">
                <div>Доставка: {deliveryMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'}</div>
                <div className="mt-1">
                  Оплата:{' '}
                  {paymentMethod === 'CARD'
                    ? 'Карта онлайн'
                    : paymentMethod === 'SBP'
                    ? 'СБП'
                    : 'При получении'}
                </div>

                {(paymentMethod === 'CARD' || paymentMethod === 'SBP') && (
                  <div
                    className={`mt-2 font-semibold ${
                      isPaymentConfirmed ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {isPaymentConfirmed
                      ? 'Demo-оплата подтверждена'
                      : paymentMethod === 'CARD'
                      ? 'Ожидается подтверждение оплаты картой'
                      : 'Ожидается подтверждение оплаты по СБП'}
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="mt-6 w-full cursor-pointer rounded-2xl bg-[#005bff] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Это учебный checkout: платёж и QR выглядят реалистично, но работают в demo-режиме.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}