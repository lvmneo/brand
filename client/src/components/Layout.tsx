import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [search, setSearch] = useState('')
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const cartItems = useCartStore((state) => state.items)
  const favoriteItems = useFavoritesStore((state) => state.items)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalFavorites = favoriteItems.length

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    setIsAccountMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const query = search.trim()

    if (!query) {
      navigate('/products')
      return
    }

    navigate(`/products?search=${encodeURIComponent(query)}`)
  }

  const handleLogout = () => {
    logout()
    setIsAccountMenuOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6">
            <Link to="/" className="text-2xl font-bold">
              BrandMart
            </Link>

            <nav className="hidden gap-6 text-sm font-medium lg:flex">
              <Link to="/brands">Бренды</Link>
              <Link to="/products">Товары</Link>

              <Link to="/favorites" className="flex items-center">
                Избранное
                {totalFavorites > 0 && (
                  <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                    {totalFavorites}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="flex items-center">
                Корзина
                {totalCartItems > 0 && (
                  <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full gap-3 lg:max-w-xl"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск товаров или брендов..."
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="cursor-pointer rounded-2xl bg-black px-5 py-3 text-white transition hover:opacity-90"
            >
              Найти
            </button>
          </form>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  className="cursor-pointer rounded-2xl border px-4 py-2 text-sm transition hover:bg-slate-100"
                >
                  Аккаунт
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-14 z-20 min-w-[220px] rounded-2xl border bg-white p-2 shadow-lg">
                    <div className="border-b px-3 py-2">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>

                    <div className="mt-2 flex flex-col">
                      <Link
                        to="/profile"
                        className="rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100"
                      >
                        Профиль
                      </Link>

                      <Link
                       to="/profile/orders"
                       className="rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100"
                       >
                       Мои заказы
                     </Link>
                      <button
                        onClick={handleLogout}
                        className="cursor-pointer rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                      >
                        Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border px-4 py-2 text-sm transition hover:bg-slate-100"
                >
                  Войти
                </Link>

                <Link
                  to="/register"
                  className="rounded-2xl bg-black px-4 py-2 text-sm text-white transition hover:opacity-90"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <nav className="flex gap-6 text-sm font-medium lg:hidden">
            <Link to="/brands">Бренды</Link>
            <Link to="/products">Товары</Link>

            <Link to="/favorites" className="flex items-center">
              Избранное
              {totalFavorites > 0 && (
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                  {totalFavorites}
                </span>
              )}
            </Link>

            <Link to="/cart" className="flex items-center">
              Корзина
              {totalCartItems > 0 && (
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {user && <Link to="/profile">Профиль</Link>}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}