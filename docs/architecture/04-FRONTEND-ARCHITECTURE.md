# Frontend Architecture

## Overview

React-based frontend built with Next.js 14+ App Router, featuring server components, client components, and a comprehensive design system.

**Domains:**
- Customer Site: `https://graphh.com` / `https://graphh.in`
- Admin Panel: `https://admin.graphh.com`
- Employee Portal: `https://staff.graphh.com`

---

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   │
│   ├── (marketing)/                  # Marketing pages (public)
│   │   ├── page.tsx                  # Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog listing
│   │   │   └── [slug]/page.tsx       # Blog post
│   │   ├── faq/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (shop)/                       # E-commerce pages
│   │   ├── products/
│   │   │   ├── page.tsx              # All products
│   │   │   └── [slug]/page.tsx       # Product detail
│   │   ├── category/
│   │   │   └── [slug]/page.tsx       # Category page
│   │   ├── collection/
│   │   │   └── [slug]/page.tsx       # Collection page
│   │   ├── search/page.tsx           # Search results
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Checkout
│   │   │   └── success/page.tsx      # Order confirmation
│   │   ├── wishlist/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (account)/                    # User account (auth required)
│   │   ├── account/
│   │   │   ├── page.tsx              # Account overview
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order history
│   │   │   │   └── [id]/page.tsx     # Order details
│   │   │   ├── addresses/page.tsx    # Saved addresses
│   │   │   ├── profile/page.tsx      # Profile settings
│   │   │   └── wishlist/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (legal)/                      # Legal pages
│   │   ├── privacy-policy/page.tsx
│   │   ├── terms-of-service/page.tsx
│   │   ├── return-policy/page.tsx
│   │   └── shipping-policy/page.tsx
│   │
│   ├── admin/                        # Admin panel (separate app)
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Products list
│   │   │   │   ├── new/page.tsx      # Add product
│   │   │   │   └── [id]/page.tsx     # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Orders list
│   │   │   │   └── [id]/page.tsx     # Order details
│   │   │   ├── customers/
│   │   │   ├── categories/
│   │   │   ├── coupons/
│   │   │   ├── reviews/
│   │   │   ├── employees/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── media/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── staff/                        # Employee portal
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── reviews/
│   │   │   └── support/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                          # API routes
│   │   └── v1/...
│   │
│   ├── layout.tsx                    # Root layout
│   ├── not-found.tsx                 # 404 page
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading state
│   └── globals.css                   # Global styles
│
├── components/
│   ├── ui/                           # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── ... (40+ components)
│   │
│   ├── layout/                       # Layout components
│   │   ├── header/
│   │   │   ├── header.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── cart-icon.tsx
│   │   │   └── user-menu.tsx
│   │   ├── footer/
│   │   │   ├── footer.tsx
│   │   │   ├── newsletter-form.tsx
│   │   │   └── social-links.tsx
│   │   ├── sidebar/
│   │   │   ├── admin-sidebar.tsx
│   │   │   └── staff-sidebar.tsx
│   │   └── breadcrumb.tsx
│   │
│   ├── marketing/                    # Marketing components
│   │   ├── hero/
│   │   │   ├── hero-banner.tsx
│   │   │   ├── hero-carousel.tsx
│   │   │   └── hero-video.tsx
│   │   ├── featured-products.tsx
│   │   ├── category-grid.tsx
│   │   ├── testimonials.tsx
│   │   ├── instagram-feed.tsx
│   │   ├── newsletter-section.tsx
│   │   ├── benefits-section.tsx
│   │   └── brand-story.tsx
│   │
│   ├── product/                      # Product components
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-carousel.tsx
│   │   ├── product-gallery.tsx
│   │   ├── product-info.tsx
│   │   ├── product-variants.tsx
│   │   ├── product-quantity.tsx
│   │   ├── product-reviews.tsx
│   │   ├── product-tabs.tsx
│   │   ├── add-to-cart-button.tsx
│   │   ├── wishlist-button.tsx
│   │   ├── share-button.tsx
│   │   ├── size-guide.tsx
│   │   └── shade-finder.tsx
│   │
│   ├── cart/                         # Cart components
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   ├── cart-summary.tsx
│   │   ├── cart-empty.tsx
│   │   ├── coupon-input.tsx
│   │   └── free-shipping-bar.tsx
│   │
│   ├── checkout/                     # Checkout components
│   │   ├── checkout-form.tsx
│   │   ├── address-form.tsx
│   │   ├── address-selector.tsx
│   │   ├── payment-methods.tsx
│   │   ├── razorpay-button.tsx
│   │   ├── order-summary.tsx
│   │   ├── order-confirmation.tsx
│   │   └── cod-option.tsx
│   │
│   ├── account/                      # Account components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── otp-input.tsx
│   │   ├── profile-form.tsx
│   │   ├── address-card.tsx
│   │   ├── order-card.tsx
│   │   ├── order-timeline.tsx
│   │   └── wishlist-item.tsx
│   │
│   ├── filters/                      # Filter components
│   │   ├── product-filters.tsx
│   │   ├── price-range-filter.tsx
│   │   ├── category-filter.tsx
│   │   ├── color-filter.tsx
│   │   ├── sort-dropdown.tsx
│   │   └── active-filters.tsx
│   │
│   ├── search/                       # Search components
│   │   ├── search-modal.tsx
│   │   ├── search-results.tsx
│   │   ├── search-suggestions.tsx
│   │   └── recent-searches.tsx
│   │
│   ├── reviews/                      # Review components
│   │   ├── review-card.tsx
│   │   ├── review-list.tsx
│   │   ├── review-form.tsx
│   │   ├── rating-stars.tsx
│   │   ├── rating-summary.tsx
│   │   └── image-upload.tsx
│   │
│   ├── admin/                        # Admin components
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   ├── recent-orders.tsx
│   │   │   └── top-products.tsx
│   │   ├── products/
│   │   │   ├── product-form.tsx
│   │   │   ├── product-table.tsx
│   │   │   ├── variant-form.tsx
│   │   │   ├── image-uploader.tsx
│   │   │   └── inventory-editor.tsx
│   │   ├── orders/
│   │   │   ├── order-table.tsx
│   │   │   ├── order-detail.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── shipment-form.tsx
│   │   ├── data-table.tsx
│   │   ├── stats-card.tsx
│   │   └── date-range-picker.tsx
│   │
│   └── shared/                       # Shared components
│       ├── logo.tsx
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       ├── image-with-fallback.tsx
│       ├── price-display.tsx
│       ├── badge.tsx
│       ├── pagination.tsx
│       ├── infinite-scroll.tsx
│       ├── back-to-top.tsx
│       ├── whatsapp-button.tsx
│       └── cookie-consent.tsx
│
├── lib/                              # Utilities and configurations
│   ├── db/
│   │   ├── prisma.ts                 # Prisma client
│   │   └── queries/                  # Database queries
│   │       ├── products.ts
│   │       ├── orders.ts
│   │       ├── users.ts
│   │       └── ...
│   │
│   ├── auth/
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── auth-options.ts
│   │   └── permissions.ts
│   │
│   ├── razorpay/
│   │   ├── client.ts
│   │   ├── create-order.ts
│   │   └── verify-payment.ts
│   │
│   ├── shiprocket/
│   │   ├── client.ts
│   │   ├── create-shipment.ts
│   │   └── track-order.ts
│   │
│   ├── cloudinary/
│   │   ├── config.ts
│   │   └── upload.ts
│   │
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates/
│   │       ├── order-confirmation.tsx
│   │       ├── shipping-update.tsx
│   │       └── welcome.tsx
│   │
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── address.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                     # Class name utility
│   │   ├── format.ts                 # Formatters (price, date)
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   └── config/
│       ├── site.ts                   # Site configuration
│       ├── navigation.ts             # Nav items
│       └── seo.ts                    # Default SEO
│
├── hooks/                            # Custom React hooks
│   ├── use-cart.ts
│   ├── use-wishlist.ts
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   ├── use-media-query.ts
│   ├── use-scroll-position.ts
│   ├── use-intersection-observer.ts
│   └── use-toast.ts
│
├── stores/                           # Zustand stores
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   ├── ui-store.ts                   # Modals, drawers
│   └── filter-store.ts
│
├── types/                            # TypeScript types
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   ├── cart.ts
│   ├── api.ts
│   └── index.ts
│
├── styles/                           # Additional styles
│   └── globals.css
│
└── middleware.ts                     # Next.js middleware
```

---

## Component Design System

### Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand Colors
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',    // Primary brand color
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Semantic Colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
      },
      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-1': ['2.25rem', { lineHeight: '1.3' }],
        'heading-2': ['1.875rem', { lineHeight: '1.35' }],
        'heading-3': ['1.5rem', { lineHeight: '1.4' }],
        'heading-4': ['1.25rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0,0,0,.03), 0 2px 4px rgba(0,0,0,.05), 0 12px 24px rgba(0,0,0,.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

---

## Key Component Examples

### Product Card

```tsx
// src/components/product/product-card.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice, calculateDiscount } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'horizontal'
  showQuickAdd?: boolean
}

