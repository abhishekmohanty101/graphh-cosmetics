import { z } from 'zod'

// ============================================
// AUTH VALIDATIONS
// ============================================

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  email: z
    .string()
    .email('Please enter a valid email')
    .toLowerCase()
    .transform((v) => v.trim()),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

// ============================================
// PRODUCT VALIDATIONS
// ============================================

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
  description: z.string().optional(),
  shortDesc: z.string().max(500).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().cuid('Invalid category'),
  tags: z.array(z.string()).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  inventory: z.coerce.number().int().min(0).default(0),
  lowStockAlert: z.coerce.number().int().min(0).default(10),
  trackInventory: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
})

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive().optional().nullable(),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  inventory: z.coerce.number().int().min(0).default(0),
  attributes: z.record(z.any()),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
})

// ============================================
// CATEGORY VALIDATIONS
// ============================================

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
})

// ============================================
// ADDRESS VALIDATIONS
// ============================================

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  country: z.string().max(100).default('India'),
  type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  isDefault: z.boolean().default(false),
})

// ============================================
// ORDER VALIDATIONS
// ============================================

export const checkoutSchema = z.object({
  addressId: z.string().cuid('Please select a delivery address'),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  giftMessage: z.string().max(200).optional(),
})

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'RETURN_REQUESTED',
    'RETURNED',
  ]),
  note: z.string().optional(),
})

// ============================================
// REVIEW VALIDATIONS
// ============================================

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
})

// ============================================
// COUPON VALIDATIONS
// ============================================

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.coerce.number().positive(),
  minPurchase: z.coerce.number().positive().optional().nullable(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().default(1),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  categories: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  excludeProducts: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

// ============================================
// SUPPORT TICKET VALIDATIONS
// ============================================

export const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject is too short').max(200),
  message: z.string().min(20, 'Please provide more details').max(2000),
  orderId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})

export const ticketReplySchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
})

// ============================================
// CART VALIDATIONS
// ============================================

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(10),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(10),
})

// ============================================
// NEWSLETTER VALIDATIONS
// ============================================

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
})

// ============================================
// TYPES
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type SupportTicketInput = z.infer<typeof supportTicketSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
