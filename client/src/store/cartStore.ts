import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  title: string
  price: number
  imageUrl?: string | null
  quantity: number
}

type OrderProductItem = {
  product: {
    id: string
    title: string
    price: number
    imageUrl?: string | null
  }
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
  clearCart: () => void
  addOrderToCart: (orderItems: OrderProductItem[]) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addToCart: (product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id)

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { ...product, quantity: 1 }],
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      addOrderToCart: (orderItems) =>
        set((state) => {
          const updatedItems = [...state.items]

          orderItems.forEach((orderItem) => {
            const existingItem = updatedItems.find(
              (item) => item.id === orderItem.product.id
            )

            if (existingItem) {
              existingItem.quantity += orderItem.quantity
            } else {
              updatedItems.push({
                id: orderItem.product.id,
                title: orderItem.product.title,
                price: orderItem.product.price,
                imageUrl: orderItem.product.imageUrl,
                quantity: orderItem.quantity,
              })
            }
          })

          return { items: updatedItems }
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
)