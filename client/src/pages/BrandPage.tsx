import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../shared/api'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'

type Product = {
  id: string
  title: string
  slug: string
  price: number
  imageUrl?: string | null
}

type Brand = {
  id: string
  name: string
  description?: string | null
  products?: Product[]
}

export default function BrandPage() {
  const { slug } = useParams()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCartToast, setShowCartToast] = useState(false)
  const [showFavoriteToast, setShowFavoriteToast] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const favoriteItems = useFavoritesStore((state) => state.items)

  useEffect(() => {
    if (!slug) return

    api.get(`/brands/${slug}`)
      .then((res) => {
        setBrand(res.data)
      })
      .catch((error) => {
        console.error('Ошибка загрузки бренда:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return <div>Загрузка бренда...</div>
  }

  if (!brand) {
    return <div>Бренд не найден</div>
  }

  return (
    <div>
      {showCartToast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-black px-5 py-3 text-sm text-white shadow-lg">
          Товар добавлен в корзину
        </div>
      )}

      {showFavoriteToast && (
        <div className="fixed right-6 top-20 z-50 rounded-2xl bg-black px-5 py-3 text-sm text-white shadow-lg">
          Избранное обновлено
        </div>
      )}

      <div className="mb-10 rounded-3xl bg-gradient-to-r from-black to-gray-800 p-8 text-white">
        <h1 className="text-4xl font-bold">{brand.name}</h1>

        <p className="mt-3 max-w-xl text-gray-300">
          {brand.description || 'Официальный бренд на платформе'}
        </p>

        <div className="mt-4 inline-block rounded-full bg-white px-4 py-1 text-sm font-semibold text-black">
          Official Brand
        </div>
      </div>

      <input
        type="text"
        placeholder="Поиск товаров..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-xl border px-4 py-2"
      />

      <h2 className="mb-4 text-2xl font-semibold">Товары бренда</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(brand.products || [])
          .filter((product) =>
            product.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((product) => {
            const isFavorite = favoriteItems.some((item) => item.id === product.id)

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    toggleFavorite({
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      brandName: brand.name,
                    })

                    setShowFavoriteToast(true)

                    setTimeout(() => {
                      setShowFavoriteToast(false)
                    }, 1500)
                  }}
                  className="absolute right-3 top-3 z-20 cursor-pointer rounded-full bg-white px-3 py-2 text-lg shadow"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>

                <Link
                  to={`/products/${product.slug}`}
                  className="block cursor-pointer"
                >
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x400'}
                    alt={product.title}
                    className="h-44 w-full rounded-xl object-cover"
                  />

                  <h3 className="mt-3 line-clamp-2 text-sm font-medium">
                    {product.title}
                  </h3>

                  <p className="mt-2 text-lg font-bold">
                    {product.price} ₽
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    addToCart({
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    })

                    setShowCartToast(true)

                    setTimeout(() => {
                      setShowCartToast(false)
                    }, 2000)
                  }}
                  className="mt-3 w-full cursor-pointer rounded-xl bg-black py-2 text-sm text-white opacity-0 transition group-hover:opacity-100"
                >
                  В корзину
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}