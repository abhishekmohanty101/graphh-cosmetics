# System Architecture Overview

## Cosmetics Brand E-Commerce Platform

### Executive Summary

A modern, serverless e-commerce platform designed for an Indian cosmetics brand similar to Sugar and Rhode. Built for scalability, cost-effectiveness, and exceptional user experience with full support for Indian payment methods.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                        │
│                                                                                  │
│    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                   │
│    │   Desktop    │     │   Mobile     │     │   Tablet     │                   │
│    │   Browser    │     │   Browser    │     │   Browser    │                   │
│    └──────────────┘     └──────────────┘     └──────────────┘                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CDN / EDGE LAYER                                    │
│                                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────┐  │
│    │                        Vercel Edge Network                               │  │
│    │  • Global CDN (100+ locations)                                          │  │
│    │  • Automatic SSL/TLS                                                    │  │
│    │  • DDoS Protection                                                      │  │
│    │  • Image Optimization                                                   │  │
│    │  • Static Asset Caching                                                 │  │
│    └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                      │
│                                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────┐  │
│    │                     Next.js 14+ Application                              │  │
│    │                                                                          │  │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│    │  │   Pages     │  │    API      │  │   Server    │  │ Middleware  │    │  │
│    │  │  (SSR/SSG)  │  │   Routes    │  │   Actions   │  │  (Auth/i18n)│    │  │
│    │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│    │                                                                          │  │
│    └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    DATA LAYER         │ │    CONTENT LAYER      │ │   SERVICES LAYER      │
│                       │ │                       │ │                       │
│  ┌─────────────────┐  │ │  ┌─────────────────┐  │ │  ┌─────────────────┐  │
│  │   PostgreSQL    │  │ │  │   Sanity CMS    │  │ │  │    Razorpay     │  │
│  │   (Supabase)    │  │ │  │                 │  │ │  │   (Payments)    │  │
│  │                 │  │ │  │  • Products     │  │ │  │                 │  │
│  │  • Users        │  │ │  │  • Collections  │  │ │  │  • UPI          │  │
│  │  • Orders       │  │ │  │  • Blog Posts   │  │ │  │  • Cards        │  │
│  │  • Cart         │  │ │  │  • Banners      │  │ │  │  • NetBanking   │  │
│  │  • Addresses    │  │ │  │  • Pages        │  │ │  │  • Wallets      │  │
│  │  • Wishlist     │  │ │  │                 │  │ │  │  • COD          │  │
│  │  • Reviews      │  │ │  └─────────────────┘  │ │  └─────────────────┘  │
│  │                 │  │ │                       │ │                       │
│  └─────────────────┘  │ │                       │ │  ┌─────────────────┐  │
│                       │ │                       │ │  │     Resend      │  │
│  ┌─────────────────┐  │ │                       │ │  │    (Email)      │  │
│  │     Redis       │  │ │                       │ │  └─────────────────┘  │
│  │   (Upstash)     │  │ │                       │ │                       │
│  │                 │  │ │                       │ │  ┌─────────────────┐  │
│  │  • Sessions     │  │ │                       │ │  │   Cloudinary    │  │
│  │  • Cart Cache   │  │ │                       │ │  │   (Images)      │  │
│  │  • Rate Limit   │  │ │                       │ │  └─────────────────┘  │
│  └─────────────────┘  │ │                       │ │                       │
│                       │ │                       │ │  ┌─────────────────┐  │
│                       │ │                       │ │  │   Shiprocket    │  │
│                       │ │                       │ │  │   (Shipping)    │  │
│                       │ │                       │ │  └─────────────────┘  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+, React 18 | UI Framework |
| **Styling** | Tailwind CSS, Shadcn/ui | Design System |
| **State** | Zustand, React Query | Client State Management |
| **Backend** | Next.js API Routes, Server Actions | API Layer |
| **Database** | PostgreSQL (Supabase) | Primary Data Store |
| **Cache** | Redis (Upstash) | Session & Cache |
| **CMS** | Sanity | Content Management |
| **Auth** | NextAuth.js (Auth.js) | Authentication |
| **Payments** | Razorpay | Payment Processing (India) |
| **Email** | Resend | Transactional Email |
| **Images** | Cloudinary | Image CDN & Transform |
| **Shipping** | Shiprocket | Logistics & Tracking |
| **Hosting** | Vercel | Deployment Platform |
| **Monitoring** | Sentry | Error Tracking |
| **Analytics** | PostHog / Google Analytics | User Analytics |

---

## Architecture Principles

### 1. Serverless-First
- No server management overhead
- Auto-scaling based on demand
- Pay-per-use pricing model
- Zero downtime deployments

### 2. Edge-Optimized
- Static pages served from nearest edge location
- Dynamic content rendered at edge when possible
- Minimal latency for Indian users

### 3. India-First Design
- Razorpay for all Indian payment methods
- Shiprocket for domestic shipping
- INR as primary currency
- GST compliant invoicing

### 4. Headless Architecture
- Decoupled frontend and content management
- Marketing team can update content independently
- API-first approach for future mobile app

### 5. Type-Safe End-to-End
- TypeScript throughout the stack
- Prisma for type-safe database queries
- Zod for runtime validation

---

## Request Flow

