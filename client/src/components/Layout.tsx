import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const navigate = useNavigate()

  const cartItems = useCartStore((state) => state.items)
  const favoriteItems = useFavoritesStore((state) => state.items)

  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)

  const [search, setSearch] = useState('')

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const isAuthenticated = Boolean(user && token)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const favoritesCount = favoriteItems.length

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()

    const value = search.trim()

    if (!value) {
      navigate('/products')
      return
    }

    navigate(`/products?search=${encodeURIComponent(value)}`)
  }

 const clearCart = useCartStore((state) => state.clearCart)
const clearFavorites = useFavoritesStore((state) => state.clearFavorites)

const handleLogout = () => {
  clearCart()
  clearFavorites()
  logout()
  navigate('/')
}

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative rounded-xl px-3 py-2 text-sm font-semibold transition duration-200',
      'hover:bg-[#eef5ff] hover:text-[#005bff]',
      'focus:outline-none focus:ring-4 focus:ring-[#005bff]/10',
      isActive ? 'bg-[#eef5ff] text-[#005bff]' : 'text-neutral-900',
    ].join(' ')

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005bff] via-[#2f7bff] to-[#ff4db8] shadow-[0_10px_30px_rgba(0,91,255,0.20)] transition duration-200 group-hover:scale-105">
              <span className="text-lg font-black text-white">B</span>
              <div className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff4db8]" />
            </div>

            <div className="hidden leading-none sm:block">
              <div className="text-[28px] font-black tracking-[-0.04em]">
                <span className="text-[#005bff]">Brand</span>
                <span className="bg-gradient-to-r from-[#005bff] via-[#4a86ff] to-[#ff4db8] bg-clip-text text-transparent">
                  Mart
                </span>
              </div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                official marketplace
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/brands" className={navLinkClass}>
              Бренды
            </NavLink>

            <NavLink to="/products" className={navLinkClass}>
              Товары
            </NavLink>

            <NavLink to="/favorites" className={navLinkClass}>
              <span className="flex items-center gap-2">
                Избранное
                {favoritesCount > 0 && (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black px-2 text-xs font-bold text-white">
                    {favoritesCount}
                  </span>
                )}
              </span>
            </NavLink>

            <NavLink to="/cart" className={navLinkClass}>
              <span className="flex items-center gap-2">
                Корзина
                {cartCount > 0 && (
                  <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#005bff] px-2 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>
          </nav>

          <form
            onSubmit={handleSearch}
            className="ml-auto flex w-full max-w-[700px] items-center gap-3"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск товаров или брендов..."
              className="h-14 w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-5 text-base outline-none transition focus:border-[#9dc0ff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
            />

            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#005bff] to-[#ff4db8] px-7 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98]"
            >
              Найти
            </button>

            <div className="hidden items-center gap-3 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-6 font-semibold transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
                  >
                    Аккаунт
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#111111] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-6 font-semibold transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
                  >
                    Войти
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#111111] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>

        <div className="border-t border-black/5 bg-white/70 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3">
            <NavLink to="/brands" className={navLinkClass}>
              Бренды
            </NavLink>

            <NavLink to="/products" className={navLinkClass}>
              Товары
            </NavLink>

            <NavLink to="/favorites" className={navLinkClass}>
              Избранное
            </NavLink>

            <NavLink to="/cart" className={navLinkClass}>
              Корзина
            </NavLink>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                >
                  Аккаунт
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                >
                  Войти
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}