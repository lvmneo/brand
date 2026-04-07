import axios from 'axios'

const baseURL = 'http://localhost:4000/api'

export const api = axios.create({
  baseURL,
})

export const getAdminStats = () => api.get('/admin/stats')
export const getAdminOrders = () => api.get('/admin/orders')
export const updateOrderStatus = (id: string, status: string) =>
  api.patch(`/admin/orders/${id}/status`, { status })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ===== AUTH =====
export const getMe = () => api.get('/auth/me')

// ===== ORDERS =====
export const getMyOrders = () => api.get('/orders/my')
export const createOrder = (data: any) => api.post('/orders', data)
export const getMyOrderById = (id: string) => api.get(`/orders/my/${id}`)