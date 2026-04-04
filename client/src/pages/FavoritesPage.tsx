import { Link } from 'react-router-dom'
import { useFavoritesStore } from '../store/favoritesStore'

export default function FavoritesPage() {
  const items = useFavoritesStore((state) => state.items)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Избранное</h1>
        <p className="mt-4 text-slate-600">Пока нет избранных товаров</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Избранное</h1>

        <button
          onClick={clearFavorites}
          className="cursor-pointer rounded-xl border px-4 py-2 text-sm"
        >
          Очистить избранное
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <Link to={`/products/${item.slug}`} className="block">
              <img
                src={item.imageUrl || 'https://placehold.co/400x400'}
                alt={item.title}
                className="h-40 w-full rounded-xl object-cover"
              />

              {item.brandName && (
                <p className="mt-2 text-sm text-slate-500">
                  {item.brandName}
                </p>
              )}

              <h2 className="mt-1 font-semibold">{item.title}</h2>
              <p className="mt-2 text-lg font-bold">{item.price} ₽</p>
            </Link>

            <button
              onClick={() => removeFavorite(item.id)}
              className="mt-3 w-full cursor-pointer rounded-xl border py-2 text-sm"
            >
              Убрать из избранного
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}