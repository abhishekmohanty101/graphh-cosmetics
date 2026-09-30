# Complete API Architecture

## Overview

Full API documentation for Customer, Admin, and Employee portals.

**Production Domains:**
- Main Site: `https://graphh.com` / `https://graphh.in`
- API Base: `https://api.graphh.com`
- Admin Panel: `https://admin.graphh.com`
- Employee Portal: `https://staff.graphh.com`

---

## API Structure Overview

```
src/app/api/
│
├── v1/
│   │
│   ├── ============== PUBLIC APIs (No Auth) ==============
│   ├── products/
│   │   ├── route.ts                    # GET: List products
│   │   ├── [slug]/route.ts             # GET: Product details
│   │   ├── featured/route.ts           # GET: Featured products
│   │   ├── bestsellers/route.ts        # GET: Best selling
│   │   ├── new-arrivals/route.ts       # GET: New arrivals
│   │   └── search/route.ts             # GET: Search products
│   │
│   ├── categories/
│   │   ├── route.ts                    # GET: All categories
│   │   └── [slug]/route.ts             # GET: Category products
│   │
│   ├── collections/
│   │   ├── route.ts                    # GET: All collections
│   │   └── [slug]/route.ts             # GET: Collection products
│   │
│   ├── reviews/
│   │   └── [productId]/route.ts        # GET: Product reviews
│   │
│   ├── banners/route.ts                # GET: Homepage banners
│   ├── testimonials/route.ts           # GET: Customer testimonials
│   ├── faq/route.ts                    # GET: FAQs
│   │
│   │
│   ├── ============== CUSTOMER APIs (Auth Required) ==============
│   ├── auth/
│   │   ├── [...nextauth]/route.ts      # NextAuth handlers
│   │   ├── register/route.ts           # POST: Register
│   │   ├── login/route.ts              # POST: Login
│   │   ├── logout/route.ts             # POST: Logout
│   │   ├── send-otp/route.ts           # POST: Send OTP
│   │   ├── verify-otp/route.ts         # POST: Verify OTP
│   │   ├── forgot-password/route.ts    # POST: Forgot password
│   │   ├── reset-password/route.ts     # POST: Reset password
│   │   └── refresh-token/route.ts      # POST: Refresh token
│   │
│   ├── user/
│   │   ├── profile/route.ts            # GET, PATCH: Profile
│   │   ├── change-password/route.ts    # POST: Change password
│   │   ├── addresses/
│   │   │   ├── route.ts                # GET, POST: Addresses
│   │   │   └── [id]/route.ts           # GET, PATCH, DELETE
│   │   └── preferences/route.ts        # GET, PATCH: Preferences
│   │
│   ├── cart/
│   │   ├── route.ts                    # GET, POST, DELETE: Cart
│   │   ├── items/[id]/route.ts         # PATCH, DELETE: Cart item
│   │   ├── apply-coupon/route.ts       # POST: Apply coupon
│   │   └── remove-coupon/route.ts      # POST: Remove coupon
│   │
│   ├── wishlist/
│   │   ├── route.ts                    # GET, POST: Wishlist
│   │   └── [id]/route.ts               # DELETE: Remove item
│   │
│   ├── checkout/
│   │   ├── route.ts                    # POST: Create order
│   │   ├── verify/route.ts             # POST: Verify payment
│   │   ├── cod/route.ts                # POST: COD order
│   │   └── estimate-shipping/route.ts  # POST: Shipping estimate
│   │
│   ├── orders/
│   │   ├── route.ts                    # GET: My orders
│   │   ├── [id]/route.ts               # GET: Order details
│   │   ├── [id]/cancel/route.ts        # POST: Cancel order
│   │   ├── [id]/return/route.ts        # POST: Return request
│   │   └── [id]/track/route.ts         # GET: Track shipment
│   │
│   ├── reviews/
│   │   ├── route.ts                    # POST: Add review
│   │   └── [id]/route.ts               # PATCH, DELETE: My review
│   │
│   ├── support/
│   │   ├── tickets/route.ts            # GET, POST: Support tickets
│   │   └── tickets/[id]/route.ts       # GET, POST: Ticket details
│   │
│   ├── notifications/
│   │   ├── route.ts                    # GET: My notifications
│   │   └── [id]/read/route.ts          # POST: Mark as read
│   │
│   │
│   ├── ============== WEBHOOKS ==============
│   ├── webhooks/
│   │   ├── razorpay/route.ts           # Razorpay events
│   │   ├── shiprocket/route.ts         # Shipping updates
│   │   └── sanity/route.ts             # CMS content updates
│   │
│   │
│   ├── ============== EMPLOYEE APIs (Staff Auth) ==============
│   ├── employee/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # POST: Employee login
│   │   │   └── logout/route.ts         # POST: Employee logout
│   │   │
│   │   ├── dashboard/route.ts          # GET: Dashboard stats
│   │   │
│   │   ├── orders/
│   │   │   ├── route.ts                # GET: Orders list
│   │   │   ├── [id]/route.ts           # GET, PATCH: Order details
│   │   │   ├── [id]/status/route.ts    # PATCH: Update status
│   │   │   ├── [id]/notes/route.ts     # POST: Add internal note
│   │   │   └── pending/route.ts        # GET: Pending orders
│   │   │
│   │   ├── products/
│   │   │   ├── route.ts                # GET: Products list
│   │   │   ├── [id]/inventory/route.ts # PATCH: Update inventory
│   │   │   └── low-stock/route.ts      # GET: Low stock items
│   │   │
│   │   ├── customers/
│   │   │   ├── route.ts                # GET: Customers list
│   │   │   ├── [id]/route.ts           # GET: Customer details
│   │   │   └── [id]/orders/route.ts    # GET: Customer orders
│   │   │
│   │   ├── reviews/
│   │   │   ├── route.ts                # GET: All reviews
│   │   │   ├── pending/route.ts        # GET: Pending reviews
│   │   │   └── [id]/approve/route.ts   # POST: Approve review
│   │   │
│   │   ├── support/
│   │   │   ├── tickets/route.ts        # GET: Support tickets
│   │   │   └── tickets/[id]/route.ts   # GET, PATCH: Ticket
│   │   │
│   │   └── returns/
│   │       ├── route.ts                # GET: Return requests
│   │       └── [id]/route.ts           # GET, PATCH: Process return
│   │
│   │
│   └── ============== ADMIN APIs (Admin Auth) ==============
│       admin/
│       ├── auth/
│       │   ├── login/route.ts          # POST: Admin login
│       │   └── logout/route.ts         # POST: Admin logout
│       │
│       ├── dashboard/
│       │   ├── route.ts                # GET: Dashboard overview
│       │   ├── sales/route.ts          # GET: Sales analytics
│       │   ├── revenue/route.ts        # GET: Revenue data
│       │   └── trends/route.ts         # GET: Trends analysis
│       │
│       ├── products/
│       │   ├── route.ts                # GET, POST: Products
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   ├── [id]/images/route.ts    # POST, DELETE: Images
│       │   ├── [id]/variants/route.ts  # POST: Add variant
│       │   ├── bulk-upload/route.ts    # POST: Bulk upload
│       │   ├── export/route.ts         # GET: Export products
│       │   └── import/route.ts         # POST: Import products
│       │
│       ├── categories/
│       │   ├── route.ts                # GET, POST: Categories
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   └── reorder/route.ts        # POST: Reorder
│       │
│       ├── collections/
│       │   ├── route.ts                # GET, POST: Collections
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   └── [id]/products/route.ts  # POST, DELETE: Products
│       │
│       ├── orders/
│       │   ├── route.ts                # GET: All orders
│       │   ├── [id]/route.ts           # GET, PATCH: Order
│       │   ├── [id]/refund/route.ts    # POST: Process refund
│       │   ├── [id]/ship/route.ts      # POST: Create shipment
│       │   └── export/route.ts         # GET: Export orders
│       │
│       ├── customers/
│       │   ├── route.ts                # GET: All customers
│       │   ├── [id]/route.ts           # GET, PATCH: Customer
│       │   ├── [id]/block/route.ts     # POST: Block customer
│       │   └── export/route.ts         # GET: Export customers
│       │
│       ├── employees/
│       │   ├── route.ts                # GET, POST: Employees
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   ├── [id]/permissions/route.ts # PATCH: Permissions
│       │   └── roles/route.ts          # GET, POST: Roles
│       │
│       ├── coupons/
│       │   ├── route.ts                # GET, POST: Coupons
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   └── [id]/usage/route.ts     # GET: Usage stats
│       │
│       ├── reviews/
│       │   ├── route.ts                # GET: All reviews
│       │   ├── [id]/route.ts           # GET, DELETE: Review
│       │   └── [id]/approve/route.ts   # POST: Approve
│       │
│       ├── banners/
│       │   ├── route.ts                # GET, POST: Banners
│       │   ├── [id]/route.ts           # GET, PATCH, DELETE
│       │   └── reorder/route.ts        # POST: Reorder
│       │
│       ├── pages/
│       │   ├── route.ts                # GET, POST: Pages
│       │   └── [slug]/route.ts         # GET, PATCH, DELETE
│       │
│       ├── settings/
│       │   ├── general/route.ts        # GET, PATCH: General
│       │   ├── shipping/route.ts       # GET, PATCH: Shipping
│       │   ├── payment/route.ts        # GET, PATCH: Payment
│       │   ├── tax/route.ts            # GET, PATCH: Tax/GST
│       │   ├── email/route.ts          # GET, PATCH: Email
│       │   └── seo/route.ts            # GET, PATCH: SEO
│       │
│       ├── reports/
│       │   ├── sales/route.ts          # GET: Sales report
│       │   ├── products/route.ts       # GET: Product report
│       │   ├── customers/route.ts      # GET: Customer report
│       │   ├── inventory/route.ts      # GET: Inventory report
│       │   └── tax/route.ts            # GET: Tax report
│       │
│       ├── inventory/
│       │   ├── route.ts                # GET: All inventory
│       │   ├── [id]/route.ts           # PATCH: Update stock
│       │   ├── adjustments/route.ts    # GET, POST: Adjustments
│       │   └── alerts/route.ts         # GET: Stock alerts
│       │
│       ├── shipping/
│       │   ├── zones/route.ts          # GET, POST: Zones
│       │   ├── rates/route.ts          # GET, POST: Rates
│       │   └── carriers/route.ts       # GET, PATCH: Carriers
│       │
│       ├── media/
│       │   ├── route.ts                # GET, POST: Media library
│       │   ├── [id]/route.ts           # DELETE: Delete media
│       │   └── folders/route.ts        # GET, POST: Folders
│       │
│       └── audit-logs/route.ts         # GET: Audit logs
```