```
User Request Journey:

1. User visits https://yourbrand.com/products/matte-lipstick-ruby
   │
   ▼
2. DNS resolves to Vercel Edge Network
   │
   ▼
3. Edge checks cache
   │
   ├── Cache HIT → Return cached page (< 50ms)
   │
   └── Cache MISS ↓
                  │
4. Request routed to nearest serverless function
   │
   ▼
5. Next.js Server Component renders page
   │
   ├── Fetch product data from Sanity CMS
   ├── Fetch reviews from Supabase PostgreSQL
   └── Fetch inventory status
   │
   ▼
6. HTML generated and returned (100-300ms)
   │
   ▼
7. Page cached at edge for subsequent requests
   │
   ▼
8. Client-side hydration adds interactivity
   │
   ▼
9. User sees fully interactive page
```

---

## Payment Flow (Razorpay)

```
Checkout Flow:

1. User clicks "Pay Now"
   │
   ▼
2. Frontend creates order via API
   │
   ▼
3. Backend creates Razorpay Order
   │
   ├── Order ID generated
   ├── Amount in paise (₹999 = 99900)
   └── Receipt ID linked
   │
   ▼
4. Razorpay Checkout opens
   │
   ├── UPI (Google Pay, PhonePe, Paytm)
   ├── Credit/Debit Cards
   ├── Net Banking
   ├── Wallets
   └── EMI Options
   │
   ▼
5. Payment completed
   │
   ▼
6. Razorpay sends webhook to our API
   │
   ▼
7. Backend verifies signature
   │
   ├── Valid → Update order status to PAID
   └── Invalid → Reject, flag for review
   │
   ▼
8. Send confirmation email + SMS
   │
   ▼
9. Trigger shipping via Shiprocket
```

---

## Scalability Model

```
Traffic Scaling:

Low Traffic (Launch)          Medium Traffic            High Traffic (Sale)
    │                              │                          │
    ▼                              ▼                          ▼
┌─────────┐                  ┌─────────┐                ┌─────────┐
│ 1 Func  │                  │ 10 Func │                │100 Func │
│Instance │                  │Instances│                │Instances│
└─────────┘                  └─────────┘                └─────────┘
    │                              │                          │
Cost: ₹0                     Cost: ~₹1,500             Cost: ~₹8,000
                                                    (auto-scales back down)
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Edge Security                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • DDoS Protection (Vercel)                              │   │
│  │ • WAF Rules                                              │   │
│  │ • Rate Limiting (Upstash)                               │   │
│  │ • Bot Protection                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 2: Application Security                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • HTTPS Only (TLS 1.3)                                  │   │
│  │ • CSRF Protection                                        │   │
│  │ • XSS Prevention                                         │   │
│  │ • Content Security Policy                                │   │
│  │ • Secure Headers                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 3: Authentication                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • JWT Tokens (HttpOnly Cookies)                         │   │
│  │ • OAuth 2.0 (Google)                                    │   │
│  │ • OTP via SMS (MSG91)                                   │   │
│  │ • Password Hashing (bcrypt)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 4: Payment Security                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • PCI DSS Compliance via Razorpay                       │   │
│  │ • No card data stored on our servers                    │   │
│  │ • Webhook signature verification                        │   │
│  │ • Razorpay handles all sensitive data                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 5: Data Security                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Encrypted at Rest (Supabase AES-256)                  │   │
│  │ • Encrypted in Transit (TLS)                            │   │
│  │ • Row Level Security (RLS)                              │   │
│  │ • Regular automated backups                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Strategy

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| Development | Local development | localhost:3000 | Local Supabase |
| Preview | PR previews | pr-123.vercel.app | Preview DB branch |
| Staging | Pre-production testing | staging.yourbrand.com | Staging DB |
| Production | Live site | yourbrand.com | Production DB |

---

## Cost Estimate (Monthly)

| Service | Launch (0-1K orders) | Growth (1K-10K orders) | Scale (10K+ orders) |
|---------|---------------------|------------------------|---------------------|
| Vercel | ₹0 | ₹1,700 | ₹12,500+ |
| Supabase | ₹0 | ₹2,100 | ₹4,200+ |
| Sanity CMS | ₹0 | ₹0 | ₹8,300+ |
| Upstash Redis | ₹0 | ₹850 | ₹2,500+ |
| Cloudinary | ₹0 | ₹0 | ₹7,500+ |
| Resend | ₹0 | ₹1,700 | ₹4,200+ |
| Sentry | ₹0 | ₹2,200 | ₹6,700+ |
| **Infrastructure Total** | **₹0** | **~₹8,500** | **~₹46,000+** |
| Razorpay (2% of sales) | Variable | Variable | Variable |
| Shiprocket | Per shipment | Per shipment | Per shipment |

---

## Document Index

1. **01-SYSTEM-OVERVIEW.md** - This document
2. [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) - Complete database design
3. [03-API-ARCHITECTURE.md](./03-API-ARCHITECTURE.md) - API endpoints and contracts
4. [04-FRONTEND-ARCHITECTURE.md](./04-FRONTEND-ARCHITECTURE.md) - Component structure
5. [05-INFRASTRUCTURE.md](./05-INFRASTRUCTURE.md) - Deployment and DevOps
6. [06-SECURITY.md](./06-SECURITY.md) - Security implementation details
7. [07-INTEGRATIONS.md](./07-INTEGRATIONS.md) - Razorpay, Shiprocket, etc.
