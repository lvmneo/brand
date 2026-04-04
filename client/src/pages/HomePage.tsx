import { Link } from 'react-router-dom'

const featuredBrands = [
  { name: 'Nike', slug: 'nike' },
  { name: 'Adidas', slug: 'adidas' },
  { name: 'Apple', slug: 'apple' },
  { name: 'Samsung', slug: 'samsung' },
]

const categories = [
  {
    title: 'Одежда',
    slug: 'clothes',
    description: 'Спортивные и fashion-бренды',
  },
  {
    title: 'Электроника',
    slug: 'electronics',
    description: 'Смартфоны, ноутбуки, техника',
  },
  {
    title: 'Косметика',
    slug: 'cosmetics',
    description: 'Уход, макияж, skincare',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-black to-slate-800 px-8 py-12 text-white">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Brand Marketplace
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            Маркетплейс официальных брендов
          </h1>

          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Платформа, где собраны только официальные бренды одежды,
            электроники и косметики. Удобный поиск, брендовые витрины и
            современный пользовательский интерфейс.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/brands"
              className="inline-flex min-w-[200px] items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-black transition hover:opacity-90"
            >
              Смотреть бренды
            </Link>

            <Link
              to="/products"
              className="inline-flex min-w-[200px] items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Перейти к товарам
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярные бренды</h2>

          <Link
            to="/brands"
            className="text-sm text-slate-500 underline"
          >
            Все бренды
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBrands.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brands/${brand.slug}`}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold">
                {brand.name.charAt(0)}
              </div>

              <h3 className="mt-4 text-lg font-semibold">{brand.name}</h3>

              <p className="mt-2 text-sm text-slate-500">
                Официальная витрина бренда
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-black underline">
                Перейти
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Категории</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="group cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold">{category.title}</h3>

              <p className="mt-2 text-sm text-slate-500">
                {category.description}
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-black underline">
                Смотреть товары
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Почему этот маркетплейс?</h2>

          <ul className="mt-5 space-y-3 text-slate-600">
            <li>— Только официальные бренды</li>
            <li>— Удобные брендовые витрины</li>
            <li>— Современный интерфейс</li>
            <li>— Каталог товаров с переходом в корзину</li>
          </ul>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Для дипломного проекта</h2>

          <p className="mt-4 text-slate-600">
            Проект демонстрирует frontend-разработку на React + TypeScript,
            интеграцию с backend на Express, работу с базой данных через
            Prisma и реализацию логики маркетплейса с бренд-ориентированной
            архитектурой.
          </p>
        </div>
      </section>
    </div>
  )
}