---

## Detailed API Specifications

---

# PART 1: PUBLIC APIs

## Products

### GET `/api/v1/products`
List all active products with filters.

```typescript
// Query Parameters
interface ProductListParams {
  category?: string          // Category slug
  collection?: string        // Collection slug
  search?: string           // Search term
  minPrice?: number         // Min price filter
  maxPrice?: number         // Max price filter
  tags?: string             // Comma-separated tags
  inStock?: boolean         // Only in-stock items
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number             // Default: 1
  limit?: number            // Default: 12, Max: 48
}

// Response 200
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_abc123",
        "slug": "matte-lipstick-ruby-red",
        "name": "Matte Lipstick - Ruby Red",
        "shortDesc": "Long-lasting matte finish lipstick",
        "price": 599,
        "comparePrice": 799,
        "discount": 25,                    // Percentage
        "images": [
          {
            "url": "https://res.cloudinary.com/graphh/...",
            "alt": "Ruby Red Lipstick Front"
          }
        ],
        "category": {
          "name": "Lips",
          "slug": "lips"
        },
        "rating": 4.5,
        "reviewCount": 234,
        "inStock": true,
        "isNew": true,
        "isBestseller": false,
        "variants": [
          {
            "id": "var_001",
            "name": "Ruby Red",
            "color": "#CC0000",
            "inStock": true
          },
          {
            "id": "var_002", 
            "name": "Berry Pink",
            "color": "#E91E63",
            "inStock": true
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 156,
      "totalPages": 13,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "priceRange": { "min": 199, "max": 2999 },
      "categories": [...],
      "tags": [...]
    }
  }
}
```

