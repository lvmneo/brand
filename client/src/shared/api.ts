import axios from 'axios'

const baseURL = 'http://localhost:4000/api'

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// AUTH
export const getMe = () => api.get('/auth/me')

// ORDERS
export const getMyOrders = () => api.get('/orders/my')
export const createOrder = (data: any) => api.post('/orders', data)
export const getMyOrderById = (id: string) => api.get(`/orders/my/${id}`)

// ADMIN
export const getAdminStats = () => api.get('/admin/stats')
export const getAdminOrders = () => api.get('/admin/orders')
export const updateOrderStatus = (id: string, status: string) =>
  api.patch(`/admin/orders/${id}/status`, { status })

export const getAdminProducts = () => api.get('/admin/products')
export const getAdminBrands = () => api.get('/admin/brands')
export const getAdminCategories = () => api.get('/admin/categories')

export const createAdminProduct = (data: {
  title: string
  slug: string
  description: string
  price: number
  oldPrice?: number | null
  stock?: number
  imageUrl?: string
  brandId: string
  categoryId: string
}) => api.post('/admin/products', data)

export const updateAdminProduct = (
  id: string,
  data: {
    title: string
    slug: string
    description: string
    price: number
    oldPrice?: number | null
    stock?: number
    imageUrl?: string
    brandId: string
    categoryId: string
  }
) => api.patch(`/admin/products/${id}`, data)

export const deleteAdminProduct = (id: string) =>
  api.delete(`/admin/products/${id}`)

export const uploadAdminImage = (file: File) => {
  const formData = new FormData()
  formData.append('image', file)

  return api.post('/admin/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}