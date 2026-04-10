import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getMyOrderById,
  canReviewProduct,
  createReview,
} from '../shared/api'
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

type ReviewState = {
  canReview: boolean
  alreadyReviewed: boolean
  purchased: boolean
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

          <Link
            to="/profile/reviews"
            className="block rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
          >
            Мои отзывы
          </Link>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              to="/profile/orders"
              className="text-sm text-slate-500 transition hover:text-[#005bff]"
            >
              ← Назад к заказам
            </Link>

            {order && (
              <button
                onClick={handleRepeatOrder}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Повторить заказ
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-slate-500">Загрузка заказа...</div>
          ) : !order ? (
            <div className="rounded-2xl border border-dashed p-8 text-slate-500">
              Заказ не найден
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
                <div>
                  <div className="text-sm text-slate-500">Номер заказа</div>
                  <h1 className="mt-2 break-all text-5xl font-bold text-neutral-900">
                    {order.id}
                  </h1>
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

              <div className="mt-8 space-y-4">
                {order.items.map((item) => {
                  const reviewInfo = reviewPermissions[item.product.id]

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-[#d7e3f8] bg-white p-5 shadow-sm transition hover:shadow-md"
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
                              className="rounded-2xl border border-[#d7e3f8] px-4 py-2 text-sm font-semibold text-[#005bff] transition hover:bg-[#eef5ff]"
                            >
                              Открыть товар
                            </Link>

                            {reviewInfo?.canReview && (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item.product.id)}
                                className="rounded-2xl bg-[#005bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047cc]"
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
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-500">Итого</div>
                          <div className="mt-1 text-3xl font-bold text-neutral-900">
                            {item.price * item.quantity} ₽
                          </div>
                        </div>
                      </div>

                      {openReviewProductId === item.product.id && (
                        <div className="mt-5 rounded-2xl bg-[#f8fbff] p-4">
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
                              className="w-full rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
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
                              className="rounded-2xl bg-[#005bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setOpenReviewProductId(null)}
                              className="rounded-2xl border border-[#d7e3f8] px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-white"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}