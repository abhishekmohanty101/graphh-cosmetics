# Database Schema Design

## Overview

PostgreSQL database hosted on Supabase with Prisma ORM for type-safe queries.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Product    │       │   Category   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ slug         │       │ name         │
│ phone        │       │ name         │       │ slug         │
│ name         │       │ description  │       │ image        │
│ passwordHash │       │ price        │       │ parentId     │
│ avatar       │       │ comparePrice │       └──────┬───────┘
│ isVerified   │       │ categoryId ──┼─────────────┘
│ role         │       │ images       │
│ createdAt    │       │ inventory    │
│ updatedAt    │       │ isActive     │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │    ┌─────────────────┼─────────────────┐
       │    │                 │                 │
       ▼    ▼                 ▼                 ▼
┌──────────────┐       ┌──────────────┐   ┌──────────────┐
│   Address    │       │   Variant    │   │    Review    │
├──────────────┤       ├──────────────┤   ├──────────────┤
│ id           │       │ id           │   │ id           │
│ userId ──────┤       │ productId ───┤   │ userId ──────┤
│ name         │       │ name         │   │ productId ───┤
│ phone        │       │ sku          │   │ rating       │
│ line1        │       │ price        │   │ title        │
│ line2        │       │ inventory    │   │ comment      │
│ city         │       │ attributes   │   │ images       │
│ state        │       └──────────────┘   │ isVerified   │
│ pincode      │                          └──────────────┘
│ isDefault    │
└──────────────┘
       │
       │
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Order     │       │  OrderItem   │       │   Payment    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ orderNumber  │       │ orderId ─────┼───────┤ orderId ─────┤
│ userId ──────┤       │ productId    │       │ razorpayId   │
│ addressId    │       │ variantId    │       │ amount       │
│ status       │       │ quantity     │       │ currency     │
│ subtotal     │       │ price        │       │ status       │
│ discount     │       │ total        │       │ method       │
│ shipping     │       └──────────────┘       │ paidAt       │
│ tax          │                              └──────────────┘
│ total        │
│ notes        │       ┌──────────────┐       ┌──────────────┐
│ createdAt    │       │   Shipment   │       │    Coupon    │
└──────────────┘       ├──────────────┤       ├──────────────┤
                       │ id           │       │ id           │
                       │ orderId ─────┤       │ code         │
                       │ trackingId   │       │ type         │
                       │ carrier      │       │ value        │
                       │ status       │       │ minPurchase  │
                       │ estimatedAt  │       │ maxDiscount  │
                       │ deliveredAt  │       │ usageLimit   │
                       └──────────────┘       │ validFrom    │
                                              │ validUntil   │
┌──────────────┐       ┌──────────────┐       └──────────────┘
│   Wishlist   │       │     Cart     │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ userId ──────┤       │ userId ──────┤
│ productId    │       │ items (JSON) │
│ variantId    │       │ updatedAt    │
│ createdAt    │       └──────────────┘
└──────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  name          String?
  passwordHash  String?
  avatar        String?
  isVerified    Boolean   @default(false)
  role          UserRole  @default(CUSTOMER)
  
  // Relations
  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  wishlist      WishlistItem[]
  cart          Cart?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // OAuth accounts
  accounts      Account[]
  sessions      Session[]

  @@index([email])
  @@index([phone])
}

enum UserRole {
  CUSTOMER
  ADMIN
  MANAGER
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// ADDRESS
// ============================================

model Address {
  id          String   @id @default(cuid())
  userId      String
  
  name        String
  phone       String
  line1       String
  line2       String?
  landmark    String?
  city        String
  state       String
  pincode     String
  country     String   @default("India")
  
  type        AddressType @default(HOME)
  isDefault   Boolean  @default(false)
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([pincode])
}

enum AddressType {
  HOME
  WORK
  OTHER
}

// ============================================
// PRODUCT CATALOG
// ============================================

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  
  parentId    String?
  parent      Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryChildren")
  
  products    Product[]
  
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
  @@index([parentId])
}

