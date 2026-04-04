import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../shared/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setError('')

      const res = await api.post('/auth/login', {
        email,
        password,
      })

      setAuth(res.data.token, res.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Вход</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border px-4 py-3"
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          className="w-full cursor-pointer rounded-2xl bg-black py-3 text-white"
        >
          Войти
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}