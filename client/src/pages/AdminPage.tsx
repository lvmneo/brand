import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminPage() {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [creating, setCreating] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // 🔥 ЖДЕМ AUTH
 useEffect(() => {
  if (!token) {
    navigate('/login')
    return
  }

  loadData()
}, [token, navigate])

 const loadData = async () => {
  try {
    const [statsRes, ordersRes, productsRes, brandsRes, categoriesRes] =
      await Promise.allSettled([
        getAdminStats(),
        getAdminOrders(),
        getAdminProducts(),
        getAdminBrands(),
        getAdminCategories(),
      ])

    // если backend вернул 403 — реально нет доступа
    const rejected = [statsRes, ordersRes, productsRes, brandsRes, categoriesRes]
      .filter((r) => r.status === 'rejected') as PromiseRejectedResult[]

    const hasForbidden = rejected.some((r) => {
      const status = r.reason?.response?.status
      return status === 401 || status === 403
    })

    if (hasForbidden) {
      alert('Нет доступа к админке')
      navigate('/')
      return
    }

    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data)
    if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data)
    if (brandsRes.status === 'fulfilled') setBrands(brandsRes.value.data)
    if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data)
  } catch (e) {
    console.error(e)
  } finally {
    setLoading(false)
  }
}
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setCreating(true)

      const res = await createAdminProduct({
        title,
        slug,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        brandId,
        categoryId,
      })

      setProducts((prev) => [res.data, ...prev])

      setTitle('')
      setSlug('')
      setDescription('')
      setPrice('')
      setStock('0')
      setImageUrl('')
      setBrandId('')
      setCategoryId('')
    } catch (e) {
      console.error(e)
      alert('Ошибка создания товара')
    } finally {
      setCreating(false)
    }
  }

  // 🔴 ЕСЛИ НЕ АВТОРИЗОВАН
if (!token) {
  return <div className="p-10">Проверка доступа...</div>
}
  if (loading) {
    return <div className="p-10">Загрузка админки...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Админка</h1>
 
      {/* DEBUG */}
      <div className="mb-6 rounded bg-yellow-100 p-3 text-sm">
        brands: {brands.length} | categories: {categories.length} | products:{' '}
        {products.length} | orders: {orders.length} | stats:{' '}
        {stats ? 'yes' : 'no'}
      </div>

      {/* СТАТИСТИКА */}
      {stats && (
        <div className="mb-10 grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded">Пользователи: {stats.usersCount}</div>
          <div className="bg-white p-4 rounded">Товары: {stats.productsCount}</div>
          <div className="bg-white p-4 rounded">Заказы: {stats.ordersCount}</div>
          <div className="bg-white p-4 rounded">Выручка: {stats.revenue} ₽</div>
        </div>
      )}

      {/* ДОБАВЛЕНИЕ */}
      <div className="mb-10 bg-white p-6 rounded">
        <h2 className="mb-4 text-xl font-bold">Добавить товар</h2>

        <form onSubmit={handleCreate} className="grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Остаток" />
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Ссылка на фото" />

          <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">Бренд</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Категория</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />

          {imageUrl && <img src={imageUrl} className="h-40 object-cover" />}

          <button disabled={creating} className="bg-blue-500 text-white p-2 rounded">
            Добавить
          </button>
        </form>
      </div>

      {/* ЗАКАЗЫ */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Заказы</h2>

        {orders.map((o) => (
          <div key={o.id} className="mb-3 bg-white p-4 rounded">
            <div>{o.id}</div>
            <div>{o.totalAmount} ₽</div>

            <select
              value={o.status}
              onChange={(e) => handleStatusChange(o.id, e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ТОВАРЫ */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Товары</h2>

        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded">
              {p.imageUrl && <img src={p.imageUrl} className="h-40 w-full object-cover" />}
              <div>{p.title}</div>
              <div>{p.price} ₽</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}