model Product {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  description   String?   @db.Text
  shortDesc     String?
  
  // Pricing
  price         Decimal   @db.Decimal(10, 2)
  comparePrice  Decimal?  @db.Decimal(10, 2)
  costPrice     Decimal?  @db.Decimal(10, 2)
  
  // Media
  images        String[]
  
  // Categorization
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  tags          String[]
  
  // Inventory
  sku           String?   @unique
  barcode       String?
  inventory     Int       @default(0)
  lowStockAlert Int       @default(10)
  trackInventory Boolean  @default(true)
  
  // Variants
  hasVariants   Boolean   @default(false)
  variants      ProductVariant[]
  
  // Product details
  ingredients   String?   @db.Text
  howToUse      String?   @db.Text
  benefits      String[]
  
  // SEO
  metaTitle     String?
  metaDesc      String?
  
  // Status
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  
  // Relations
  reviews       Review[]
  wishlistItems WishlistItem[]
  orderItems    OrderItem[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([slug])
  @@index([categoryId])
  @@index([isActive, isFeatured])
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  name        String   // e.g., "Ruby Red", "30ml"
  sku         String   @unique
  
  // Pricing (overrides product price if set)
  price       Decimal? @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2)
  
  // Inventory
  inventory   Int      @default(0)
  
  // Attributes (color, size, shade, etc.)
  attributes  Json     // { "color": "#FF0000", "shade": "Ruby Red", "size": "30ml" }
  
  // Media
  image       String?
  
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  // Relations
  wishlistItems WishlistItem[]
  orderItems    OrderItem[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
  @@index([sku])
}

// ============================================
// REVIEWS
// ============================================

model Review {
  id          String   @id @default(cuid())
  userId      String
  productId   String
  
  rating      Int      // 1-5
  title       String?
  comment     String?  @db.Text
  images      String[]
  
  isVerified  Boolean  @default(false) // Verified purchase
  isApproved  Boolean  @default(false) // Admin approved
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, productId])
  @@index([productId])
  @@index([isApproved])
}

// ============================================
// WISHLIST
// ============================================

model WishlistItem {
  id          String   @id @default(cuid())
  userId      String
  productId   String
  variantId   String?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  
  createdAt   DateTime @default(now())

  @@unique([userId, productId, variantId])
  @@index([userId])
}

// ============================================
// CART (JSON-based for flexibility)
// ============================================

model Cart {
  id          String   @id @default(cuid())
  userId      String   @unique
  
  // Items stored as JSON for flexibility
  // [{ productId, variantId, quantity, price }]
  items       Json     @default("[]")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  updatedAt   DateTime @updatedAt
}

// ============================================
// ORDERS
// ============================================

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  // Shipping Address (snapshot)
  addressId     String?
  address       Address?    @relation(fields: [addressId], references: [id])
  shippingAddress Json      // Snapshot of address at order time
  
  // Order Items
  items         OrderItem[]
  
  // Pricing
  subtotal      Decimal     @db.Decimal(10, 2)
  discount      Decimal     @default(0) @db.Decimal(10, 2)
  shipping      Decimal     @default(0) @db.Decimal(10, 2)
  tax           Decimal     @default(0) @db.Decimal(10, 2)
  total         Decimal     @db.Decimal(10, 2)
  
  // Coupon
  couponId      String?
  coupon        Coupon?     @relation(fields: [couponId], references: [id])
  couponCode    String?
  
  // Status
  status        OrderStatus @default(PENDING)
  
  // Payment
  payment       Payment?
  
  // Shipment
  shipment      Shipment?
  
  // Additional
  notes         String?
  giftMessage   String?
  
  // Invoice
  invoiceNumber String?
  invoiceUrl    String?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING         // Order created, awaiting payment
  CONFIRMED       // Payment received
  PROCESSING      // Being prepared
  SHIPPED         // Handed to courier
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
  RETURN_REQUESTED
  RETURNED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  
  // Snapshot at order time
  name        String
  sku         String?
  image       String?
  attributes  Json?
  
  quantity    Int
  price       Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
  
  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([productId])
}

// ============================================
// PAYMENTS (Razorpay)
// ============================================

