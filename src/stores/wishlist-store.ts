import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  variant: string | null
  price: number
  comparePrice: number | null
  image: string | null
  addedAt: number
}

interface WishlistStore {
  items: WishlistItem[]
  
  // Actions
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void
  removeItem: (productId: string, variantId?: string | null) => void
  clearWishlist: () => void
  isInWishlist: (productId: string, variantId?: string | null) => boolean
  toggleItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void
  
  // Computed
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const exists = items.some(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )
        
        if (!exists) {
          const newItem: WishlistItem = {
            ...item,
            id: `${item.productId}-${item.variantId || 'default'}`,
            addedAt: Date.now(),
          }
          set({ items: [...items, newItem] })
        }
      },
      
      removeItem: (productId, variantId = null) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        })
      },
      
      clearWishlist: () => {
        set({ items: [] })
      },
      
      isInWishlist: (productId, variantId = null) => {
        return get().items.some(
          (item) => item.productId === productId && item.variantId === variantId
        )
      },
      
      toggleItem: (item) => {
        const isInList = get().isInWishlist(item.productId, item.variantId)
        if (isInList) {
          get().removeItem(item.productId, item.variantId)
        } else {
          get().addItem(item)
        }
      },
      
      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'graphh-wishlist',
    }
  )
)
