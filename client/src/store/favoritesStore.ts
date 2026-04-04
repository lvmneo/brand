import { create } from 'zustand'

export type FavoriteItem = {
  id: string
  title: string
  slug: string
  price: number
  imageUrl?: string | null
  brandName?: string
}

type FavoritesStore = {
  items: FavoriteItem[]
  toggleFavorite: (product: FavoriteItem) => void
  isFavorite: (id: string) => boolean
  removeFavorite: (id: string) => void
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  items: [],

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

  isFavorite: (id) => get().items.some((item) => item.id === id),

  removeFavorite: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearFavorites: () => set({ items: [] }),
}))