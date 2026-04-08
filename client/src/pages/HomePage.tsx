import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../shared/api'

type Brand = {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  isVerified?: boolean
}

type Product = {
  id: string
  title: string
  slug: string
  price: number
  imageUrl?: string | null
  createdAt?: string
  brand: {
    name: string
    slug: string
  }
  category: {
    name: string
    slug: string
  }
}

export default function HomePage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/brands'), api.get('/products')])
      .then(([brandsRes, productsRes]) => {
        setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : [])
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
      })
      .catch((error) => {
        console.error('Ошибка загрузки главной страницы:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const featuredBrands = useMemo(() => {
    const verified = brands.filter((brand) => brand.isVerified)
    return (verified.length ? verified : brands).slice(0, 8)
  }, [brands])

  const newestProducts = useMemo(() => {
    return [...products].slice(0, 10)
  }, [products])

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>()

    for (const product of products) {
      const key = product.category.slug

      if (!map.has(key)) {
        map.set(key, {
          slug: product.category.slug,
          name: product.category.name,
          count: 1,
        })
      } else {
        const current = map.get(key)!
        map.set(key, {
          ...current,
          count: current.count + 1,
        })
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [products])

  if (loading) {
    return (
      <div className="bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-full rounded-2xl bg-white" />
            <div className="h-[260px] rounded-[28px] bg-white" />
            <div className="grid gap-4 md:grid-cols-4">
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div className="h-72 rounded-3xl bg-white" />
              <div className="h-72 rounded-3xl bg-white" />
              <div className="h-72 rounded-3xl bg-white" />
              <div className="h-72 rounded-3xl bg-white" />
              <div className="h-72 rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10 text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#005bff_0%,#2e7cff_58%,#ff4db8_140%)] text-white shadow-[0_20px_60px_rgba(0,91,255,0.24)]">
          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
             <div className="inline-flex rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff4db8]" />
  Новые бренды · Свежие товары · Удобный каталог
</div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                Всё для покупок в одном стильном каталоге
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
                Бренды, категории и новые поступления — быстро, удобно и без
                лишнего. Открой подборки, переходи к витринам брендов и находи
                нужные товары за пару кликов.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#005bff] transition hover:scale-[1.02]"
                >
                  Перейти к товарам
                </Link>

                <Link
                  to="/brands"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Смотреть бренды
                </Link>
              </div>
            </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[26px] border border-white/18 bg-white/14 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.08)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/75">Брендов на платформе</div>
                    <div className="mt-2 text-4xl font-extrabold">{brands.length}</div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18">
                    <span className="text-lg">✨</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/18 bg-white/10 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/75">Товаров в каталоге</div>
                    <div className="mt-2 text-4xl font-extrabold">{products.length}</div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffffff22] to-[#ff4db833]">
                    <span className="text-lg">🛍️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

    <section className="mt-6 rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
  <div className="mb-4 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">Популярные категории</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Быстрый переход к основным направлениям каталога
      </p>
    </div>

    <Link
      to="/products"
      className="text-sm font-semibold text-[#005bff] transition duration-200 hover:text-[#004fe0] hover:underline focus:outline-none"
    >
      Все товары
    </Link>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {categories.map((category) => (
      <Link
        key={category.slug}
        to={`/products?category=${category.slug}`}
        className="group rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#cfe0ff] hover:bg-white hover:shadow-[0_12px_30px_rgba(0,91,255,0.10)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#005bff]/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#005bff] text-lg font-bold text-white shadow-[0_10px_20px_rgba(0,91,255,0.18)] transition duration-200 group-hover:scale-105">
            {category.name.charAt(0).toUpperCase()}
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#005bff] shadow-sm">
            {category.count}
          </span>
        </div>

        <div className="mt-5 text-sm text-neutral-500">Категория</div>

        <h3 className="mt-2 text-2xl font-bold text-neutral-900">
          {category.name}
        </h3>

        <p className="mt-3 text-sm text-neutral-500">
          {category.count} товаров в подборке
        </p>

        <div className="mt-5 inline-flex items-center text-sm font-semibold text-[#005bff] transition duration-200 group-hover:translate-x-1">
          Перейти →
        </div>
      </Link>
    ))}
  </div>
</section>

<section className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Товары</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Последние добавленные позиции
              </p>
            </div>

            <Link
              to="/products?sort=newest"
              className="text-sm font-medium text-[#005bff] hover:underline"
            >
              Весь каталог
            </Link>
          </div>

          {newestProducts.length === 0 ? (
            <div className="rounded-[28px] bg-white px-6 py-12 text-center text-neutral-500 shadow-sm">
              Пока нет товаров для отображения
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {newestProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/4.4] overflow-hidden bg-[#f4f7fb]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl font-bold text-[#b7c9eb]">
                        {product.brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#005bff] shadow-sm">
                      {product.category.name}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="text-sm text-neutral-500">{product.brand.name}</div>

                    <h3 className="mt-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6">
                      {product.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xl font-bold">{product.price} ₽</span>
                      <span className="text-sm font-medium text-[#005bff]">
                        Подробнее
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
  <div className="mb-4 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">Бренды</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Быстрый переход к витринам брендов
      </p>
    </div>

    <Link
      to="/brands"
      className="text-sm font-semibold text-[#005bff] transition duration-200 hover:text-[#004fe0] hover:underline focus:outline-none"
    >
      Смотреть все
    </Link>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {featuredBrands.map((brand) => (
      <Link
        key={brand.id}
        to={`/brands/${brand.slug}`}
        className="group rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#005bff]/10"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#005bff] to-[#2f7bff] text-2xl font-bold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 group-hover:scale-105">
            {brand.name.charAt(0).toUpperCase()}
          </div>

          {brand.isVerified && (
            <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#005bff]">
              Official
            </span>
          )}
        </div>

        <h3 className="mt-6 text-2xl font-bold text-neutral-900">
          {brand.name}
        </h3>

        <p className="mt-3 min-h-[72px] text-sm leading-7 text-neutral-500">
          {brand.description || 'Официальная витрина бренда с подборкой товаров.'}
        </p>

        <div className="mt-6 inline-flex items-center text-sm font-semibold text-[#005bff] transition duration-200 group-hover:translate-x-1">
          Открыть бренд →
        </div>
      </Link>
    ))}
  </div>
</section>

        <section className="mt-6 overflow-hidden rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
  <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
    <div>
      <div className="inline-flex rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#005bff]">
        Специальная подборка
      </div>

      <h2 className="mt-5 text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
        Новые поступления уже в каталоге
      </h2>

      <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-500">
        Открой новые товары, переходи к подробной карточке и собирай
        собственную подборку по брендам и категориям.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          to="/products?sort=newest"
          className="inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#005bff]/20"
        >
          Смотреть новинки
        </Link>

        <Link
          to="/favorites"
          className="inline-flex items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-5 py-3 font-semibold text-[#005bff] transition duration-200 hover:-translate-y-0.5 hover:border-[#bfd2ff] hover:bg-[#f8fbff] active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#005bff]/15"
        >
          Избранное
        </Link>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-[24px] border border-[#e6eef9] bg-[#f8fbff] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
        <div className="text-sm text-neutral-500">Свежие позиции</div>
        <div className="mt-2 text-4xl font-extrabold text-neutral-900">
          {newestProducts.length}
        </div>
      </div>

      <Link
        to="/products"
        className="group rounded-[24px] bg-gradient-to-r from-[#005bff] to-[#2f7bff] p-5 text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(0,91,255,0.24)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#005bff]/20"
      >
        <div className="text-sm text-white/75">Быстрый доступ</div>
        <div className="mt-2 text-4xl font-extrabold">Каталог</div>
        <div className="mt-4 inline-flex items-center text-sm font-semibold text-white transition duration-200 group-hover:translate-x-1">
          Перейти →
        </div>
      </Link>

    </div>
  </div>
</section>

        
      </div>
    </div>
  )
}