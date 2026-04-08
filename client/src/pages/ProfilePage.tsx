import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '../shared/api'
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminProducts,
  getAdminBrands,
  getAdminCategories,
  createAdminProduct,
  uploadAdminImage,
} from '../shared/api'
import { useAuthStore } from '../store/authStore'

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

type User = {
  id: string
  name: string
  email: string
  role?: 'USER' | 'ADMIN'
  createdAt?: string
}

type Stats = {
  usersCount: number
  productsCount: number
  ordersCount: number
  revenue: number
}

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
  brand: {
    name: string
  }
  category: {
    name: string
  }
}

type AdminOrder = {
  id: string
  totalAmount: number
  status: string
  user?: {
    email: string
    name?: string | null
  } | null
  items: {
    id: string
    quantity: number
    product: {
      id: string
      title: string
      imageUrl?: string | null
    }
  }[]
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [creatingProduct, setCreatingProduct] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [oldPrice, setOldPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!authUser || !token) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [authUser, token, navigate])

  const loadProfile = async () => {
    try {
      const res = await getMe()
      setUser(res.data)

      if (res.data.role === 'ADMIN') {
        await loadAdminData()
      }
    } catch (error) {
      console.error(error)
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, brandsRes, categoriesRes] =
        await Promise.allSettled([
          getAdminStats(),
          getAdminOrders(),
          getAdminProducts(),
          getAdminBrands(),
          getAdminCategories(),
        ])

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data)
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data)
      if (brandsRes.status === 'fulfilled') setBrands(brandsRes.value.data)
      if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status)

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      )
    } catch (error) {
      console.error(error)
      alert('Ошибка обновления статуса')
    }
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    setImageFile(file)

    try {
      setUploadingImage(true)

      const res = await uploadAdminImage(file)
      setImageUrl(res.data.imageUrl)
    } catch (error) {
      console.error(error)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateProduct = async (e: FormEvent) => {
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

      if (stats) {
        setStats({
          ...stats,
          productsCount: stats.productsCount + 1,
        })
      }

      setTitle('')
      setSlug('')
      setDescription('')
      setPrice('')
      setOldPrice('')
      setStock('0')
      setImageUrl('')
      setBrandId('')
      setCategoryId('')
      setImageFile(null)

      alert('Товар успешно добавлен')
    } catch (error) {
      console.error(error)
      alert('Ошибка создания товара')
    } finally {
      setCreatingProduct(false)
    }
  }

  if (!authUser || !token) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/[0.04]">
          <h2 className="text-2xl font-bold text-neutral-900">Аккаунт</h2>

          <div className="mt-6 space-y-3">
            <Link
              to="/profile"
              className="block rounded-2xl bg-black px-4 py-3 font-semibold text-white"
            >
              Профиль
            </Link>

            <Link
              to="/profile/orders"
              className="block rounded-2xl px-4 py-3 font-semibold text-neutral-900 transition hover:bg-[#f4f7fb]"
            >
              Мои заказы
            </Link>

            {user?.role === 'ADMIN' && (
              <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
                Режим администратора
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
            <h1 className="text-5xl font-bold text-neutral-900">Профиль</h1>

            {isLoading ? (
              <div className="mt-8 text-neutral-500">Загрузка профиля...</div>
            ) : !user ? (
              <div className="mt-8 text-neutral-500">
                Не удалось загрузить данные аккаунта
              </div>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Имя</div>
                  <div className="mt-2 text-xl font-semibold">{user.name}</div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Email</div>
                  <div className="mt-2 text-xl font-semibold">{user.email}</div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Роль</div>
                  <div className="mt-2 text-xl font-semibold">
                    {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <div className="text-sm text-neutral-500">Дата регистрации</div>
                  <div className="mt-2 text-xl font-semibold">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                      : '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {user?.role === 'ADMIN' && (
            <>
              {stats && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="text-sm text-neutral-500">Пользователи</div>
                    <div className="mt-3 text-3xl font-bold">{stats.usersCount}</div>
                  </div>

                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="text-sm text-neutral-500">Товары</div>
                    <div className="mt-3 text-3xl font-bold">{stats.productsCount}</div>
                  </div>

                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="text-sm text-neutral-500">Заказы</div>
                    <div className="mt-3 text-3xl font-bold">{stats.ordersCount}</div>
                  </div>

                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
                    <div className="text-sm text-neutral-500">Выручка</div>
                    <div className="mt-3 text-3xl font-bold">{stats.revenue} ₽</div>
                  </div>
                </div>
              )}

              <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                <h2 className="mb-6 text-2xl font-bold text-neutral-900">
                  Добавить товар
                </h2>

                <form onSubmit={handleCreateProduct} className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название товара"
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                    required
                  />

                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug, например nike-air-max-270"
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                    required
                  />

                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Цена"
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                    required
                  />

                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="Старая цена"
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                  />

                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Остаток"
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                  />

                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
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
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
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
                    rows={4}
                    className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10 md:col-span-2"
                    required
                  />

                  <div className="md:col-span-2 grid gap-4 rounded-2xl border border-[#d8e4ff] p-4">
                    <div>
                      <div className="mb-2 text-sm font-medium text-neutral-700">
                        Ссылка на изображение
                      </div>

                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                      />
                    </div>

                    <div>
                      <div className="mb-2 text-sm font-medium text-neutral-700">
                        Загрузка с компьютера
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={handlePickImage}
                          disabled={uploadingImage}
                          className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          {uploadingImage ? 'Загрузка...' : 'Выбрать и загрузить файл'}
                        </button>

                        {imageFile && (
                          <div className="text-sm text-neutral-500">
                            {imageFile.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {imageUrl && (
                      <div>
                        <div className="mb-3 text-sm text-neutral-500">Превью</div>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="h-56 w-56 rounded-3xl border border-[#e6eef9] object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] disabled:opacity-50"
                  >
                    {creatingProduct ? 'Создание...' : 'Добавить товар'}
                  </button>
                </form>
              </div>

              <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                <h2 className="mb-6 text-2xl font-bold text-neutral-900">Товары</h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-[24px] border border-[#e6eef9] bg-[#fafcff]"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center bg-[#f4f7fb] text-neutral-400">
                          Нет фото
                        </div>
                      )}

                      <div className="p-4">
                        <div className="text-sm text-neutral-500">{product.brand.name}</div>
                        <h3 className="mt-2 text-xl font-bold text-neutral-900">
                          {product.title}
                        </h3>
                        <div className="mt-1 text-sm text-neutral-500">
                          {product.category.name}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xl font-bold">{product.price} ₽</div>
                          <div className="text-sm text-neutral-500">
                            Остаток: {product.stock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                <h2 className="mb-6 text-2xl font-bold text-neutral-900">Все заказы</h2>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-[24px] border border-[#e6eef9] bg-[#fafcff] p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <div className="text-sm text-neutral-500">ID</div>
                          <div className="mt-1 break-all font-medium">{order.id}</div>
                        </div>

                        <div>
                          <div className="text-sm text-neutral-500">Пользователь</div>
                          <div className="mt-1 font-medium">
                            {order.user?.email || 'Нет данных'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-neutral-500">Сумма</div>
                          <div className="mt-1 font-medium">{order.totalAmount} ₽</div>
                        </div>

                        <div>
                          <div className="text-sm text-neutral-500">Статус</div>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="mt-1 rounded-xl border border-[#d8e4ff] bg-white px-3 py-2 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 text-sm font-medium text-neutral-500">
                          Состав заказа
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-black/[0.04]"
                            >
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.title}
                                  className="h-16 w-16 rounded-2xl object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4f7fb] text-xs text-neutral-400">
                                  Нет фото
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="font-medium text-neutral-900">
                                  {item.product.title}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  Количество: {item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}