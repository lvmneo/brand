import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMe } from '../shared/api'

type User = {
  id: string
  name: string
  email: string
  createdAt?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await getMe()
      setUser(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-3xl font-bold">Аккаунт</h2>

        <nav className="flex flex-col gap-3">
          <Link
            to="/profile"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
          >
            Профиль
          </Link>

          <Link
            to="/profile/orders"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100"
          >
            Мои заказы
          </Link>
        </nav>
      </aside>

      <section className="rounded-3xl border bg-white p-7 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-5xl font-bold">Профиль</h1>
        </div>

        {isLoading ? (
          <div className="text-slate-500">Загрузка профиля...</div>
        ) : !user ? (
          <div className="text-slate-500">Не удалось загрузить данные аккаунта</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border p-5">
              <div className="text-sm text-slate-500">Имя</div>
              <div className="mt-2 text-2xl font-semibold">{user.name}</div>
            </div>

            <div className="rounded-3xl border p-5">
              <div className="text-sm text-slate-500">Email</div>
              <div className="mt-2 text-2xl font-semibold break-all">
                {user.email}
              </div>
            </div>

            <div className="rounded-3xl border p-5 md:col-span-2">
              <div className="text-sm text-slate-500">Дата регистрации</div>
              <div className="mt-2 text-2xl font-semibold">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                  : '—'}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}