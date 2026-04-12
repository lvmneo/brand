import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getMyOrderById,
  canReviewProduct,
  createReview,
} from '../shared/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

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
  deliveryPrice: number
  recipientName?: string | null
  phone?: string | null
  city?: string | null
  address?: string | null
  comment?: string | null
  deliveryMethod?: 'COURIER' | 'PICKUP' | null
  paymentMethod?: 'CARD' | 'SBP' | 'CASH' | null
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | null
  cardLast4?: string | null
  cardBrand?: string | null
  transactionId?: string | null
  createdAt: string
  items: OrderItem[]
}

type ReviewState = {
  canReview: boolean
  alreadyReviewed: boolean
  purchased: boolean
  delivered: boolean
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

const paymentStatusMap: Record<string, string> = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачено',
  FAILED: 'Ошибка оплаты',
}

const paymentStatusClassMap: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

const statusSteps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']

function getCurrentStepIndex(status: string) {
  return statusSteps.indexOf(status)
}

function getDeliveryLabel(deliveryMethod?: 'COURIER' | 'PICKUP' | null) {
  if (deliveryMethod === 'COURIER') return 'Курьер'
  if (deliveryMethod === 'PICKUP') return 'Самовывоз'
  return '—'
}

function getPaymentLabel(paymentMethod?: 'CARD' | 'SBP' | 'CASH' | null) {
  if (paymentMethod === 'CARD') return 'Карта онлайн'
  if (paymentMethod === 'SBP') return 'СБП'
  if (paymentMethod === 'CASH') return 'При получении'
  return '—'
}

