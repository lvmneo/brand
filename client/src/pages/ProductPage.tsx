import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  api,
  getProductReviews,
  canReviewProduct,
  createReview,
} from '../shared/api'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'

type Product = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  stock: number
  imageUrl?: string | null
  brand?: {
    name: string
    slug?: string
  }
  category?: {
    name: string
  }
}

type Review = {
  id: string
  rating: number
  text: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

const renderStars = (rating: number) => {
  const rounded = Math.round(rating)

  return (
    <div className="flex items-center gap-1 text-lg text-[#005bff]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < rounded ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [canReview, setCanReview] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [delivered, setDelivered] = useState(false)

  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const favoriteItems = useFavoritesStore((state) => state.items)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!slug) return

    setLoading(true)

    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data)
      })
      .catch((error) => {
        console.error('Ошибка загрузки товара:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    if (!product?.id) return

    loadReviews(product.id)

    if (token) {
      loadCanReview(product.id)
    } else {
      setCanReview(false)
      setAlreadyReviewed(false)
      setPurchased(false)
      setDelivered(false)
    }
  }, [product?.id, token])

  const loadReviews = async (productId: string) => {
    try {
      const res = await getProductReviews(productId)
      setReviews(res.data.reviews)
      setAverageRating(res.data.averageRating)
      setReviewsCount(res.data.reviewsCount)
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    }
  }

  const loadCanReview = async (productId: string) => {
    try {
      const res = await canReviewProduct(productId)
      setCanReview(res.data.canReview)
      setAlreadyReviewed(res.data.alreadyReviewed)
      setPurchased(res.data.purchased)
      setDelivered(res.data.delivered)
    } catch (error) {
      console.error('Ошибка проверки возможности отзыва:', error)
    }
  }

  const handleCreateReview = async () => {
    if (!product) return

    try {
      setSubmittingReview(true)

      await createReview({
        productId: product.id,
        rating,
        text: reviewText,
      })

      setReviewText('')
      setRating(5)

      await loadReviews(product.id)
      await loadCanReview(product.id)

      alert('Отзыв успешно добавлен')
    } catch (error: any) {
      console.error(error)
      alert(error?.response?.data?.message || 'Ошибка создания отзыва')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-[520px] rounded-[30px] bg-white" />
            <div className="h-[420px] rounded-[30px] bg-white" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="rounded-[30px] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <h1 className="text-3xl font-bold text-neutral-900">Товар не найден</h1>
          </div>
        </div>
      </div>
    )
  }

  const isFavorite = favoriteItems.some((item) => item.id === product.id)

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      {showToast && (
        <div className="fixed right-6 top-24 z-50 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-medium text-white shadow-lg">
          Товар добавлен в корзину
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link to="/" className="transition hover:text-[#005bff]">
              Главная
            </Link>
            <span>—</span>
            <Link to="/products" className="transition hover:text-[#005bff]">
              Товары
            </Link>
            {product.brand?.slug && (
              <>
                <span>—</span>
                <Link
                  to={`/brands/${product.brand.slug}`}
                  className="transition hover:text-[#005bff]"
                >
                  {product.brand.name}
                </Link>
              </>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-[#e6eef9] bg-[#f8fbff] p-4 md:p-6">
              <div className="overflow-hidden rounded-[24px] bg-[#f4f7fb]">
                <img
                  src={product.imageUrl || 'https://placehold.co/800x800'}
                  alt={product.title}
                  className="aspect-square w-full object-contain"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e6eef9] bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#005bff]">
                    {product.brand?.name || 'Бренд'}
                  </p>

                  <h1 className="mt-2 text-3xl font-bold text-neutral-900 md:text-4xl">
                    {product.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-[#005bff]">
                        ★ {averageRating ? averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-sm text-slate-500">
                        Отзывов: {reviewsCount}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite({
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      brandName: product.brand?.name,
                    })
                  }
                  className="cursor-pointer rounded-full border border-[#d7e3f8] bg-white px-4 py-2 text-xl shadow-sm transition hover:bg-[#f8fbff]"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
                <div className="text-sm text-slate-500">Цена</div>
                <div className="mt-2 text-4xl font-bold text-neutral-900">
                  {product.price} ₽
                </div>

                <p
                  className={`mt-3 text-sm font-semibold ${
                    product.stock === 0 ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {product.stock === 0
                    ? 'Нет в наличии'
                    : `В наличии: ${product.stock} шт.`}
                </p>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {product.category?.name && (
                  <span className="rounded-full border border-[#d7e3f8] bg-white px-4 py-2 text-sm font-semibold text-neutral-900">
                    {product.category.name}
                  </span>
                )}

                {product.brand?.name && (
                  <span className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#005bff]">
                    {product.brand.name}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() => {
                  if (product.stock === 0) return

                  addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    imageUrl: product.imageUrl,
                  })

                  setShowToast(true)

                  setTimeout(() => {
                    setShowToast(false)
                  }, 2000)
                }}
                className={`mt-8 w-full rounded-2xl py-4 text-base font-semibold text-white transition ${
                  product.stock === 0
                    ? 'cursor-not-allowed bg-neutral-400'
                    : 'cursor-pointer bg-[#005bff] hover:bg-[#0047cc]'
                }`}
              >
                {product.stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Отзывы</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Оценки и впечатления покупателей
              </p>
            </div>

            <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
              Всего отзывов: {reviewsCount}
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <div className="text-sm text-slate-500">Рейтинг товара</div>
                <div className="mt-1 text-3xl font-bold text-[#005bff]">
                  {averageRating ? averageRating.toFixed(1) : '0.0'}
                </div>
              </div>

              <div className="flex flex-col">
                {renderStars(averageRating)}
                <div className="mt-1 text-sm text-slate-500">
                  На основе {reviewsCount} отзывов
                </div>
              </div>
            </div>
          </div>

          {token && canReview && (
            <div className="mt-6 rounded-[24px] border border-[#d7e3f8] bg-white p-5">
              <h3 className="text-lg font-semibold text-neutral-900">
                Оставить отзыв
              </h3>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Оценка
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
                >
                  <option value={5}>5 — Отлично</option>
                  <option value={4}>4 — Хорошо</option>
                  <option value={3}>3 — Нормально</option>
                  <option value={2}>2 — Плохо</option>
                  <option value={1}>1 — Ужасно</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Текст отзыва
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Поделись впечатлением о товаре..."
                  className="w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
                />
              </div>

              <button
                type="button"
                disabled={submittingReview}
                onClick={handleCreateReview}
                className="mt-4 cursor-pointer rounded-2xl bg-[#005bff] px-6 py-3 font-semibold text-white transition hover:bg-[#0047cc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </div>
          )}

          {token && !canReview && purchased && alreadyReviewed && (
            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
              Ты уже оставил отзыв на этот товар
            </div>
          )}

          {token && !canReview && !purchased && (
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-700">
              Оставить отзыв может только пользователь, который купил этот товар
            </div>
          )}

          {token && purchased && !delivered && !alreadyReviewed && (
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
              Отзыв можно оставить только после доставки товара
            </div>
          )}

          {!token && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Войди в аккаунт, чтобы оставить отзыв после покупки
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-8 text-neutral-500">
                Пока нет отзывов
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-[24px] border border-[#d7e3f8] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="font-semibold text-neutral-900">
                      {review.user.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  <div className="mt-2">{renderStars(review.rating)}</div>

                  <p className="mt-3 text-slate-700">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}