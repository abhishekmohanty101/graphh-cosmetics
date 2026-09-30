# Graphh Cosmetics - E-Commerce Platform

## Architecture Documentation

Complete system architecture for the Graphh Cosmetics e-commerce platform.

**Domain:** [graphh.com](https://graphh.com) / [graphh.in](https://graphh.in)

---

## Quick Links

| Document | Description |
|----------|-------------|
| [01-SYSTEM-OVERVIEW.md](./01-SYSTEM-OVERVIEW.md) | High-level architecture, tech stack, infrastructure overview |
| [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) | Complete Prisma schema, database design, relationships |
| [03-API-ARCHITECTURE.md](./03-API-ARCHITECTURE.md) | All API endpoints - Customer, Employee, Admin |
| [04-FRONTEND-ARCHITECTURE.md](./04-FRONTEND-ARCHITECTURE.md) | Component structure, design system, pages |
| [05-INFRASTRUCTURE.md](./05-INFRASTRUCTURE.md) | Deployment, CI/CD, domain setup, monitoring |
| [06-INTEGRATIONS.md](./06-INTEGRATIONS.md) | Razorpay, Shiprocket, Cloudinary, Resend, etc. |
| [07-SECURITY.md](./07-SECURITY.md) | Authentication, authorization, data protection |

---

## Technology Stack

### Core

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React 18, TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js) |

### Services

| Service | Provider |
|---------|----------|
| Hosting | Vercel |
| Database | Supabase |
| Payments | Razorpay |
| Shipping | Shiprocket |
| Images | Cloudinary |
| Email | Resend |
| SMS | MSG91 |
| CMS | Sanity |
| Cache | Upstash Redis |
| Monitoring | Sentry |

---

## Architecture Diagram

```
                                    ┌──────────────────┐
                                    │     Clients      │
                                    │  (Web/Mobile)    │
                                    └────────┬─────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare (DNS/CDN/WAF)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Vercel (Hosting)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Next.js Application                         │   │
│  │   • Server Components (SSR/SSG)                                 │   │
│  │   • API Routes                                                   │   │
│  │   • Server Actions                                               │   │
│  │   • Edge Middleware                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
          ┌──────────────────────────────────┼──────────────────────────────┐
          │                                  │                              │
          ▼                                  ▼                              ▼
┌──────────────────┐              ┌──────────────────┐           ┌──────────────────┐
│    Supabase      │              │    Cloudinary    │           │   Third Party    │
│   (PostgreSQL)   │              │    (Images)      │           │    Services      │
│                  │              │                  │           │                  │
│  • Users         │              │  • Products      │           │  • Razorpay      │
│  • Orders        │              │  • Banners       │           │  • Shiprocket    │
│  • Products      │              │  • User uploads  │           │  • Resend        │
│  • Payments      │              │                  │           │  • MSG91         │
└──────────────────┘              └──────────────────┘           └──────────────────┘
```

---

## Key Features

### Customer Portal (graphh.com)
- Product browsing with filters
- Shopping cart & wishlist
- Razorpay checkout (UPI, Cards, NetBanking, COD)
- Order tracking
- Reviews & ratings
- User account management

### Admin Panel (admin.graphh.com)
- Dashboard & analytics
- Product management (CRUD, variants, images)
- Order management & fulfillment
- Customer management
- Coupon management
- Employee management
- Reports & exports
- Settings & configuration

### Employee Portal (staff.graphh.com)
- Order processing
- Inventory management
- Customer support
- Review moderation

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (or Supabase account)

### Installation

```bash
# Clone repository
git clone https://github.com/graphh/cosmetics-brand.git
cd cosmetics-brand

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

See [05-INFRASTRUCTURE.md](./05-INFRASTRUCTURE.md) for complete list.

---

## Cost Estimates

| Stage | Monthly Cost |
|-------|-------------|
| Launch (0-1K orders) | ₹0 + transaction fees |
| Growth (1K-10K orders) | ~₹14,000 + transaction fees |
| Scale (10K+ orders) | ~₹43,000+ + transaction fees |

*Transaction fees: Razorpay 2% per transaction*

---

## Contact

- **Tech Team:** tech@graphh.com
- **Support:** support@graphh.com

---

## License

Proprietary - Graphh Cosmetics Private Limited
