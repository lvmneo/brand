import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe, getMyReviews } from '../shared/api'
import { useAuthStore } from '../store/authStore'
import AdminPanel from '../pages/AdminPanel'

type User = {
  id: string
  name: string
  email: string
  role?: 'USER' | 'ADMIN'
  createdAt?: string
}

type AdminTab = 'dashboard' | 'products' | 'brands' | 'categories' | 'orders'

export default function ProfilePage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard')
  const [reviewsCount, setReviewsCount] = useState(0)

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [authUser, token, navigate])

  const loadProfile = async () => {
    try {
      const profileRes = await getMe()
      const profile = profileRes.data as User

      setUser(profile)

      if (profile.role === 'USER') {
        try {
          const reviewsRes = await getMyReviews()
          setReviewsCount(reviewsRes.data.length)
        } catch (error) {
          console.error('Ошибка загрузки отзывов пользователя:', error)
          setReviewsCount(0)
        }
      } else {
        setReviewsCount(0)
      }
    } catch (error) {
      console.error(error)
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (!authUser || !token) return null

  const adminMenuButtonClass = (tab: AdminTab) =>
    [
      'block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition duration-200',
      'cursor-pointer',
      activeAdminTab === tab
        ? 'bg-[#eef5ff] text-[#005bff] shadow-sm'
        : 'text-neutral-900 hover:bg-[#f4f8ff]',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <h2 className="text-2xl font-bold text-neutral-900">
              {user?.role === 'ADMIN' ? 'Админка' : 'Аккаунт'}
            </h2>

            <div className="mt-6 space-y-3">
              {user?.role === 'ADMIN' ? (
                <div className="pt-1">
                  <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Разделы
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('dashboard')}
                      className={adminMenuButtonClass('dashboard')}
                    >
                      Дашборд
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('products')}
                      className={adminMenuButtonClass('products')}
                    >
                      Товары
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('brands')}
                      className={adminMenuButtonClass('brands')}
                    >
                      Бренды
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('categories')}
                      className={adminMenuButtonClass('categories')}
                    >
                      Категории
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('orders')}
                      className={adminMenuButtonClass('orders')}
                    >
                      Заказы
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="block cursor-pointer rounded-2xl bg-[#005bff] px-4 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)]"
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
                    className="block cursor-pointer rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
                  >
                    Мои отзывы
                  </Link>
                </>
              )}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
              <div className="bg-[linear-gradient(135deg,#005bff_0%,#2e7cff_58%,#ff4db8_140%)] px-6 py-8 text-white md:px-8">
                <div className="inline-flex rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff4db8]" />
                  Личный кабинет
                </div>

                <h1 className="mt-5 text-3xl font-bold md:text-5xl">Профиль</h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90">
                  Управляй данными аккаунта, заказами и отзывами в одном месте
                </p>
              </div>

              <div className="p-6 md:p-8">
                {isLoading ? (
                  <div className="text-neutral-500">Загрузка профиля...</div>
                ) : !user ? (
                  <div className="text-neutral-500">
                    Не удалось загрузить данные аккаунта
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5">
                        <div className="text-sm text-neutral-500">Имя</div>
                        <div className="mt-2 text-xl font-semibold text-neutral-900">
                          {user.name}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5">
                        <div className="text-sm text-neutral-500">Email</div>
                        <div className="mt-2 break-all text-xl font-semibold text-neutral-900">
                          {user.email}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5">
                        <div className="text-sm text-neutral-500">Роль</div>
                        <div className="mt-2 text-xl font-semibold text-neutral-900">
                          {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5">
                        <div className="text-sm text-neutral-500">
                          Дата регистрации
                        </div>
                        <div className="mt-2 text-xl font-semibold text-neutral-900">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                            : '—'}
                        </div>
                      </div>
                    </div>

                    {user.role === 'USER' && (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <Link
                          to="/profile/orders"
                          className="group rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#e6eef9] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#005bff] text-2xl text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)]">
                              📦
                            </div>

                            <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#005bff]">
                              История заказов
                            </span>
                          </div>

                          <h3 className="mt-5 text-2xl font-bold text-neutral-900">
                            Мои заказы
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-neutral-500">
                            Просматривай оформленные заказы и переходи к деталям
                          </p>

                          <div className="mt-5 inline-flex items-center text-sm font-semibold text-[#005bff] transition duration-200 group-hover:translate-x-1">
                            Открыть раздел →
                          </div>
                        </Link>

                        <Link
                          to="/profile/reviews"
                          className="group rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#e6eef9] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#005bff] to-[#ff4db8] text-2xl text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)]">
                              ★
                            </div>

                            <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#005bff]">
                              Отзывов: {reviewsCount}
                            </span>
                          </div>

                          <h3 className="mt-5 text-2xl font-bold text-neutral-900">
                            Мои отзывы
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-neutral-500">
                            Смотри свои опубликованные отзывы на купленные товары
                          </p>

                          <div className="mt-5 inline-flex items-center text-sm font-semibold text-[#005bff] transition duration-200 group-hover:translate-x-1">
                            Перейти к отзывам →
                          </div>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {user?.role === 'ADMIN' && <AdminPanel activeTab={activeAdminTab} />}
          </section>
        </div>
      </div>
    </div>
  )
}