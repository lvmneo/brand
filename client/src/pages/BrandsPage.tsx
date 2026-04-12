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
    return (
      <div className="min-h-screen bg-[#f4f7fb] pb-10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-28 rounded-[28px] bg-white" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-64 rounded-[28px] bg-white" />
              <div className="h-64 rounded-[28px] bg-white" />
              <div className="h-64 rounded-[28px] bg-white" />
              <div className="h-64 rounded-[28px] bg-white" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="rounded-[30px] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                Бренды
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Официальные бренды, представленные на платформе
              </p>
            </div>

            <div className="rounded-2xl bg-[#eef5ff] px-4 py-3 text-sm font-semibold text-[#005bff]">
              Всего брендов: {brands.length}
            </div>
          </div>

          {brands.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#d7e3f8] bg-[#f8fbff] p-10 text-center text-neutral-500">
              Бренды пока не добавлены
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brands.map((brand) => (
                <Link
                  to={`/brands/${brand.slug}`}
                  key={brand.id}
                  className="group rounded-[30px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#e6eef9] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#005bff]/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#005bff] to-[#2f7bff] text-2xl font-bold text-white shadow-[0_10px_24px_rgba(0,91,255,0.18)] transition duration-200 group-hover:scale-105">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>

                    {brand.isVerified && (
                      <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#005bff]">
                        Official
                      </span>
                    )}
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-neutral-900">
                    {brand.name}
                  </h2>

                  <p className="mt-3 min-h-[72px] text-sm leading-7 text-neutral-500">
                    {brand.description || 'Официальная витрина бренда на платформе'}
                  </p>

                  <div className="mt-6 inline-flex items-center text-sm font-semibold text-[#005bff] transition duration-200 group-hover:translate-x-1">
                    Перейти к бренду →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}