# Graphh Cosmetics - E-Commerce Platform

A modern, serverless e-commerce platform for cosmetics built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (we recommend [Supabase](https://supabase.com))

### Installation

1. **Navigate to project directory**
   ```bash
   cd cosmetics-brand
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual values (see Environment Variables section below).

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Customer site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Staff portal: http://localhost:3000/staff

### Default Login Credentials

After running the seed, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@graphh.com | Admin@123 |
| Order Manager | orders@graphh.com | Staff@123 |
| Product Manager | products@graphh.com | Staff@123 |
| Support Agent | support@graphh.com | Staff@123 |

---

## 📁 Project Structure

```
cosmetics-brand/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seed file
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (marketing)/     # Public pages
│   │   ├── (shop)/          # E-commerce pages
│   │   ├── (account)/       # User account pages
│   │   ├── admin/           # Admin panel
│   │   ├── staff/           # Employee portal
│   │   └── api/             # API routes
│   │
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── product/         # Product components
│   │   ├── cart/            # Cart components
│   │   └── admin/           # Admin components
│   │
│   ├── lib/
│   │   ├── db/              # Database client
│   │   ├── auth/            # Authentication
│   │   ├── utils/           # Utility functions
│   │   └── validations/     # Zod schemas
│   │
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
│
├── public/                  # Static assets
└── docs/                    # Documentation
    └── architecture/        # Architecture docs
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Graphh Cosmetics"

# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# Email (Resend)
RESEND_API_KEY=""

# Redis (Upstash) - optional
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Getting Service Credentials

1. **Supabase Database**
   - Create project at [supabase.com](https://supabase.com)
   - Go to Settings → Database → Connection string
   - Copy the URI (use "Connection pooling" for DATABASE_URL)

2. **Razorpay**
   - Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Go to Settings → API Keys
   - Generate test keys first, then live keys when ready

3. **Cloudinary**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Dashboard shows Cloud Name, API Key, API Secret

4. **Resend (Email)**
   - Sign up at [resend.com](https://resend.com)
   - Create API key

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

---

## 🏗️ Architecture

This project follows a serverless architecture optimized for scalability and cost-effectiveness.

See the [Architecture Documentation](./docs/architecture/README.md) for detailed information on:

- System Overview
- Database Schema
- API Architecture
- Frontend Architecture
- Infrastructure & DevOps
- Third-Party Integrations
- Security

---

## 🔐 User Roles & Permissions

| Role | Description | Access |
|------|-------------|--------|
| CUSTOMER | Regular shoppers | Customer portal only |
| EMPLOYEE | Basic staff | View orders, products |
| ORDER_MANAGER | Order handling | Manage orders, shipments |
| PRODUCT_MANAGER | Product handling | Manage products, categories |
| SUPPORT_AGENT | Customer support | Handle tickets, reviews |
| ADMIN | Full access | Everything except users |
| SUPER_ADMIN | System admin | Full access |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

---

## 📞 Support

- Documentation: [/docs/architecture](./docs/architecture/)
- Email: tech@graphh.com

---

## 📄 License

Proprietary - Graphh Cosmetics Private Limited
