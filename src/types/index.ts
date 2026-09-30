// Re-export Prisma types
export type {
  User,
  Product,
  ProductVariant,
  Category,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Review,
  Address,
  Cart,
  Coupon,
  Banner,
  SupportTicket,
  UserRole,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  AddressType,
  CouponType,
  TicketStatus,
  TicketPriority,
} from '@prisma/client'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Cart Item type
export interface CartItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  price: number
  product: {
    id: string
    name: string
    slug: string
    image: string
  }
  variant?: {
    id: string
    name: string
    sku: string
    attributes: Record<string, any>
  } | null
}

// Product with relations
export interface ProductWithDetails {
  id: string
  slug: string
  name: string
  description?: string | null
  shortDesc?: string | null
  price: number
  comparePrice?: number | null
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
  sku?: string | null
  inventory: number
  hasVariants: boolean
  variants: {
    id: string
    name: string
    sku: string
    price?: number | null
    inventory: number
    attributes: Record<string, any>
    image?: string | null
  }[]
  ingredients?: string | null
  howToUse?: string | null
  benefits: string[]
  rating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  isNewArrival: boolean
  isBestseller: boolean
}

// Order with relations
export interface OrderWithDetails {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    name: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  items: {
    id: string
    name: string
    sku?: string
    image?: string
    quantity: number
    price: number
    total: number
    attributes?: Record<string, any>
  }[]
  payment?: {
    status: string
    method?: string
    paidAt?: string
  } | null
  shipment?: {
    status: string
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: string
  } | null
  couponCode?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

// Dashboard Stats
export interface DashboardStats {
  revenue: {
    value: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
  orders: {
    value: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
  customers: {
    value: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
  avgOrderValue: {
    value: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
}