### GET `/api/v1/products/[slug]`
Get complete product details.

```typescript
// Response 200
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "slug": "matte-lipstick-ruby-red",
    "name": "Matte Lipstick - Ruby Red",
    "description": "<p>Full HTML description...</p>",
    "shortDesc": "Long-lasting matte finish lipstick",
    
    "price": 599,
    "comparePrice": 799,
    "discount": 25,
    
    "images": [
      {
        "id": "img_001",
        "url": "https://res.cloudinary.com/graphh/image/upload/v1/products/lipstick-ruby-1.jpg",
        "thumbnailUrl": "https://res.cloudinary.com/graphh/image/upload/c_thumb,w_200/v1/products/lipstick-ruby-1.jpg",
        "alt": "Ruby Red Lipstick - Front View",
        "isPrimary": true
      },
      {
        "id": "img_002",
        "url": "https://res.cloudinary.com/graphh/image/upload/v1/products/lipstick-ruby-2.jpg",
        "thumbnailUrl": "...",
        "alt": "Ruby Red Lipstick - Swatch",
        "isPrimary": false
      }
    ],
    
    "category": {
      "id": "cat_lips",
      "name": "Lips",
      "slug": "lips",
      "breadcrumb": [
        { "name": "Home", "slug": "/" },
        { "name": "Makeup", "slug": "/makeup" },
        { "name": "Lips", "slug": "/category/lips" }
      ]
    },
    
    "tags": ["matte", "long-lasting", "cruelty-free"],
    
    "hasVariants": true,
    "variants": [
      {
        "id": "var_001",
        "name": "Ruby Red",
        "sku": "LIP-MAT-RUBY-001",
        "price": 599,
        "comparePrice": 799,
        "inventory": 45,
        "inStock": true,
        "attributes": {
          "color": "#CC0000",
          "colorName": "Ruby Red"
        },
        "image": "https://..."
      },
      {
        "id": "var_002",
        "name": "Berry Pink",
        "sku": "LIP-MAT-BERRY-001",
        "price": 599,
        "comparePrice": 799,
        "inventory": 0,
        "inStock": false,
        "attributes": {
          "color": "#E91E63",
          "colorName": "Berry Pink"
        },
        "image": "https://..."
      }
    ],
    
    "details": {
      "ingredients": "Isododecane, Dimethicone, Trimethylsiloxysilicate...",
      "howToUse": "Apply directly to lips starting from the center...",
      "benefits": [
        "12-hour long wear",
        "Transfer-proof formula",
        "Enriched with Vitamin E",
        "Cruelty-free & Vegan"
      ],
      "specifications": {
        "Weight": "4.5g",
        "Finish": "Matte",
        "Coverage": "Full"
      }
    },
    
    "seo": {
      "metaTitle": "Ruby Red Matte Lipstick | Graphh Cosmetics",
      "metaDescription": "Shop our bestselling Ruby Red Matte Lipstick..."
    },
    
    "rating": 4.5,
    "reviewCount": 234,
    "reviews": [
      // Latest 5 reviews
      {
        "id": "rev_001",
        "user": { "name": "Priya S.", "avatar": null },
        "rating": 5,
        "title": "Best lipstick ever!",
        "comment": "Amazing color payoff and stays all day...",
        "images": [],
        "isVerified": true,
        "createdAt": "2024-01-10T10:30:00Z",
        "helpful": 24
      }
    ],
    
    "relatedProducts": [
      // 4-6 related products (minimal data)
    ],
    
    "recentlyViewed": [
      // From cookie/session
    ],
    
    "inventory": {
      "inStock": true,
      "quantity": 45,           // Only shown if low
      "lowStock": true,         // < 10 items
      "backorder": false
    },
    
    "shipping": {
      "freeShipping": true,     // If order > ₹499
      "estimatedDays": "3-5",
      "codAvailable": true
    },
    
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

# PART 2: CUSTOMER APIs

## Authentication

### POST `/api/v1/auth/register`

```typescript
// Request
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!"
}

