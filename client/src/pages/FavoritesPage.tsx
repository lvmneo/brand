import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../store/favoritesStore'

export default function FavoritesPage() {
  const items = useFavoritesStore((state) => state.items)
  const removeFromFavorites = useFavoritesStore(
    (state) => state.removeFromFavorites
  )
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  Избранное
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                  Здесь хранятся товары, которые ты добавил в список желаемого
                </p>
              </div>

              <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
                0 товаров
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#005bff] to-[#ff4db8] text-2xl text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)]">
                ♡
              </div>

              <h2 className="mt-5 text-2xl font-bold text-neutral-900">
                Пока нет избранных товаров
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Открой каталог, выбери понравившиеся позиции и добавь их в
                избранное
              </p>

              <Link
                to="/products"
                className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#005bff] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98]"
              >
                Перейти к товарам
              </Link>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                Избранное
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Сохраняй товары, чтобы быстро вернуться к ним позже
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
                Товаров: {items.length}
              </div>

              <button
                onClick={clearFavorites}
                className="cursor-pointer rounded-2xl border border-[#d7e3f8] bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition duration-200 hover:bg-[#f8fbff]"
              >
                Очистить избранное
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[28px] border border-[#e6eef9] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]"
              >
                <Link to={`/products/${item.slug}`} className="block cursor-pointer">
                  <div className="relative aspect-[4/4.2] overflow-hidden bg-[#f4f7fb]">
                    <img
                      src={item.imageUrl || 'https://placehold.co/400x400'}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    {item.brandName && (
                      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#005bff] shadow-sm">
                        {item.brandName}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {item.brandName && (
                      <p className="text-sm text-neutral-500">{item.brandName}</p>
                    )}

                    <h2 className="mt-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-neutral-900">
                      {item.title}
                    </h2>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xl font-bold text-neutral-900">
                        {item.price} ₽
                      </span>
                      <span className="text-sm font-semibold text-[#005bff]">
                        Подробнее
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => removeFromFavorites(item.id)}
                    className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-[#f8fbff] py-3 text-sm font-semibold text-neutral-900 transition duration-200 hover:bg-[#eef5ff]"
                  >
                    Убрать из избранного
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}