import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../shared/api'
import { useFavoritesStore } from '../store/favoritesStore'

type Product = {
  id: string
  title: string
  slug: string
  price: number
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

  if (loading) {
    return <div>Загрузка товаров...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Товары</h1>
        <p className="mt-2 text-slate-600">
          Поиск, фильтрация и сортировка товаров
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Поиск
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск по товарам или брендам..."
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Категория
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-black"
          >
            <option value="all">Все категории</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Бренд
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-black"
          >
            <option value="all">Все бренды</option>
            {brands.map((brand) => (
              <option key={brand.name} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Сортировка
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-black"
          >
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
          </select>
        </div>
      </div>

      <div className="mb-6 text-sm text-slate-500">
        Найдено товаров: <span className="font-semibold">{filteredProducts.length}</span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Ничего не найдено</h2>
          <p className="mt-2 text-slate-500">
            Попробуй изменить фильтры, сортировку или поисковый запрос
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const isFavorite = favoriteItems.some((item) => item.id === product.id)

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <button
                  onClick={() =>
                    toggleFavorite({
                      id: product.id,
                      title: product.title,
                      slug: product.slug,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      brandName: product.brand.name,
                    })
                  }
                  className="absolute right-3 top-3 z-10 cursor-pointer rounded-full bg-white px-3 py-2 text-lg shadow"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>

                <Link to={`/products/${product.slug}`} className="block cursor-pointer">
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x400'}
                    alt={product.title}
                    className="h-40 w-full rounded-xl object-cover"
                  />

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">{product.brand.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {product.category.name}
                    </span>
                  </div>

                  <h2 className="mt-2 font-semibold">{product.title}</h2>

                  <p className="mt-2 text-lg font-bold">{product.price} ₽</p>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}