// Response 201
{
  "success": true,
  "message": "OTP sent to your phone number",
  "data": {
    "userId": "user_abc123",
    "phone": "98****3210",
    "otpExpiry": "2024-01-15T10:35:00Z"
  }
}

// Validation Errors 400
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Email already registered" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### POST `/api/v1/auth/login`

```typescript
// Request (Email + Password)
{
  "email": "priya@example.com",
  "password": "SecurePass123!"
}

// OR Request (Phone + OTP)
{
  "phone": "9876543210",
  "otp": "123456"
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "9876543210",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

## Cart

### POST `/api/v1/cart`
Add item to cart.

```typescript
// Request
{
  "productId": "prod_abc123",
  "variantId": "var_001",      // Required if product has variants
  "quantity": 2
}

// Response 200
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": {
      "id": "cart_xyz",
      "items": [
        {
          "id": "item_001",
          "productId": "prod_abc123",
          "variantId": "var_001",
          "product": {
            "name": "Matte Lipstick - Ruby Red",
            "slug": "matte-lipstick-ruby-red",
            "image": "https://..."
          },
          "variant": {
            "name": "Ruby Red",
            "sku": "LIP-MAT-RUBY-001",
            "attributes": { "color": "#CC0000" }
          },
          "quantity": 2,
          "price": 599,
          "total": 1198
        }
      ],
      "itemCount": 2,
      "subtotal": 1198,
      "discount": 0,
      "shipping": 0,           // Free above ₹499
      "tax": 0,
      "total": 1198,
      "coupon": null
    }
  }
}

