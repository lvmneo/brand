import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../shared/api'

type Brand = {
  id: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  isVerified: boolean
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/brands')
      .then((res) => {
        setBrands(res.data)
      })
      .catch((error) => {
        console.error('Ошибка загрузки брендов:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-lg">Загрузка брендов...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Бренды</h1>
        <p className="mt-2 text-slate-600">
          Официальные бренды, представленные на платформе
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            to={`/brands/${brand.slug}`}
            key={brand.id}
            className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{brand.name}</h2>

              {brand.isVerified && (
                <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                  Official
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {brand.description || 'Официальный бренд на платформе'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}