export default function ProfileOrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addOrderToCart = useCartStore((state) => state.addOrderToCart)
  const user = useAuthStore((state) => state.user)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [reviewPermissions, setReviewPermissions] = useState<
    Record<string, ReviewState>
  >({})

  const [openReviewProductId, setOpenReviewProductId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    loadOrder(id)
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      const res = await getMyOrderById(orderId)
      const loadedOrder = res.data
      setOrder(loadedOrder)

      await loadReviewPermissions(loadedOrder.items)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviewPermissions = async (items: OrderItem[]) => {
    try {
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await canReviewProduct(item.product.id)
            return {
              productId: item.product.id,
              data: res.data,
            }
          } catch (error) {
            console.error('Ошибка проверки отзыва:', error)
            return {
              productId: item.product.id,
              data: {
                canReview: false,
                alreadyReviewed: false,
                purchased: false,
                delivered: false,
              },
            }
          }
        })
      )

      const mapped = results.reduce<Record<string, ReviewState>>((acc, item) => {
        acc[item.productId] = item.data
        return acc
      }, {})

      setReviewPermissions(mapped)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRepeatOrder = () => {
    if (!order) return
    addOrderToCart(order.items)
    navigate('/cart')
  }

  const handleOpenReview = (productId: string) => {
    setOpenReviewProductId(productId)
    setReviewRating(5)
    setReviewText('')
  }

  const handleSubmitReview = async (productId: string) => {
    try {
      if (!reviewText.trim()) {
        alert('Напиши текст отзыва')
        return
      }

      setSubmittingReview(true)

      await createReview({
        productId,
        rating: reviewRating,
        text: reviewText,
      })

      alert('Отзыв успешно добавлен')

      setOpenReviewProductId(null)
      setReviewText('')
      setReviewRating(5)

      if (order) {
        await loadReviewPermissions(order.items)
      }
    } catch (error: any) {
      console.error(error)
      alert(error?.response?.data?.message || 'Ошибка создания отзыва')
    } finally {
      setSubmittingReview(false)
    }
  }

  const currentStepIndex = order ? getCurrentStepIndex(order.status) : -1
  const isCancelled = order?.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <div className="bg-[linear-gradient(135deg,#005bff_0%,#2e7cff_58%,#ff4db8_140%)] px-6 py-8 text-white md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/profile/orders"
                  className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  ← Назад к заказам
                </Link>

                {order && (
                  <button
                    onClick={handleRepeatOrder}
                    className="cursor-pointer rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#005bff] shadow-sm transition hover:-translate-y-0.5"
                  >
                    Повторить заказ
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="mt-8 text-white/80">Загрузка заказа...</div>
              ) : !order ? (
                <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 text-white/90">
                  Заказ не найден
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="text-sm text-white/75">Номер заказа</div>
                      <h1 className="mt-2 break-all text-3xl font-bold md:text-5xl">
                        {order.id}
                      </h1>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div>
                        <div className="text-sm text-white/75">Дата</div>
                        <div className="mt-1 text-xl font-semibold">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-white/75">Сумма</div>
                        <div className="mt-1 text-xl font-semibold">
                          {order.totalAmount} ₽
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-white/75">Статус</div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              statusClassMap[order.status] ||
                              'bg-white/20 text-white'
                            }`}
                          >
                            {statusMap[order.status] || order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isLoading && order && (
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/profile"
                    className="inline-flex cursor-pointer rounded-2xl border border-[#d7e3f8] px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
                  >
                    Профиль
                  </Link>

                  <Link
                    to="/profile/orders"
                    className="inline-flex cursor-pointer rounded-2xl bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#005bff]"
                  >
                    Мои заказы
                  </Link>

                  {user?.role === 'USER' && (
                    <Link
                      to="/profile/reviews"
                      className="inline-flex cursor-pointer rounded-2xl border border-[#d7e3f8] px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
                    >
                      Мои отзывы
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>

          {!isLoading && order && (
            <>
              <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Статус заказа
                </h2>

                {isCancelled ? (
                  <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    Заказ отменён
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    {statusSteps.map((step, index) => {
                      const isActive = currentStepIndex >= index
                      const isCurrent = order.status === step

                      return (
                        <div key={step}>
                          <div
                            className={`rounded-[24px] border px-4 py-5 text-center transition ${
                              isActive
                                ? 'border-[#005bff] bg-[#eef5ff] text-[#005bff]'
                                : 'border-[#d7e3f8] bg-white text-slate-400'
                            }`}
                          >
                            <div
                              className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                isActive
                                  ? 'bg-[#005bff] text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="text-sm font-semibold">
                              {statusMap[step]}
                            </div>

                            {isCurrent && (
                              <div className="mt-2 text-xs font-medium text-[#005bff]">
                                Текущий этап
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[30px] border border-[#d7e3f8] bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-900">
                    Получатель и доставка
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Получатель</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {order.recipientName || '—'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Телефон</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {order.phone || '—'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Город</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {order.city || '—'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Доставка</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {getDeliveryLabel(order.deliveryMethod)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Адрес</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {order.address || '—'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Стоимость доставки</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {order.deliveryPrice} ₽
                      </span>
                    </div>

                    {order.comment && (
                      <div className="rounded-2xl bg-[#f8fbff] p-4">
                        <div className="text-sm text-slate-500">Комментарий</div>
                        <div className="mt-2 text-sm font-medium text-neutral-900">
                          {order.comment}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[30px] border border-[#d7e3f8] bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-900">Оплата</h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Способ оплаты</span>
                      <span className="text-right font-semibold text-neutral-900">
                        {getPaymentLabel(order.paymentMethod)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500">Статус оплаты</span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          paymentStatusClassMap[order.paymentStatus || 'PENDING'] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {paymentStatusMap[order.paymentStatus || 'PENDING'] ||
                          order.paymentStatus ||
                          '—'}
                      </span>
                    </div>

                    {order.paymentMethod === 'CARD' && order.cardLast4 && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-slate-500">Карта</span>
                        <span className="text-right font-semibold text-neutral-900">
                          {order.cardBrand || 'Карта'} •••• {order.cardLast4}
                        </span>
                      </div>
                    )}

                    {order.transactionId && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-slate-500">Транзакция</span>
                        <span className="text-right font-semibold text-neutral-900">
                          {order.transactionId}
                        </span>
                      </div>
                    )}

                    <div className="rounded-2xl bg-[#f8fbff] p-4">
                      <div className="text-sm text-slate-500">Итого к оплате</div>
                      <div className="mt-2 text-2xl font-bold text-neutral-900">
                        {order.totalAmount} ₽
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {order.items.map((item) => {
                  const reviewInfo = reviewPermissions[item.product.id]

                  return (
                    <div
                      key={item.id}
                      className="rounded-[30px] border border-[#d7e3f8] bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        <img
                          src={item.product.imageUrl || 'https://placehold.co/120x120'}
                          alt={item.product.title}
                          className="h-24 w-24 rounded-2xl object-cover"
                        />

                        <div className="flex-1">
                          <div className="text-2xl font-semibold text-neutral-900">
                            {item.product.title}
                          </div>

                          {item.product.description && (
                            <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {item.product.description}
                            </div>
                          )}

                          <div className="mt-3 text-sm text-slate-500">
                            Количество: {item.quantity}
                          </div>

                          <div className="mt-1 text-sm text-slate-500">
                            Цена за штуку: {item.price} ₽
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                              to={`/products/${item.product.slug}`}
                              className="inline-flex rounded-2xl border border-[#d7e3f8] px-4 py-2 text-sm font-semibold text-[#005bff] transition hover:bg-[#eef5ff]"
                            >
                              Открыть товар
                            </Link>

                            {reviewInfo?.canReview && (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item.product.id)}
                                className="cursor-pointer rounded-2xl bg-[#005bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047cc]"
                              >
                                Оставить отзыв
                              </button>
                            )}

                            {reviewInfo?.alreadyReviewed && (
                              <div className="rounded-2xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                                Отзыв уже оставлен
                              </div>
                            )}
                          </div>

                          {reviewInfo?.purchased &&
                            !reviewInfo?.delivered &&
                            !reviewInfo?.alreadyReviewed && (
                              <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                                Отзыв можно оставить только после доставки товара
                              </div>
                            )}
                        </div>

                        <div className="text-left md:text-right">
                          <div className="text-sm text-slate-500">Итого</div>
                          <div className="mt-1 text-3xl font-bold text-neutral-900">
                            {item.price * item.quantity} ₽
                          </div>
                        </div>
                      </div>

                      {openReviewProductId === item.product.id && (
                        <div className="mt-5 rounded-[24px] bg-[#f8fbff] p-4">
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Новый отзыв
                          </h3>

                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-neutral-900">
                              Оценка
                            </label>
                            <select
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                            >
                              <option value={5}>5 — Отлично</option>
                              <option value={4}>4 — Хорошо</option>
                              <option value={3}>3 — Нормально</option>
                              <option value={2}>2 — Плохо</option>
                              <option value={1}>1 — Ужасно</option>
                            </select>
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-neutral-900">
                              Текст отзыва
                            </label>
                            <textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              rows={4}
                              placeholder="Поделись впечатлением о товаре..."
                              className="w-full rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                            />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={submittingReview}
                              onClick={() => handleSubmitReview(item.product.id)}
                              className="cursor-pointer rounded-2xl bg-[#005bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setOpenReviewProductId(null)}
                              className="cursor-pointer rounded-2xl border border-[#d7e3f8] bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-[#f8fbff]"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}