// Error: Out of Stock 400
{
  "success": false,
  "error": "Product is out of stock",
  "code": "OUT_OF_STOCK"
}
```

## Checkout

### POST `/api/v1/checkout`
Create order and initialize payment.

```typescript
// Request
{
  "addressId": "addr_001",
  "paymentMethod": "razorpay",    // razorpay | cod
  "couponCode": "FIRST10",        // Optional
  "notes": "Please gift wrap",    // Optional
  "giftMessage": "Happy Birthday!" // Optional
}

// Response 200 (Razorpay)
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_abc123",
      "orderNumber": "GR-2024-00001",
      "status": "PENDING",
      "items": [...],
      "subtotal": 1198,
      "discount": 120,
      "shipping": 0,
      "tax": 194,              // GST 18%
      "total": 1272
    },
    "razorpay": {
      "orderId": "order_NBhZH1234abcd",
      "amount": 127200,        // In paise
      "currency": "INR",
      "key": "rzp_live_xxxxxxxx",
      "name": "Graphh Cosmetics",
      "description": "Order #GR-2024-00001",
      "image": "https://graphh.com/logo.png",
      "prefill": {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "contact": "9876543210"
      },
      "theme": {
        "color": "#E91E63"
      }
    }
  }
}

// Response 200 (COD)
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_abc123",
      "orderNumber": "GR-2024-00001",
      "status": "CONFIRMED",
      ...
    },
    "message": "Order placed successfully! Pay ₹1,272 on delivery."
  }
}
```

### POST `/api/v1/checkout/verify`
Verify Razorpay payment after completion.

```typescript
// Request
{
  "razorpay_order_id": "order_NBhZH1234abcd",
  "razorpay_payment_id": "pay_NBhZK9876efgh",
  "razorpay_signature": "signature_hash..."
}

// Response 200
{
  "success": true,
  "message": "Payment successful! Order confirmed.",
  "data": {
    "orderId": "ord_abc123",
    "orderNumber": "GR-2024-00001",
    "status": "CONFIRMED",
    "paymentMethod": "UPI",
    "estimatedDelivery": "2024-01-20",
    "invoiceUrl": "https://graphh.com/invoice/GR-2024-00001.pdf"
  }
}

// Error: Payment Failed 400
{
  "success": false,
  "error": "Payment verification failed",
  "code": "PAYMENT_FAILED",
  "message": "Please try again or use a different payment method"
}
```

---

# PART 3: EMPLOYEE APIs

## Employee Authentication

### POST `/api/v1/employee/auth/login`

```typescript
// Request
{
  "email": "staff@graphh.com",
  "password": "StaffPass123!"
}