model Payment {
  id              String        @id @default(cuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Razorpay IDs
  razorpayOrderId   String      @unique
  razorpayPaymentId String?     @unique
  razorpaySignature String?
  
  // Amount
  amount          Int           // In paise (₹999 = 99900)
  currency        String        @default("INR")
  
  // Status
  status          PaymentStatus @default(PENDING)
  
  // Payment method details
  method          String?       // upi, card, netbanking, wallet
  bank            String?
  wallet          String?
  vpa             String?       // UPI VPA
  cardLast4       String?
  cardNetwork     String?       // Visa, Mastercard, etc.
  
  // Refund
  refundId        String?
  refundAmount    Int?
  refundStatus    String?
  
  // Metadata
  errorCode       String?
  errorDescription String?
  
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([razorpayOrderId])
  @@index([razorpayPaymentId])
  @@index([status])
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

// ============================================
// SHIPMENTS
// ============================================

model Shipment {
  id              String         @id @default(cuid())
  orderId         String         @unique
  order           Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Shiprocket
  shiprocketOrderId   String?
  shiprocketShipmentId String?
  
  // Tracking
  trackingNumber  String?
  trackingUrl     String?
  carrier         String?        // Delhivery, BlueDart, etc.
  
  // Status
  status          ShipmentStatus @default(PENDING)
  
  // Dates
  pickedAt        DateTime?
  shippedAt       DateTime?
  estimatedDelivery DateTime?
  deliveredAt     DateTime?
  
  // Weight & Dimensions
  weight          Decimal?       @db.Decimal(10, 2) // in kg
  length          Decimal?       @db.Decimal(10, 2) // in cm
  breadth         Decimal?       @db.Decimal(10, 2)
  height          Decimal?       @db.Decimal(10, 2)
  
  // COD
  isCOD           Boolean        @default(false)
  codAmount       Decimal?       @db.Decimal(10, 2)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([trackingNumber])
  @@index([status])
}

enum ShipmentStatus {
  PENDING
  PROCESSING
  PICKED
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
  RETURNED
  CANCELLED
}

// ============================================
// COUPONS
// ============================================

model Coupon {
  id            String      @id @default(cuid())
  code          String      @unique
  
  type          CouponType
  value         Decimal     @db.Decimal(10, 2) // Percentage or fixed amount
  
  // Constraints
  minPurchase   Decimal?    @db.Decimal(10, 2)
  maxDiscount   Decimal?    @db.Decimal(10, 2) // Max discount for percentage
  
  // Usage limits
  usageLimit    Int?        // Total usage limit
  usageCount    Int         @default(0)
  perUserLimit  Int         @default(1)
  
  // Validity
  validFrom     DateTime
  validUntil    DateTime
  
  // Restrictions
  categories    String[]    // Applicable category IDs
  products      String[]    // Applicable product IDs
  excludeProducts String[]  // Excluded product IDs
  
  // Status
  isActive      Boolean     @default(true)
  
  orders        Order[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([code])
  @@index([isActive, validFrom, validUntil])
}

enum CouponType {
  PERCENTAGE
  FIXED
  FREE_SHIPPING
}

// ============================================
// NEWSLETTER
// ============================================

model Subscriber {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============================================
// AUDIT LOG (for admin actions)
// ============================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  entity      String
  entityId    String
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

---

## Database Indexes Strategy

```sql
-- Performance indexes (already defined in Prisma schema via @@index)

-- Additional composite indexes for common queries
CREATE INDEX idx_products_category_active ON "Product"("categoryId", "isActive");
CREATE INDEX idx_orders_user_status ON "Order"("userId", "status");
CREATE INDEX idx_orders_date_status ON "Order"("createdAt" DESC, "status");

-- Full-text search for products
CREATE INDEX idx_products_search ON "Product" USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON "Order"
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can view own addresses" ON "Address"
  FOR ALL USING (auth.uid() = "userId");

-- Products are public
CREATE POLICY "Products are public" ON "Product"
  FOR SELECT USING ("isActive" = true);
```

---

## Data Migration Strategy

### Initial Seed Data

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Lips', slug: 'lips', sortOrder: 1 },
      { name: 'Eyes', slug: 'eyes', sortOrder: 2 },
      { name: 'Face', slug: 'face', sortOrder: 3 },
      { name: 'Skincare', slug: 'skincare', sortOrder: 4 },
      { name: 'Nails', slug: 'nails', sortOrder: 5 },
      { name: 'Combos', slug: 'combos', sortOrder: 6 },
    ]
  })

  // Seed admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@yourbrand.com',
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    }
  })

  console.log('Database seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Backup Strategy

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Point-in-time | Continuous | 7 days | Supabase automatic |
| Daily snapshot | Daily at 2 AM IST | 30 days | Supabase automatic |
| Weekly export | Sunday 3 AM IST | 90 days | Custom script to S3 |
| Monthly archive | 1st of month | 1 year | Encrypted to Glacier |

---

## Database Scaling Plan

| Stage | Users | Orders/month | Strategy |
|-------|-------|--------------|----------|
| Launch | 0-10K | 0-1K | Supabase Free/Pro |
| Growth | 10K-100K | 1K-10K | Supabase Pro + Read replicas |
| Scale | 100K+ | 10K+ | Supabase Team + Connection pooling |
