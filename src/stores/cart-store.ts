import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  variant: string | null
  price: number
  comparePrice: number | null
  quantity: number
  image: string | null
  inventory: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )
        
        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = Math.min(existingItem.quantity + item.quantity, item.inventory)
          set({
            items: items.map((i) =>
              i.id === existingItem.id ? { ...i, quantity: newQuantity } : i
            ),
          })
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.variantId || 'default'}-${Date.now()}`,
          }
          set({ items: [...items, newItem] })
        }
        
        // Open mini cart
        set({ isOpen: true })
      },
      
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        set({
          items: get().items.map((item) =>
            item.id === itemId 
              ? { ...item, quantity: Math.min(quantity, item.inventory) } 
              : item
          ),
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },
      
      openCart: () => {
        set({ isOpen: true })
      },
      
      closeCart: () => {
        set({ isOpen: false })
      },
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'graphh-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
