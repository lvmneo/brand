import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteItem = {
  id: string
  title: string
  price: number
  imageUrl?: string | null
  slug: string
}

type FavoritesStore = {
  items: FavoriteItem[]
  addToFavorites: (product: FavoriteItem) => void
  removeFromFavorites: (id: string) => void
  toggleFavorite: (product: FavoriteItem) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToFavorites: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id)

          if (exists) {
            return state
          }

          return {
            items: [...state.items, product],
          }
        }),

      removeFromFavorites: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      toggleFavorite: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id)

          if (exists) {
            return {
              items: state.items.filter((item) => item.id !== product.id),
            }
          }

          return {
            items: [...state.items, product],
          }
        }),

      isFavorite: (id) => {
        return get().items.some((item) => item.id === id)
      },

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: 'favorites-storage',
    }
  )
)