import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../shared/api'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'

type Product = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  imageUrl?: string | null
  brand?: {
    name: string
  }
  category?: {
    name: string
  }
}

export default function ProductPage() {
  const { slug } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const favoriteItems = useFavoritesStore((state) => state.items)

  useEffect(() => {
    if (!slug) return

    api.get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data)
      })
      .catch((error) => {
        console.error('Ошибка загрузки товара:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return <div>Загрузка товара...</div>
  }

  if (!product) {
    return <div>Товар не найден</div>
  }

  const isFavorite = favoriteItems.some((item) => item.id === product.id)

  return (
    <div>
      {showToast && (
        <div className="fixed right-6 top-6 z-50 rounded-2xl bg-black px-5 py-3 text-sm text-white shadow-lg">
          Товар добавлен в корзину
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <img
            src={product.imageUrl || 'https://placehold.co/600x600'}
            alt={product.title}
            className="w-full rounded-2xl object-cover"
          />
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                {product.brand?.name || 'Бренд'}
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {product.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                toggleFavorite({
                  id: product.id,
                  title: product.title,
                  slug: product.slug,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  brandName: product.brand?.name,
                })
              }
              className="cursor-pointer rounded-full border px-4 py-2 text-xl"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {product.price} ₽
          </p>

          <p className="mt-4 text-slate-600">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {product.category?.name && (
              <span className="rounded-full border px-4 py-2 text-sm">
                {product.category.name}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl,
              })

              setShowToast(true)

              setTimeout(() => {
                setShowToast(false)
              }, 2000)
            }}
            className="mt-8 w-full cursor-pointer rounded-2xl bg-black py-3 text-white transition hover:opacity-90"
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  )
}