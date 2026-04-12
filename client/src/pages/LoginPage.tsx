import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../shared/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setError('')

      const res = await api.post('/auth/login', {
        email,
        password,
      })

      setAuth(res.data.token, res.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#005bff_0%,#2e7cff_58%,#ff4db8_140%)] text-white shadow-[0_20px_60px_rgba(0,91,255,0.24)]">
            <div className="h-full px-6 py-8 md:px-10 md:py-10">
              <div className="inline-flex rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff4db8]" />
                Добро пожаловать обратно
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
                Вход в аккаунт BrandMart
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
                Войди, чтобы управлять заказами, смотреть историю покупок,
                оставлять отзывы и пользоваться всеми возможностями маркетплейса.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/18 bg-white/14 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="text-sm text-white/75">Личный кабинет</div>
                  <div className="mt-2 text-2xl font-bold">Заказы и отзывы</div>
                </div>

                <div className="rounded-[26px] border border-white/18 bg-white/10 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)] backdrop-blur-md">
                  <div className="text-sm text-white/75">Быстрый доступ</div>
                  <div className="mt-2 text-2xl font-bold">Избранное и корзина</div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Вход</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Используй email и пароль для входа в аккаунт
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Введите email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer rounded-2xl bg-[#005bff] py-3.5 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:bg-[#0047cc] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.99]"
              >
                Войти
              </button>
            </form>

            <div className="mt-6 rounded-[24px] bg-[#f8fbff] p-5">
              <div className="text-sm text-neutral-500">Нет аккаунта?</div>
              <p className="mt-2 text-sm leading-7 text-neutral-600">
                Зарегистрируйся, чтобы сохранять товары, оформлять заказы и
                оставлять отзывы после покупки.
              </p>

              <Link
                to="/register"
                className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[#d7e3f8] bg-white px-5 py-3 font-semibold text-[#005bff] transition hover:bg-[#eef5ff]"
              >
                Перейти к регистрации
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}