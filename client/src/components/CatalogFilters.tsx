type SelectOption = {
  label: string
  value: string
}

type CatalogFiltersProps = {
  title?: string
  subtitle?: string
  searchLabel?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void

  categoryValue: string
  onCategoryChange: (value: string) => void
  categoryOptions: SelectOption[]

  brandValue?: string
  onBrandChange?: (value: string) => void
  brandOptions?: SelectOption[]

  sortValue: string
  onSortChange: (value: string) => void
  sortOptions: SelectOption[]

  resultsCount: number
  onReset: () => void
}

export default function CatalogFilters({
  title = 'Фильтры',
  subtitle = 'Подбери нужные товары',
  searchLabel = 'Поиск',
  searchPlaceholder = 'Поиск...',
  searchValue,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  brandValue,
  onBrandChange,
  brandOptions,
  sortValue,
  onSortChange,
  sortOptions,
  resultsCount,
  onReset,
}: CatalogFiltersProps) {
  return (
    <aside className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] lg:sticky lg:top-24">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer text-sm font-semibold text-[#005bff] transition hover:text-[#0047cc]"
        >
          Сбросить
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            {searchLabel}
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Категория
          </label>
          <select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {brandValue !== undefined && onBrandChange && brandOptions && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Бренд
            </label>
            <select
              value={brandValue}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
            >
              {brandOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Сортировка
          </label>
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-[#d7e3f8] bg-[#f9fbff] px-4 py-3 outline-none transition focus:border-[#9dc0ff] focus:ring-4 focus:ring-[#005bff]/10"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-[24px] bg-[#f8fbff] p-4">
          <div className="text-sm text-neutral-500">Результат</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {resultsCount}
          </div>
          <div className="mt-1 text-sm text-neutral-500">
            товаров отображается
          </div>
        </div>
      </div>
    </aside>
  )
}