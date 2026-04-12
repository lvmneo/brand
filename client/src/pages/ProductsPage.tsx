import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../shared/api'
import { useFavoritesStore } from '../store/favoritesStore'
import { useCartStore } from '../store/cartStore'
import CatalogFilters from '../components/CatalogFilters'
import ProductCatalogCard from '../components/ProductCatalogCard'

type Product = {
  id: string
  title: string
  slug: string
  price: number
  stock: number
  imageUrl?: string | null
  brand: {
    name: string
  }
  category: {
    name: string
    slug: string
  }
}

type SortOption = 'default' | 'price-asc' | 'price-desc'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const favoriteItems = useFavoritesStore((state) => state.items)
  const addToCart = useCartStore((state) => state.addToCart)

  const searchFromUrl = searchParams.get('search') || ''
  const categoryFromUrl = searchParams.get('category') || 'all'
  const brandFromUrl = searchParams.get('brand') || 'all'
  const sortFromUrl = (searchParams.get('sort') as SortOption) || 'default'

  const [search, setSearch] = useState(searchFromUrl)
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [selectedBrand, setSelectedBrand] = useState(brandFromUrl)
  const [sortBy, setSortBy] = useState<SortOption>(sortFromUrl)

  useEffect(() => {
    setSearch(searchFromUrl)
    setSelectedCategory(categoryFromUrl)
    setSelectedBrand(brandFromUrl)
    setSortBy(sortFromUrl)
  }, [searchFromUrl, categoryFromUrl, brandFromUrl, sortFromUrl])

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        setProducts(res.data)
      })
      .catch((error) => {
        console.error('Ошибка загрузки товаров:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const categories = useMemo(() => {
    return Array.from(
      new Map(products.map((product) => [product.category.slug, product.category])).values()
    )
  }, [products])

  const brands = useMemo(() => {
    const productsByCategory =
      selectedCategory === 'all'
        ? products
        : products.filter((product) => product.category.slug === selectedCategory)

    return Array.from(
      new Map(productsByCategory.map((product) => [product.brand.name, product.brand])).values()
    )
  }, [products, selectedCategory])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.brand.name.toLowerCase().includes(query)

      const matchesCategory =
        selectedCategory === 'all' || product.category.slug === selectedCategory

      const matchesBrand =
        selectedBrand === 'all' || product.brand.name === selectedBrand

      return matchesSearch && matchesCategory && matchesBrand
    })

    if (sortBy === 'price-asc') {
      return [...result].sort((a, b) => a.price - b.price)
    }

    if (sortBy === 'price-desc') {
      return [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [products, search, selectedCategory, selectedBrand, sortBy])

  const updateSearchParams = (
    nextSearch: string,
    nextCategory: string,
    nextBrand: string,
    nextSort: SortOption
  ) => {
    const params = new URLSearchParams()

    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    if (nextCategory !== 'all') params.set('category', nextCategory)
    if (nextBrand !== 'all') params.set('brand', nextBrand)
    if (nextSort !== 'default') params.set('sort', nextSort)

    setSearchParams(params)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateSearchParams(value, selectedCategory, selectedBrand, sortBy)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedBrand('all')
    updateSearchParams(search, value, 'all', sortBy)
  }

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)
    updateSearchParams(search, selectedCategory, value, sortBy)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    updateSearchParams(search, selectedCategory, selectedBrand, value)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedBrand('all')
    setSortBy('default')
    setSearchParams(new URLSearchParams())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-28 rounded-[28px] bg-white" />
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

  const categoryOptions = [
    { label: 'Все категории', value: 'all' },
    ...categories.map((category) => ({
      label: category.name,
      value: category.slug,
    })),
  ]

  const brandOptions = [
    { label: 'Все бренды', value: 'all' },
    ...brands.map((brand) => ({
      label: brand.name,
      value: brand.name,
    })),
  ]

  const sortOptions = [
    { label: 'По умолчанию', value: 'default' },
    { label: 'Цена: по возрастанию', value: 'price-asc' },
    { label: 'Цена: по убыванию', value: 'price-desc' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                Товары
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Каталог всех товаров с поиском, фильтрацией и сортировкой
              </p>
            </div>

            <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
              Найдено: {filteredProducts.length}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <CatalogFilters
            title="Фильтры"
            subtitle="Подбери нужные товары"
            searchLabel="Поиск"
            searchPlaceholder="Поиск по товарам или брендам..."
            searchValue={search}
            onSearchChange={handleSearchChange}
            categoryValue={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categoryOptions={categoryOptions}
            brandValue={selectedBrand}
            onBrandChange={handleBrandChange}
            brandOptions={brandOptions}
            sortValue={sortBy}
            onSortChange={(value) => handleSortChange(value as SortOption)}
            sortOptions={sortOptions}
            resultsCount={filteredProducts.length}
            onReset={handleResetFilters}
          />

          <div className="min-w-0">
            <section className="rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-6">
              {filteredProducts.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-10 text-center">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Ничего не найдено
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Попробуй изменить фильтры, сортировку или поисковый запрос
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const isFavorite = favoriteItems.some((item) => item.id === product.id)

                    return (
                      <ProductCatalogCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        slug={product.slug}
                        price={product.price}
                        stock={product.stock}
                        imageUrl={product.imageUrl}
                        brandName={product.brand.name}
                        categoryName={product.category.name}
                        isFavorite={isFavorite}
                        onToggleFavorite={() =>
                          toggleFavorite({
                            id: product.id,
                            title: product.title,
                            slug: product.slug,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            brandName: product.brand.name,
                          })
                        }
                        onAddToCart={() =>
                          addToCart({
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            imageUrl: product.imageUrl,
                          })
                        }
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