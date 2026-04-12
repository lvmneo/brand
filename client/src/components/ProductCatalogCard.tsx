import { Link } from 'react-router-dom'

type ProductCatalogCardProps = {
  id: string
  title: string
  slug: string
  price: number
  stock: number
  imageUrl?: string | null
  brandName: string
  categoryName?: string
  isFavorite: boolean
  onToggleFavorite: () => void
  onAddToCart: () => void
}

export default function ProductCatalogCard({
  title,
  slug,
  price,
  stock,
  imageUrl,
  brandName,
  categoryName,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCatalogCardProps) {
  const isOutOfStock = stock === 0

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-[#e6eef9] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleFavorite()
        }}
        className="absolute right-3 top-3 z-10 cursor-pointer rounded-full bg-white px-3 py-2 text-lg shadow"
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>

      <Link to={`/products/${slug}`} className="block cursor-pointer">
        <div className="aspect-[4/4.2] overflow-hidden bg-[#f4f7fb]">
          <img
            src={imageUrl || 'https://placehold.co/400x400'}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-neutral-500">{brandName}</p>

            {categoryName && (
              <span className="rounded-full bg-[#eef5ff] px-2.5 py-1 text-xs font-semibold text-[#005bff]">
                {categoryName}
              </span>
            )}
          </div>

          <h2 className="mt-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-neutral-900">
            {title}
          </h2>

          <p className="mt-3 text-xl font-bold text-neutral-900">{price} ₽</p>

          <p
            className={`mt-2 text-sm ${
              isOutOfStock ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {isOutOfStock ? 'Нет в наличии' : `В наличии: ${stock}`}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

            if (isOutOfStock) return
            onAddToCart()
          }}
          className={`w-full rounded-2xl py-3 text-sm font-semibold text-white transition ${
            isOutOfStock
              ? 'cursor-not-allowed bg-neutral-400'
              : 'cursor-pointer bg-[#005bff] hover:bg-[#0047cc]'
          }`}
        >
          {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
        </button>
      </div>
    </div>
  )
}