import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

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
              <>
                <Link
                  to="/profile"
                  className="hidden rounded-2xl border px-4 py-2 text-sm transition hover:bg-slate-100 lg:block"
                >
                  {user.name}
                </Link>

                <button
                  onClick={handleLogout}
                  className="cursor-pointer rounded-2xl border px-4 py-2 text-sm transition hover:bg-slate-100"
                >
                  Выйти
                </button>
              </>
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