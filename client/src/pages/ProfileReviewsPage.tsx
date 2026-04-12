import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getMyReviews } from '../shared/api'
import { useAuthStore } from '../store/authStore'

type Review = {
  id: string
  rating: number
  text: string
  createdAt: string
  product: {
    id: string
    title: string
    slug: string
    imageUrl?: string | null
  }
}

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1 text-lg text-[#005bff]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < rating ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

export default function ProfileReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user?.role === 'USER') {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    try {
      const res = await getMyReviews()
      setReviews(res.data)
    } catch (error) {
      console.error('Ошибка загрузки моих отзывов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <h2 className="text-2xl font-bold text-neutral-900">Аккаунт</h2>

            <div className="mt-6 space-y-3">
              <Link
                to="/profile"
                className="block cursor-pointer rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
              >
                Профиль
              </Link>

              <Link
                to="/profile/orders"
                className="block cursor-pointer rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
              >
                Мои заказы
              </Link>

              <Link
                to="/profile/reviews"
                className="block cursor-pointer rounded-2xl bg-[#005bff] px-4 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)]"
              >
                Мои отзывы
              </Link>
            </div>
          </aside>

          <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  Мои отзывы
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                  Здесь собраны все отзывы, которые ты оставил на купленные товары
                </p>
              </div>

              <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
                Всего отзывов: {reviews.length}
              </div>
            </div>

            {isLoading ? (
              <div className="mt-8 text-slate-500">Загрузка отзывов...</div>
            ) : reviews.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-10 text-center text-neutral-500">
                У тебя пока нет отзывов
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[28px] border border-[#d7e3f8] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <img
                        src={review.product.imageUrl || 'https://placehold.co/120x120'}
                        alt={review.product.title}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="text-xl font-semibold text-neutral-900">
                              {review.product.title}
                            </div>

                            <div className="mt-2 text-sm text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>

                          <div>{renderStars(review.rating)}</div>
                        </div>

                        <p className="mt-4 text-slate-700">{review.text}</p>

                        <div className="mt-5">
                          <Link
                            to={`/products/${review.product.slug}`}
                            className="inline-flex cursor-pointer rounded-2xl bg-[#005bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047cc]"
                          >
                            Перейти к товару
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}