// Response 200
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp_001",
      "name": "Rahul Kumar",
      "email": "staff@graphh.com",
      "role": "ORDER_MANAGER",
      "permissions": [
        "orders.view",
        "orders.update",
        "products.view",
        "customers.view"
      ],
      "avatar": "https://..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 28800    // 8 hours
  }
}
```

## Employee Dashboard

### GET `/api/v1/employee/dashboard`

```typescript
// Response 200
{
  "success": true,
  "data": {
    "today": {
      "orders": 45,
      "revenue": 67500,
      "pendingOrders": 12,
      "processingOrders": 8,
      "shippedOrders": 25
    },
    "pendingActions": {
      "ordersToProcess": 12,
      "reviewsToApprove": 5,
      "returnRequests": 2,
      "lowStockAlerts": 8,
      "supportTickets": 3
    },
    "recentOrders": [
      {
        "id": "ord_abc123",
        "orderNumber": "GR-2024-00045",
        "customer": "Priya S.",
        "total": 1499,
        "status": "PENDING",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Employee Order Management

### GET `/api/v1/employee/orders`

```typescript
// Query Parameters
{
  status?: OrderStatus,
  search?: string,         // Order number or customer name
  dateFrom?: string,
  dateTo?: string,
  page?: number,
  limit?: number
}

// Response 200
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_abc123",
        "orderNumber": "GR-2024-00045",
        "customer": {
          "id": "user_xyz",
          "name": "Priya Sharma",
          "email": "priya@example.com",
          "phone": "9876543210"
        },
        "items": [
          {
            "name": "Matte Lipstick - Ruby Red",
            "quantity": 2,
            "price": 599
          }
        ],
        "itemCount": 2,
        "total": 1198,
        "status": "PENDING",
        "paymentStatus": "CAPTURED",
        "paymentMethod": "UPI",
        "shippingAddress": {
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### PATCH `/api/v1/employee/orders/[id]/status`
Update order status.

```typescript
// Request
{
  "status": "PROCESSING",
  "note": "Started packing"    // Optional internal note
}

// Response 200
{
  "success": true,
  "message": "Order status updated to Processing",
  "data": {
    "orderId": "ord_abc123",
    "status": "PROCESSING",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

# PART 4: ADMIN APIs

## Admin Authentication

### POST `/api/v1/admin/auth/login`

```typescript
// Request
{
  "email": "admin@graphh.com",
  "password": "AdminSecure123!",
  "otp": "123456"              // 2FA required for admin
}

// Response 200
{
  "success": true,
  "data": {
    "admin": {
      "id": "admin_001",
      "name": "Admin User",
      "email": "admin@graphh.com",
      "role": "SUPER_ADMIN",
      "permissions": ["*"]     // Full access
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 14400         // 4 hours
  }
}
```

## Product Management (Admin)

### POST `/api/v1/admin/products`
Create a new product.

```typescript
// Request (multipart/form-data for images)
{
  "name": "Matte Lipstick - Coral Crush",
  "slug": "matte-lipstick-coral-crush",   // Auto-generated if not provided
  "description": "<p>Rich, creamy matte lipstick...</p>",
  "shortDesc": "Long-lasting matte finish",
  
  "price": 599,
  "comparePrice": 799,
  "costPrice": 250,            // For profit calculation
  
  "categoryId": "cat_lips",
  "tags": ["matte", "new-arrival", "trending"],
  
  "sku": "LIP-MAT-CORAL-001",
  "barcode": "8901234567890",
  "inventory": 100,
  "lowStockAlert": 10,
  "trackInventory": true,
  
  "hasVariants": true,
  "variants": [
    {
      "name": "Coral Crush",
      "sku": "LIP-MAT-CORAL-001",
      "price": 599,
      "inventory": 50,
      "attributes": {
        "color": "#FF6B6B",
        "colorName": "Coral Crush"
      }
    },
    {
      "name": "Sunset Orange",
      "sku": "LIP-MAT-SUNSET-001",
      "price": 599,
      "inventory": 50,
      "attributes": {
        "color": "#FF8C42",
        "colorName": "Sunset Orange"
      }
    }
  ],
  
  "details": {
    "ingredients": "Isododecane, Dimethicone...",
    "howToUse": "Apply directly to lips...",
    "benefits": ["12-hour wear", "Transfer-proof", "Vitamin E enriched"]
  },
  
  "seo": {
    "metaTitle": "Coral Crush Matte Lipstick | Graphh",
    "metaDescription": "Shop our new Coral Crush shade..."
  },
  
  "isActive": true,
  "isFeatured": true,
  
  // Images uploaded separately or as base64
  "images": [
    {
      "file": "<base64 or file>",
      "alt": "Coral Crush Lipstick Front",
      "isPrimary": true
    }
  ]
}

// Response 201
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod_new123",
    "slug": "matte-lipstick-coral-crush",
    "name": "Matte Lipstick - Coral Crush",
    ...
  }
}
```

### POST `/api/v1/admin/products/[id]/images`
Upload product images.

```typescript
// Request (multipart/form-data)
FormData {
  images: File[],           // Multiple image files
  alts: string[],           // Alt texts for each
  primaryIndex: number      // Which image is primary (0-based)
}

// Response 200
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "img_001",
        "url": "https://res.cloudinary.com/graphh/image/upload/v1/products/coral-1.jpg",
        "thumbnailUrl": "https://res.cloudinary.com/graphh/image/upload/c_thumb,w_200/v1/products/coral-1.jpg",
        "alt": "Coral Crush Front",
        "isPrimary": true,
        "size": 245678,
        "dimensions": { "width": 1200, "height": 1200 }
      }
    ]
  }
}
```

### PATCH `/api/v1/admin/products/[id]`
Update existing product.

```typescript
// Request (partial update)
{
  "price": 549,              // New price
  "comparePrice": 799,
  "isFeatured": true,
  "inventory": 150
}

// Response 200
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "prod_abc123",
    "name": "Matte Lipstick - Ruby Red",
    "price": 549,
    ...
  }
}
```

### DELETE `/api/v1/admin/products/[id]`
Delete product (soft delete).

```typescript
// Response 200
{
  "success": true,
  "message": "Product deleted successfully"
}

// Error: Product has orders 400
{
  "success": false,
  "error": "Cannot delete product with existing orders",
  "code": "HAS_ORDERS",
  "suggestion": "Deactivate the product instead"
}
```

### POST `/api/v1/admin/products/bulk-upload`
Bulk upload products via CSV/Excel.

```typescript
// Request (multipart/form-data)
FormData {
  file: File,               // CSV or XLSX
  updateExisting: boolean   // Update if SKU exists
}

// Response 200
{
  "success": true,
  "message": "Bulk upload completed",
  "data": {
    "total": 50,
    "created": 45,
    "updated": 3,
    "failed": 2,
    "errors": [
      { "row": 12, "sku": "LIP-001", "error": "Invalid category" },
      { "row": 28, "sku": "EYE-005", "error": "Price must be positive" }
    ]
  }
}
```

## Category Management (Admin)

### POST `/api/v1/admin/categories`

```typescript
// Request
{
  "name": "Lip Care",
  "slug": "lip-care",
  "description": "Nourishing lip care products",
  "parentId": "cat_lips",      // Optional, for subcategory
  "image": "<file or base64>",
  "isActive": true,
  "sortOrder": 5
}

// Response 201
{
  "success": true,
  "data": {
    "id": "cat_lipcare",
    "name": "Lip Care",
    "slug": "lip-care",
    "parent": {
      "id": "cat_lips",
      "name": "Lips"
    },
    ...
  }
}
```

## Coupon Management (Admin)

### POST `/api/v1/admin/coupons`

```typescript
// Request
{
  "code": "SUMMER25",
  "type": "PERCENTAGE",        // PERCENTAGE | FIXED | FREE_SHIPPING
  "value": 25,                 // 25% off
  
  "minPurchase": 999,          // Min cart value
  "maxDiscount": 500,          // Max discount amount
  
  "usageLimit": 1000,          // Total uses
  "perUserLimit": 1,           // Per user limit
  
  "validFrom": "2024-06-01T00:00:00Z",
  "validUntil": "2024-06-30T23:59:59Z",
  
  "categories": ["cat_lips", "cat_eyes"],  // Applicable categories
  "products": [],                           // Or specific products
  "excludeProducts": ["prod_sale1"],        // Exclude sale items
  
  "isActive": true
}

// Response 201
{
  "success": true,
  "data": {
    "id": "coupon_summer25",
    "code": "SUMMER25",
    ...
  }
}
```

## Employee Management (Admin)

### POST `/api/v1/admin/employees`

```typescript
// Request
{
  "name": "Rahul Kumar",
  "email": "rahul@graphh.com",
  "phone": "9876543210",
  "role": "ORDER_MANAGER",
  "permissions": [
    "orders.view",
    "orders.update",
    "products.view",
    "customers.view"
  ]
}

// Response 201
{
  "success": true,
  "message": "Employee created. Temporary password sent to email.",
  "data": {
    "id": "emp_rahul",
    "name": "Rahul Kumar",
    "email": "rahul@graphh.com",
    "role": "ORDER_MANAGER"
  }
}
```

### GET `/api/v1/admin/employees/roles`
Get available roles and permissions.

```typescript
// Response 200
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "SUPER_ADMIN",
        "name": "Super Admin",
        "description": "Full system access",
        "permissions": ["*"]
      },
      {
        "id": "ORDER_MANAGER",
        "name": "Order Manager",
        "description": "Manage orders and shipments",
        "permissions": [
          "orders.view",
          "orders.update",
          "orders.refund",
          "shipments.create",
          "shipments.update",
          "customers.view"
        ]
      },
      {
        "id": "PRODUCT_MANAGER",
        "name": "Product Manager",
        "description": "Manage products and inventory",
        "permissions": [
          "products.view",
          "products.create",
          "products.update",
          "products.delete",
          "categories.manage",
          "inventory.manage"
        ]
      },
      {
        "id": "SUPPORT_AGENT",
        "name": "Support Agent",
        "description": "Handle customer support",
        "permissions": [
          "orders.view",
          "customers.view",
          "reviews.moderate",
          "support.manage"
        ]
      }
    ],
    "allPermissions": [
      { "key": "orders.view", "description": "View orders" },
      { "key": "orders.update", "description": "Update order status" },
      { "key": "orders.refund", "description": "Process refunds" },
      { "key": "products.view", "description": "View products" },
      { "key": "products.create", "description": "Create products" },
      { "key": "products.update", "description": "Update products" },
      { "key": "products.delete", "description": "Delete products" },
      // ... more permissions
    ]
  }
}
```

## Dashboard & Analytics (Admin)

### GET `/api/v1/admin/dashboard`

```typescript
// Query: ?period=today|week|month|year

// Response 200
{
  "success": true,
  "data": {
    "overview": {
      "revenue": {
        "value": 245000,
        "change": 12.5,        // % change from previous period
        "trend": "up"
      },
      "orders": {
        "value": 156,
        "change": 8.3,
        "trend": "up"
      },
      "customers": {
        "value": 89,
        "change": -2.1,
        "trend": "down"
      },
      "avgOrderValue": {
        "value": 1571,
        "change": 4.2,
        "trend": "up"
      }
    },
    
    "salesChart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "datasets": [
        {
          "label": "Revenue",
          "data": [32000, 28000, 45000, 38000, 52000, 35000, 15000]
        },
        {
          "label": "Orders",
          "data": [18, 15, 28, 22, 35, 25, 13]
        }
      ]
    },
    
    "topProducts": [
      {
        "id": "prod_abc",
        "name": "Matte Lipstick - Ruby Red",
        "image": "https://...",
        "sales": 156,
        "revenue": 93244
      }
    ],
    
    "recentOrders": [...],
    
    "alerts": [
      { "type": "low_stock", "count": 8, "message": "8 products low on stock" },
      { "type": "pending_reviews", "count": 12, "message": "12 reviews pending approval" }
    ]
  }
}
```

## Settings (Admin)

### GET `/api/v1/admin/settings/general`

```typescript
// Response 200
{
  "success": true,
  "data": {
    "siteName": "Graphh Cosmetics",
    "tagline": "Beauty Redefined",
    "logo": "https://...",
    "favicon": "https://...",
    "contactEmail": "support@graphh.com",
    "contactPhone": "+91 98765 43210",
    "address": {
      "line1": "123 Beauty Lane",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "socialLinks": {
      "instagram": "https://instagram.com/graphhcosmetics",
      "facebook": "https://facebook.com/graphhcosmetics",
      "twitter": "https://twitter.com/graphhcosmetics"
    },
    "currency": "INR",
    "timezone": "Asia/Kolkata"
  }
}
```

### PATCH `/api/v1/admin/settings/shipping`

```typescript
// Request
{
  "freeShippingThreshold": 499,
  "defaultShippingRate": 49,
  "codCharges": 29,
  "codAvailable": true,
  "estimatedDeliveryDays": {
    "metros": "2-3",
    "tier1": "3-5",
    "tier2": "5-7",
    "remote": "7-10"
  }
}
```

---

## Error Response Format

All APIs follow consistent error format:

```typescript
// Validation Error 400
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "price", "message": "Price must be positive" }
  ]
}

// Authentication Error 401
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}

// Authorization Error 403
{
  "success": false,
  "error": "You don't have permission to perform this action",
  "code": "FORBIDDEN"
}

// Not Found 404
{
  "success": false,
  "error": "Product not found",
  "code": "NOT_FOUND"
}

// Rate Limit 429
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}

// Server Error 500
{
  "success": false,
  "error": "Internal server error",
  "code": "SERVER_ERROR",
  "requestId": "req_abc123"    // For support reference
}
```

---

## API Authentication

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: <unique-request-id>       // Optional, for tracking
```

### Rate Limits

| API Type | Limit | Window |
|----------|-------|--------|
| Public | 100 requests | 1 minute |
| Customer | 200 requests | 1 minute |
| Employee | 500 requests | 1 minute |
| Admin | 1000 requests | 1 minute |
| Webhooks | Unlimited | - |

---

## Webhooks

### Razorpay Events

| Event | Description |
|-------|-------------|
| `payment.authorized` | Payment authorized |
| `payment.captured` | Payment captured |
| `payment.failed` | Payment failed |
| `refund.created` | Refund initiated |
| `refund.processed` | Refund completed |

### Shiprocket Events

| Event | Description |
|-------|-------------|
| `shipment.pickup` | Shipment picked up |
| `shipment.in_transit` | In transit |
| `shipment.out_for_delivery` | Out for delivery |
| `shipment.delivered` | Delivered |
| `shipment.rto` | Return to origin |
