import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
    <div className="flex items-center gap-1 text-lg">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>
          {index < rounded ? '★' : '☆'}
        </span>
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
    return <div>Загрузка товара...</div>
  }

  if (!product) {
    return <div>Товар не найден</div>
  }

  const isFavorite = favoriteItems.some((item) => item.id === product.id)

  return (
    <div className="space-y-8">
      {showToast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-black px-5 py-3 text-sm text-white shadow-lg">
          Товар добавлен в корзину
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <img
            src={product.imageUrl || 'https://placehold.co/600x600'}
            alt={product.title}
            className="w-full rounded-2xl object-cover"
          />
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                {product.brand?.name || 'Бренд'}
              </p>

              <h1 className="mt-2 text-3xl font-bold">{product.title}</h1>

              <div className="mt-3 flex items-center gap-3">
                <div className="text-lg font-semibold text-[#005bff]">
                  ⭐ {averageRating ? averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-slate-500">
                  Отзывов: {reviewsCount}
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
              className="cursor-pointer rounded-full border px-4 py-2 text-xl"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="mt-4 text-2xl font-bold">{product.price} ₽</p>

          <p
            className={`mt-2 text-sm font-medium ${
              product.stock === 0 ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {product.stock === 0
              ? 'Нет в наличии'
              : `В наличии: ${product.stock} шт.`}
          </p>

          <p className="mt-4 text-slate-600">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.category?.name && (
              <span className="rounded-full border px-4 py-2 text-sm">
                {product.category.name}
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
            className={`mt-8 w-full rounded-2xl py-3 text-white transition ${
              product.stock === 0
                ? 'cursor-not-allowed bg-neutral-400'
                : 'cursor-pointer bg-black hover:opacity-90'
            }`}
          >
            {product.stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-neutral-900">Отзывы</h2>

       <div className="mt-4 rounded-2xl bg-[#f8fbff] p-4">
  <div className="flex flex-wrap items-center gap-4">
    <div>
      <div className="text-sm text-slate-500">Рейтинг товара</div>
      <div className="mt-1 text-2xl font-bold text-[#005bff]">
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
          <div className="mt-6 rounded-2xl border p-4">
            <h3 className="text-lg font-semibold">Оставить отзыв</h3>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Оценка</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              >
                <option value={5}>5 — Отлично</option>
                <option value={4}>4 — Хорошо</option>
                <option value={3}>3 — Нормально</option>
                <option value={2}>2 — Плохо</option>
                <option value={1}>1 — Ужасно</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Текст отзыва</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                placeholder="Поделись впечатлением о товаре..."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
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

        {!token && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Войди в аккаунт, чтобы оставить отзыв после покупки
          </div>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-slate-500">
              Пока нет отзывов
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold">{review.user.name}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                <div className="mt-2 text-[#005bff]">
  {renderStars(review.rating)}
</div>

                <p className="mt-3 text-slate-700">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}