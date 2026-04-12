import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../shared/api'
import { useCartStore } from '../store/cartStore'
import { useFavoritesStore } from '../store/favoritesStore'
import CatalogFilters from '../components/CatalogFilters'
import ProductCatalogCard from '../components/ProductCatalogCard'

type Product = {
  id: string
  title: string
  slug: string
  price: number
  imageUrl?: string | null
  stock?: number
  category?: {
    name: string
    slug: string
  }
}

type Brand = {
  id: string
  name: string
  description?: string | null
  products?: Product[]
}

type SortOption = 'default' | 'price-asc' | 'price-desc'

export default function BrandPage() {
  const { slug } = useParams()

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('default')

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

  const products = brand?.products || []

  const categories = useMemo(() => {
    return Array.from(
      new Map(
        products
          .filter((product) => product.category?.slug)
          .map((product) => [product.category!.slug, product.category!])
      ).values()
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = products.filter((product) => {
      const matchesSearch =
        !query || product.title.toLowerCase().includes(query)

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category?.slug === selectedCategory

      return matchesSearch && matchesCategory
    })

    if (sortBy === 'price-asc') {
      return [...result].sort((a, b) => a.price - b.price)
    }

    if (sortBy === 'price-desc') {
      return [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [products, search, selectedCategory, sortBy])

  const resetFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSortBy('default')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-56 rounded-[32px] bg-white" />
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="h-[520px] rounded-[28px] bg-white" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="h-80 rounded-[28px] bg-white" />
                <div className="h-80 rounded-[28px] bg-white" />
                <div className="h-80 rounded-[28px] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="rounded-[30px] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <h1 className="text-3xl font-bold text-neutral-900">Бренд не найден</h1>
          </div>
        </div>
      </div>
    )
  }

  const categoryOptions = [
    { label: 'Все категории', value: 'all' },
    ...categories.map((category) => ({
      label: category.name,
      value: category.slug,
    })),
  ]

  const sortOptions = [
    { label: 'По умолчанию', value: 'default' },
    { label: 'Цена: по возрастанию', value: 'price-asc' },
    { label: 'Цена: по убыванию', value: 'price-desc' },
  ]

  const isFiltering =
    search.trim() !== '' || selectedCategory !== 'all' || sortBy !== 'default'

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      {showCartToast && (
        <div className="fixed right-6 top-24 z-50 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-medium text-white shadow-lg">
          Товар добавлен в корзину
        </div>
      )}

      {showFavoriteToast && (
        <div className="fixed right-6 top-40 z-50 rounded-2xl bg-[#111111] px-5 py-3 text-sm font-medium text-white shadow-lg">
          Избранное обновлено
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#005bff_0%,#2e7cff_58%,#ff4db8_140%)] text-white shadow-[0_20px_60px_rgba(0,91,255,0.24)]">
          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff4db8]" />
                Официальная витрина бренда
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
                {brand.name}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
                {brand.description || 'Официальный бренд на платформе'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#005bff] shadow-sm">
                  Official Brand
                </div>

                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  Товаров: {products.length}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[26px] border border-white/18 bg-white/14 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.08)] backdrop-blur-md">
                <div className="text-sm text-white/75">Товаров в бренде</div>
                <div className="mt-3 text-3xl font-bold">{products.length}</div>
                <div className="mt-2 text-sm text-white/80">
                  официальный ассортимент
                </div>
              </div>

              <div className="rounded-[26px] border border-white/18 bg-white/10 p-5 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)] backdrop-blur-md">
                <div className="text-sm text-white/75">Каталог бренда</div>
                <div className="mt-3 text-3xl font-bold">
                  {isFiltering ? filteredProducts.length : products.length}
                </div>
                <div className="mt-2 text-sm text-white/80">
                  {isFiltering
                    ? 'позиций после выбора фильтров'
                    : 'все товары бренда'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <CatalogFilters
            title="Фильтры"
            subtitle="Уточни список товаров"
            searchLabel="Поиск"
            searchPlaceholder="Поиск товаров бренда..."
            searchValue={search}
            onSearchChange={setSearch}
            categoryValue={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categoryOptions={categoryOptions}
            sortValue={sortBy}
            onSortChange={(value) => setSortBy(value as SortOption)}
            sortOptions={sortOptions}
            resultsCount={filteredProducts.length}
            onReset={resetFilters}
          />

          <div className="min-w-0">
            <section className="rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Товары бренда
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Выбери товар и перейди в карточку
                  </p>
                </div>

                <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
                  Показано: {filteredProducts.length}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="mt-8 rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-10 text-center">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    Ничего не найдено
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    Попробуй изменить фильтры или поисковый запрос
                  </p>
                </div>
              ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const isFavorite = favoriteItems.some((item) => item.id === product.id)

                    return (
                      <ProductCatalogCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        slug={product.slug}
                        price={product.price}
                        stock={product.stock ?? 0}
                        imageUrl={product.imageUrl}
                        brandName={brand.name}
                        categoryName={product.category?.name}
                        isFavorite={isFavorite}
                        onToggleFavorite={() => {
                          toggleFavorite({
                            id: product.id,
                            title: product.title,
                            slug: product.slug,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            brandName: brand.name,
                          })

                          setShowFavoriteToast(true)
                          setTimeout(() => setShowFavoriteToast(false), 1500)
                        }}
                        onAddToCart={() => {
                          addToCart({
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            imageUrl: product.imageUrl,
                          })

                          setShowCartToast(true)
                          setTimeout(() => setShowCartToast(false), 2000)
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}