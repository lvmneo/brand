import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BrandsPage from './pages/BrandsPage'
import BrandPage from './pages/BrandPage'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ProfileOrdersPage from './pages/ProfileOrdersPage'
import ProfileOrderDetailsPage from './pages/ProfileOrderDetailsPage'

export default function App() {
const checkAuth = useAuthStore((state) => state.checkAuth)
const loading = useAuthStore((state) => state.loading)

useEffect(() => {
  checkAuth()
}, [checkAuth])

if (loading) {
  return <div>Загрузка...</div>
}

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/:slug" element={<BrandPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/orders" element={<ProfileOrdersPage />} />
          <Route
            path="profile/orders/:id"
            element={<ProfileOrderDetailsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}