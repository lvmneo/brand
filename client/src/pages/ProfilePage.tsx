import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '../shared/api'
import { useAuthStore } from '../store/authStore'
import AdminPanel from '../pages/AdminPanel'

type User = {
  id: string
  name: string
  email: string
  role?: 'USER' | 'ADMIN'
  createdAt?: string
}

type AdminTab = 'dashboard' | 'products' | 'brands' | 'orders'

export default function ProfilePage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard')

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [authUser, token, navigate])

  const loadProfile = async () => {
    try {
      const res = await getMe()
      setUser(res.data)
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
        ? 'bg-[#eef5ff] text-[#005bff]'
        : 'text-neutral-900 hover:bg-[#f4f8ff]',
    ].join(' ')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
          <h2 className="text-2xl font-bold text-neutral-900">Аккаунт</h2>

          <div className="mt-6 space-y-3">
  {user?.role === 'ADMIN' ? (
    <div className="pt-1">
      <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        Админка
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
        className="block rounded-2xl bg-black px-4 py-3 font-semibold text-white"
      >
        Профиль
      </Link>

      <Link
        to="/profile/orders"
        className="block rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
      >
        Мои заказы
      </Link>
    </>
  )}
</div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
            <h1 className="text-5xl font-bold text-neutral-900">Профиль</h1>

            {isLoading ? (
              <div className="mt-8 text-neutral-500">Загрузка профиля...</div>
            ) : !user ? (
              <div className="mt-8 text-neutral-500">
                Не удалось загрузить данные аккаунта
              </div>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Имя</div>
                  <div className="mt-2 text-xl font-semibold">{user.name}</div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Email</div>
                  <div className="mt-2 text-xl font-semibold">{user.email}</div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Роль</div>
                  <div className="mt-2 text-xl font-semibold">
                    {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">
                    Дата регистрации
                  </div>
                  <div className="mt-2 text-xl font-semibold">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                      : '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {user?.role === 'ADMIN' && <AdminPanel activeTab={activeAdminTab} />}
        </section>
      </div>
    </div>
  )
}