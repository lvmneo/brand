import { useEffect, useState } from 'react'
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminProducts,
  getAdminBrands,
  getAdminCategories,
  createAdminProduct,
} from '../shared/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'


const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

type Brand = {
  id: string
  name: string
}

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  title: string
  slug: string
  price: number
  stock: number
  imageUrl?: string | null
  brand: { name: string }
  category: { name: string }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
const [brands, setBrands] = useState<Brand[]>([])
const [categories, setCategories] = useState<Category[]>([])

const [title, setTitle] = useState('')
const [slug, setSlug] = useState('')
const [description, setDescription] = useState('')
const [price, setPrice] = useState('')
const [oldPrice, setOldPrice] = useState('')
const [stock, setStock] = useState('0')
const [imageUrl, setImageUrl] = useState('')
const [brandId, setBrandId] = useState('')
const [categoryId, setCategoryId] = useState('')
const [creatingProduct, setCreatingProduct] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }

    loadData()
  }, [user])

 const loadData = async () => {
  try {
    const [
      statsRes,
      ordersRes,
      productsRes,
      brandsRes,
      categoriesRes,
    ] = await Promise.all([
      getAdminStats(),
      getAdminOrders(),
      getAdminProducts(),
      getAdminBrands(),
      getAdminCategories(),
    ])

    setStats(statsRes.data)
    setOrders(ordersRes.data)
    setProducts(productsRes.data)
    setBrands(brandsRes.data)
    setCategories(categoriesRes.data)
  } catch (e) {
    console.error(e)
  } finally {
    setLoading(false)
  }
}
const handleCreateProduct = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    setCreatingProduct(true)

    const payload = {
      title,
      slug,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: Number(stock),
      imageUrl: imageUrl.trim(),
      brandId,
      categoryId,
    }

    const res = await createAdminProduct(payload)

    setProducts((prev) => [res.data, ...prev])

    setTitle('')
    setSlug('')
    setDescription('')
    setPrice('')
    setOldPrice('')
    setStock('0')
    setImageUrl('')
    setBrandId('')
    setCategoryId('')

    alert('Товар успешно создан')
  } catch (e) {
    console.error(e)
    alert('Ошибка создания товара')
  } finally {
    setCreatingProduct(false)
  }
}
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status)

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    } catch (e) {
      console.error(e)
      alert('Ошибка обновления')
    }
  }

  if (loading) return <div>Загрузка админки...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Админка</h1>

      {/* 📊 Статистика */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Пользователи</div>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Товары</div>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
          </div>
<div className="mb-10 rounded-3xl border bg-white p-6 shadow-sm">
  <h2 className="mb-5 text-2xl font-bold">Добавить товар</h2>

  <form onSubmit={handleCreateProduct} className="grid gap-4 md:grid-cols-2">
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Название товара"
      className="rounded-2xl border px-4 py-3"
      required
    />

    <input
      type="text"
      value={slug}
      onChange={(e) => setSlug(e.target.value)}
      placeholder="slug, например nike-air-max"
      className="rounded-2xl border px-4 py-3"
      required
    />

    <input
      type="number"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      placeholder="Цена"
      className="rounded-2xl border px-4 py-3"
      required
    />

    <input
      type="number"
      value={oldPrice}
      onChange={(e) => setOldPrice(e.target.value)}
      placeholder="Старая цена (необязательно)"
      className="rounded-2xl border px-4 py-3"
    />

    <input
      type="number"
      value={stock}
      onChange={(e) => setStock(e.target.value)}
      placeholder="Остаток"
      className="rounded-2xl border px-4 py-3"
    />

    <input
      type="text"
      value={imageUrl}
      onChange={(e) => setImageUrl(e.target.value)}
      placeholder="Ссылка на изображение"
      className="rounded-2xl border px-4 py-3"
    />

    <select
      value={brandId}
      onChange={(e) => setBrandId(e.target.value)}
      className="rounded-2xl border px-4 py-3"
      required
    >
      <option value="">Выбери бренд</option>
      {brands.map((brand) => (
        <option key={brand.id} value={brand.id}>
          {brand.name}
        </option>
      ))}
    </select>

    <select
      value={categoryId}
      onChange={(e) => setCategoryId(e.target.value)}
      className="rounded-2xl border px-4 py-3"
      required
    >
      <option value="">Выбери категорию</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>

    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Описание товара"
      className="rounded-2xl border px-4 py-3 md:col-span-2"
      rows={4}
      required
    />

    {imageUrl.trim() && (
      <div className="md:col-span-2">
        <div className="mb-2 text-sm text-neutral-500">Превью изображения</div>
        <img
          src={imageUrl}
          alt="Preview"
          className="h-48 w-48 rounded-2xl border object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    )}

    <button
      type="submit"
      disabled={creatingProduct}
      className="rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {creatingProduct ? 'Создание...' : 'Добавить товар'}
    </button>
  </form>
</div>
          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Заказы</div>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm text-slate-500">Выручка</div>
            <div className="text-2xl font-bold">{stats.revenue} ₽</div>
          </div>
        </div>
      )}

      <div className="mb-10 rounded-3xl border bg-white p-6 shadow-sm">
  <h2 className="mb-5 text-2xl font-bold">Товары</h2>

  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {products.map((product) => (
      <div key={product.id} className="rounded-2xl border p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="mb-3 h-48 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="mb-3 flex h-48 w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            Нет фото
          </div>
        )}

        <div className="text-lg font-bold">{product.title}</div>
        <div className="mt-1 text-sm text-neutral-500">{product.brand.name}</div>
        <div className="text-sm text-neutral-500">{product.category.name}</div>
        <div className="mt-3 font-semibold">{product.price} ₽</div>
        <div className="text-sm text-neutral-500">Остаток: {product.stock}</div>
      </div>
    ))}
  </div>
</div>

      {/* 📦 Заказы */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Все заказы</h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">ID</div>
                  <div className="font-semibold">{order.id}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Пользователь</div>
                  <div>{order.user?.email}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Сумма</div>
                  <div>{order.totalAmount} ₽</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Статус</div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="rounded-lg border px-2 py-1"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-sm">
                    {item.product.title} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}