export function ProductCard({ 
  product, 
  variant = 'default',
  showQuickAdd = true 
}: ProductCardProps) {
  const { addItem, isLoading } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  
  const discount = calculateDiscount(product.price, product.comparePrice)
  const inWishlist = isInWishlist(product.id)
  
  return (
    <div className={cn(
      'group relative bg-white rounded-lg overflow-hidden',
      'transition-shadow duration-300 hover:shadow-card',
      variant === 'horizontal' && 'flex'
    )}>
      {/* Image */}
      <Link 
        href={`/products/${product.slug}`}
        className={cn(
          'relative block overflow-hidden bg-gray-100',
          variant === 'horizontal' ? 'w-32 h-32' : 'aspect-square'
        )}
      >
        <Image
          src={product.images[0]?.url}
          alt={product.images[0]?.alt || product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discount}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-brand-500 text-xs">New</Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
        
        {/* Quick Actions - Show on hover */}
        <div className={cn(
          'absolute inset-x-0 bottom-0 p-3',
          'bg-gradient-to-t from-black/60 to-transparent',
          'translate-y-full opacity-0 transition-all duration-300',
          'group-hover:translate-y-0 group-hover:opacity-100'
        )}>
          {showQuickAdd && product.inStock && (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                addItem(product.id, product.variants?.[0]?.id)
              }}
              disabled={isLoading}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Bag
            </Button>
          )}
        </div>
      </Link>
      
      {/* Wishlist Button */}
      <button
        onClick={() => toggleItem(product.id)}
        className={cn(
          'absolute top-2 right-2 p-2 rounded-full',
          'bg-white/80 backdrop-blur-sm shadow-sm',
          'transition-colors duration-200',
          inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        )}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
      </button>
      
      {/* Info */}
      <div className={cn(
        'p-4',
        variant === 'horizontal' && 'flex-1'
      )}>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        
        {/* Variants Preview (Colors) */}
        {product.variants && product.variants.length > 1 && (
          <div className="mt-2 flex gap-1">
            {product.variants.slice(0, 5).map((variant) => (
              <div
                key={variant.id}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: variant.attributes?.color }}
                title={variant.name}
              />
            ))}
            {product.variants.length > 5 && (
              <span className="text-xs text-gray-500">
                +{product.variants.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Cart Store (Zustand)

```typescript
// src/stores/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  image: string
  price: number
  quantity: number
  variant?: {
    name: string
    attributes: Record<string, string>
  }
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  coupon: { code: string; discount: number } | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed
  itemCount: () => number
  subtotal: () => number
  discount: () => number
  shipping: () => number
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      coupon: null,
      
      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          
          if (existingIndex > -1) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += item.quantity
            return { items: newItems, isOpen: true }
          }
          
          return {
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
            isOpen: true,
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },
      
      clearCart: () => set({ items: [], coupon: null }),
      
      applyCoupon: async (code) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/v1/cart/apply-coupon', {
            method: 'POST',
            body: JSON.stringify({ code }),
          })
          const data = await res.json()
          if (data.success) {
            set({ coupon: { code, discount: data.discount } })
          } else {
            throw new Error(data.error)
          }
        } finally {
          set({ isLoading: false })
        }
      },
      
      removeCoupon: () => set({ coupon: null }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      // Computed values
      itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      subtotal: () => 
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      
      discount: () => get().coupon?.discount || 0,
      
      shipping: () => {
        const subtotal = get().subtotal()
        return subtotal >= 499 ? 0 : 49  // Free shipping above ₹499
      },
      
      total: () => {
        const subtotal = get().subtotal()
        const discount = get().discount()
        const shipping = get().shipping()
        return subtotal - discount + shipping
      },
    }),
    {
      name: 'graphh-cart',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
)
```

---

## Page Examples

### Homepage

```tsx
// src/app/(marketing)/page.tsx
import { Suspense } from 'react'
import { HeroBanner } from '@/components/marketing/hero/hero-banner'
import { CategoryGrid } from '@/components/marketing/category-grid'
import { FeaturedProducts } from '@/components/marketing/featured-products'
import { BestsellersCarousel } from '@/components/marketing/bestsellers-carousel'
import { Testimonials } from '@/components/marketing/testimonials'
import { InstagramFeed } from '@/components/marketing/instagram-feed'
import { NewsletterSection } from '@/components/marketing/newsletter-section'
import { ProductGridSkeleton } from '@/components/product/product-grid-skeleton'
import { getBanners, getCategories } from '@/lib/db/queries'

export default async function HomePage() {
  const [banners, categories] = await Promise.all([
    getBanners(),
    getCategories(),
  ])
  
  return (
    <main>
      {/* Hero Section */}
      <HeroBanner banners={banners} />
      
      {/* Shop by Category */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-heading-2 font-display text-center mb-10">
            Shop by Category
          </h2>
          <CategoryGrid categories={categories} />
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-heading-2 font-display text-center mb-10">
            Featured Products
          </h2>
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>
      
      {/* Bestsellers */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-heading-2 font-display text-center mb-10">
            Bestsellers
          </h2>
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <BestsellersCarousel />
          </Suspense>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-brand-50">
        <div className="container">
          <h2 className="text-heading-2 font-display text-center mb-10">
            What Our Customers Say
          </h2>
          <Testimonials />
        </div>
      </section>
      
      {/* Instagram Feed */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-heading-2 font-display text-center mb-4">
            Follow Us @graphhcosmetics
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Tag us in your looks for a chance to be featured
          </p>
          <InstagramFeed />
        </div>
      </section>
      
      {/* Newsletter */}
      <NewsletterSection />
    </main>
  )
}
```

---

## State Management

| State Type | Solution | Use Case |
|------------|----------|----------|
| Server State | React Query / SWR | API data, products, orders |
| Client State | Zustand | Cart, wishlist, UI state |
| Form State | React Hook Form | Forms with validation |
| URL State | nuqs | Filters, search, pagination |
| Auth State | NextAuth | User session |

---

## Performance Optimizations

1. **Image Optimization**
   - Next.js Image with Cloudinary
   - Responsive sizes
   - Lazy loading
   - Blur placeholders

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic)

3. **Caching Strategy**
   - ISR for product pages (60s revalidation)
   - Static for marketing pages
   - SWR for client-side data

4. **Bundle Optimization**
   - Tree shaking
   - Minimal dependencies
   - Lazy load below-fold content

---

## SEO Implementation

```tsx
// src/app/(shop)/products/[slug]/page.tsx
import { Metadata } from 'next'
import { getProduct } from '@/lib/db/queries'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  if (!product) return {}
  
  return {
    title: product.seo?.metaTitle || `${product.name} | Graphh Cosmetics`,
    description: product.seo?.metaDescription || product.shortDesc,
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      images: [{ url: product.images[0]?.url }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDesc,
      images: [product.images[0]?.url],
    },
  }
}

// JSON-LD for rich snippets
function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(i => i.url),
    brand: {
      '@type': 'Brand',
      name: 'Graphh Cosmetics',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://graphh.com/products/${product.slug}`,
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

Mobile-first approach with progressive enhancement.
