import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminProducts,
  getAdminBrands,
  getAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminImage,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
} from '../shared/api'

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

type AdminTab = 'dashboard' | 'products' | 'brands' | 'orders'

type AdminPanelProps = {
  activeTab: AdminTab
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
  slug: string
  description?: string | null
  logoUrl?: string | null
  isVerified?: boolean
}

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  oldPrice?: number | null
  stock: number
  imageUrl?: string | null
  brandId: string
  categoryId: string
  brand: {
    id: string
    name: string
  }
  category: {
    id: string
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

type EditProductForm = {
  id: string
  title: string
  slug: string
  description: string
  price: string
  oldPrice: string
  stock: string
  imageUrl: string
  brandId: string
  categoryId: string
}

type EditBrandForm = {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  isVerified: boolean
}

export default function AdminPanel({ activeTab }: AdminPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [creatingProduct, setCreatingProduct] = useState(false)
  const [updatingProduct, setUpdatingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [oldPrice, setOldPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingEditImage, setUploadingEditImage] = useState(false)

  const [editingProduct, setEditingProduct] = useState<EditProductForm | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const editFileInputRef = useRef<HTMLInputElement | null>(null)

  const [creatingBrand, setCreatingBrand] = useState(false)
  const [updatingBrand, setUpdatingBrand] = useState(false)
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null)

  const [brandName, setBrandName] = useState('')
  const [brandSlug, setBrandSlug] = useState('')
  const [brandDescription, setBrandDescription] = useState('')
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const [brandIsVerified, setBrandIsVerified] = useState(false)

  const [editingBrand, setEditingBrand] = useState<EditBrandForm | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setIsLoading(true)

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
    } finally {
      setIsLoading(false)
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

  const handleEditPickImage = () => {
    editFileInputRef.current?.click()
  }

  const handleEditFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null
    if (!file || !editingProduct) return

    try {
      setUploadingEditImage(true)
      const res = await uploadAdminImage(file)

      setEditingProduct((prev) =>
        prev
          ? {
              ...prev,
              imageUrl: res.data.imageUrl,
            }
          : prev
      )
    } catch (error) {
      console.error(error)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploadingEditImage(false)
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

  const startEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      brandId: product.brandId,
      categoryId: product.categoryId,
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditProduct = () => {
    setEditingProduct(null)
  }

  const handleUpdateProduct = async (e: FormEvent) => {
    e.preventDefault()

    if (!editingProduct) return

    try {
      setUpdatingProduct(true)

      const res = await updateAdminProduct(editingProduct.id, {
        title: editingProduct.title,
        slug: editingProduct.slug,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        oldPrice: editingProduct.oldPrice
          ? Number(editingProduct.oldPrice)
          : null,
        stock: Number(editingProduct.stock),
        imageUrl: editingProduct.imageUrl.trim(),
        brandId: editingProduct.brandId,
        categoryId: editingProduct.categoryId,
      })

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct.id ? res.data : product
        )
      )

      setEditingProduct(null)
      alert('Товар успешно обновлен')
    } catch (error) {
      console.error(error)
      alert('Ошибка обновления товара')
    } finally {
      setUpdatingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm('Удалить этот товар?')
    if (!confirmed) return

    try {
      setDeletingProductId(productId)

      await deleteAdminProduct(productId)

      setProducts((prev) => prev.filter((product) => product.id !== productId))

      if (stats) {
        setStats({
          ...stats,
          productsCount: Math.max(0, stats.productsCount - 1),
        })
      }

      if (editingProduct?.id === productId) {
        setEditingProduct(null)
      }

      alert('Товар удален')
    } catch (error) {
      console.error(error)
      alert('Ошибка удаления товара')
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleCreateBrand = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setCreatingBrand(true)

      const res = await createAdminBrand({
        name: brandName,
        slug: brandSlug,
        description: brandDescription,
        logoUrl: brandLogoUrl,
        isVerified: brandIsVerified,
      })

      setBrands((prev) =>
        [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name))
      )

      setBrandName('')
      setBrandSlug('')
      setBrandDescription('')
      setBrandLogoUrl('')
      setBrandIsVerified(false)

      alert('Бренд успешно добавлен')
    } catch (error) {
      console.error(error)
      alert('Ошибка создания бренда')
    } finally {
      setCreatingBrand(false)
    }
  }

  const startEditBrand = (brand: Brand) => {
    setEditingBrand({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      isVerified: Boolean(brand.isVerified),
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditBrand = () => {
    setEditingBrand(null)
  }

  const handleUpdateBrand = async (e: FormEvent) => {
    e.preventDefault()

    if (!editingBrand) return

    try {
      setUpdatingBrand(true)

      const res = await updateAdminBrand(editingBrand.id, {
        name: editingBrand.name,
        slug: editingBrand.slug,
        description: editingBrand.description,
        logoUrl: editingBrand.logoUrl,
        isVerified: editingBrand.isVerified,
      })

      setBrands((prev) =>
        prev
          .map((brand) => (brand.id === editingBrand.id ? res.data : brand))
          .sort((a, b) => a.name.localeCompare(b.name))
      )

      setEditingBrand(null)
      alert('Бренд успешно обновлен')
    } catch (error) {
      console.error(error)
      alert('Ошибка обновления бренда')
    } finally {
      setUpdatingBrand(false)
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    const confirmed = window.confirm('Удалить этот бренд?')
    if (!confirmed) return

    try {
      setDeletingBrandId(brandId)

      await deleteAdminBrand(brandId)

      setBrands((prev) => prev.filter((brand) => brand.id !== brandId))

      if (editingBrand?.id === brandId) {
        setEditingBrand(null)
      }

      alert('Бренд удален')
    } catch (error: any) {
      console.error(error)
      alert(error?.response?.data?.message || 'Ошибка удаления бренда')
    } finally {
      setDeletingBrandId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
        Загрузка админки...
      </div>
    )
  }

  return (
    <>
      {activeTab === 'dashboard' && stats && (
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

      {activeTab === 'products' && editingProduct && (
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              Редактировать товар
            </h2>

            <button
              type="button"
              onClick={cancelEditProduct}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-5 py-3 font-semibold text-[#005bff] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f4f8ff] active:scale-[0.98]"
            >
              Отмена
            </button>
          </div>

          <form
            onSubmit={handleUpdateProduct}
            className="grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              value={editingProduct.title}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, title: e.target.value } : prev
                )
              }
              placeholder="Название товара"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={editingProduct.slug}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, slug: e.target.value } : prev
                )
              }
              placeholder="slug"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, price: e.target.value } : prev
                )
              }
              placeholder="Цена"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="number"
              value={editingProduct.oldPrice}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, oldPrice: e.target.value } : prev
                )
              }
              placeholder="Старая цена"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
            />

            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, stock: e.target.value } : prev
                )
              }
              placeholder="Остаток"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
            />

            <select
              value={editingProduct.brandId}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, brandId: e.target.value } : prev
                )
              }
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
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
              value={editingProduct.categoryId}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, categoryId: e.target.value } : prev
                )
              }
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
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
              value={editingProduct.description}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              placeholder="Описание товара"
              rows={4}
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
              required
            />

            <div className="md:col-span-2 grid gap-4 rounded-2xl border border-[#d8e4ff] p-4">
              <input
                type="text"
                value={editingProduct.imageUrl}
                onChange={(e) =>
                  setEditingProduct((prev) =>
                    prev ? { ...prev, imageUrl: e.target.value } : prev
                  )
                }
                placeholder="Ссылка на изображение"
                className="w-full rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              />

              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleEditPickImage}
                disabled={uploadingEditImage}
                className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-5 py-3 font-semibold text-[#005bff] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f4f8ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingEditImage ? 'Загрузка...' : 'Загрузить файл'}
              </button>

              {editingProduct.imageUrl && (
                <img
                  src={editingProduct.imageUrl}
                  alt="Preview"
                  className="h-56 w-56 rounded-3xl border border-[#e6eef9] object-cover"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={updatingProduct}
              className="cursor-pointer rounded-2xl bg-[#005bff] px-3 py-4 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingProduct ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">
            Добавить товар
          </h2>

          <form
            onSubmit={handleCreateProduct}
            className="grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название товара"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Цена"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              placeholder="Старая цена"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
            />

            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Остаток"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
            />

            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
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
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
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
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
              required
            />

            <div className="md:col-span-2 grid gap-4 rounded-2xl border border-[#d8e4ff] p-4">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ссылка на изображение"
                className="w-full rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handlePickImage}
                disabled={uploadingImage}
                className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-5 py-3 font-semibold text-[#005bff] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f4f8ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadingImage ? 'Загрузка...' : 'Загрузить файл'}
              </button>

              {imageFile && (
                <div className="text-sm text-neutral-500">{imageFile.name}</div>
              )}

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-56 w-56 rounded-3xl border border-[#e6eef9] object-cover"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={creatingProduct}
              className="cursor-pointer rounded-2xl bg-[#005bff] px-3 py-4 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingProduct ? 'Создание...' : 'Добавить товар'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'products' && (
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
                  <div className="mt-3 text-sm text-neutral-500">
                    slug: {product.slug}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xl font-bold">{product.price} ₽</div>
                    <div className="text-sm text-neutral-500">
                      Остаток: {product.stock}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditProduct(product)}
                      className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98]"
                    >
                      Редактировать
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deletingProductId === product.id}
                      className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#ffd4ea] bg-white px-5 py-3 font-semibold text-[#ff4d8d] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff5fa] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProductId === product.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'brands' && editingBrand && (
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              Редактирование бренда
            </h2>

            <button
              type="button"
              onClick={cancelEditBrand}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#d8e4ff] bg-white px-5 py-3 font-semibold text-[#005bff] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f4f8ff] active:scale-[0.98]"
            >
              Отмена
            </button>
          </div>

          <form onSubmit={handleUpdateBrand} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={editingBrand.name}
              onChange={(e) =>
                setEditingBrand((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
              placeholder="Название бренда"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={editingBrand.slug}
              onChange={(e) =>
                setEditingBrand((prev) =>
                  prev ? { ...prev, slug: e.target.value } : prev
                )
              }
              placeholder="slug"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={editingBrand.logoUrl}
              onChange={(e) =>
                setEditingBrand((prev) =>
                  prev ? { ...prev, logoUrl: e.target.value } : prev
                )
              }
              placeholder="Ссылка на логотип"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
            />

            <textarea
              value={editingBrand.description}
              onChange={(e) =>
                setEditingBrand((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              placeholder="Описание бренда"
              rows={4}
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d8e4ff] px-4 py-3">
              <input
                type="checkbox"
                checked={editingBrand.isVerified}
                onChange={(e) =>
                  setEditingBrand((prev) =>
                    prev ? { ...prev, isVerified: e.target.checked } : prev
                  )
                }
                className="h-4 w-4"
              />
              <span className="font-medium text-neutral-900">Верифицированный бренд</span>
            </label>

            <button
              type="submit"
              disabled={updatingBrand}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingBrand ? 'Сохранение...' : 'Сохранить бренд'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">
            Добавить бренд
          </h2>

          <form onSubmit={handleCreateBrand} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Название бренда"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={brandSlug}
              onChange={(e) => setBrandSlug(e.target.value)}
              placeholder="slug"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none"
              required
            />

            <input
              type="text"
              value={brandLogoUrl}
              onChange={(e) => setBrandLogoUrl(e.target.value)}
              placeholder="Ссылка на логотип"
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
            />

            <textarea
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              placeholder="Описание бренда"
              rows={4}
              className="rounded-2xl border border-[#d8e4ff] px-4 py-3 outline-none md:col-span-2"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#d8e4ff] px-4 py-3">
              <input
                type="checkbox"
                checked={brandIsVerified}
                onChange={(e) => setBrandIsVerified(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="font-medium text-neutral-900">Верифицированный бренд</span>
            </label>

            <button
              type="submit"
              disabled={creatingBrand}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-6 py-4 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingBrand ? 'Создание...' : 'Добавить бренд'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">Бренды</h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="rounded-[24px] border border-[#e6eef9] bg-[#fafcff] p-5"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="mb-4 h-20 w-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#eef5ff] font-bold text-[#005bff]">
                    {brand.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-neutral-900">{brand.name}</h3>
                  {brand.isVerified && (
                    <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#005bff]">
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-neutral-400">slug: {brand.slug}</div>

                {brand.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-neutral-600">
                    {brand.description}
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEditBrand(brand)}
                    className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-2xl bg-[#005bff] px-5 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#004fe0] hover:shadow-[0_14px_30px_rgba(0,91,255,0.24)] active:scale-[0.98]"
                  >
                    Редактировать
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(brand.id)}
                    disabled={deletingBrandId === brand.id}
                    className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-2xl border border-[#ffd4ea] bg-white px-5 py-3 font-semibold text-[#ff4d8d] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff5fa] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingBrandId === brand.id ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
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
                      className="mt-1 rounded-xl border border-[#d8e4ff] bg-white px-3 py-2 outline-none"
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
      )}
    </>
  )
}