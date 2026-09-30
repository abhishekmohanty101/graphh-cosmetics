# Security Architecture

## Overview

Comprehensive security implementation for the Graphh Cosmetics e-commerce platform, covering authentication, data protection, payment security, and compliance.

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY ARCHITECTURE                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         LAYER 1: EDGE SECURITY                          │   │
│  │  • Cloudflare DDoS Protection                                           │   │
│  │  • WAF (Web Application Firewall)                                       │   │
│  │  • Rate Limiting                                                        │   │
│  │  • Bot Protection                                                       │   │
│  │  • SSL/TLS Termination                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 2: APPLICATION SECURITY                       │   │
│  │  • HTTPS Only (TLS 1.3)                                                 │   │
│  │  • Security Headers (CSP, HSTS, X-Frame-Options)                        │   │
│  │  • CSRF Protection                                                      │   │
│  │  • XSS Prevention                                                       │   │
│  │  • Input Validation (Zod)                                               │   │
│  │  • SQL Injection Prevention (Prisma ORM)                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       LAYER 3: AUTHENTICATION                            │   │
│  │  • NextAuth.js with JWT                                                 │   │
│  │  • OAuth 2.0 (Google)                                                   │   │
│  │  • Phone OTP Verification                                               │   │
│  │  • Password Hashing (bcrypt)                                            │   │
│  │  • Session Management                                                   │   │
│  │  • 2FA for Admin/Staff                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        LAYER 4: AUTHORIZATION                            │   │
│  │  • Role-Based Access Control (RBAC)                                     │   │
│  │  • Permission System                                                    │   │
│  │  • Resource-Level Access                                                │   │
│  │  • API Scopes                                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       LAYER 5: DATA SECURITY                             │   │
│  │  • Encryption at Rest (AES-256)                                         │   │
│  │  • Encryption in Transit (TLS)                                          │   │
│  │  • Row Level Security (RLS)                                             │   │
│  │  • PII Data Handling                                                    │   │
│  │  • Secure Backup Storage                                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 6: PAYMENT SECURITY                           │   │
│  │  • PCI DSS Compliance (via Razorpay)                                    │   │
│  │  • No Card Data Storage                                                 │   │
│  │  • Webhook Signature Verification                                       │   │
│  │  • Secure Payment Flow                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Authentication

### NextAuth.js Configuration

```typescript
// src/lib/auth/auth-options.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email/Password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        
        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        if (!user.isVerified) {
          throw new Error('Please verify your email/phone')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome email
        await sendWelcomeEmail(user)
      }
      
      // Log sign-in
      await prisma.auditLog.create({
        data: {
          userId: user.id!,
          action: 'USER_LOGIN',
          entity: 'User',
          entityId: user.id!,
          ipAddress: '', // Get from request
        },
      })
    },
  },
}
```

### Password Security

```typescript
// src/lib/auth/password.ts
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Password requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Check for common/breached passwords
export async function isPasswordBreached(password: string): Promise<boolean> {
  const crypto = await import('crypto')
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = sha1.substring(0, 5)
  const suffix = sha1.substring(5)
  
  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`
  )
  const data = await response.text()
  
  return data.includes(suffix)
}
```

### Rate Limiting

```typescript
// src/lib/auth/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Different rate limits for different actions
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
  prefix: 'ratelimit:login',
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
})

export const otpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'), // 3 OTPs per 10 minutes
  analytics: true,
  prefix: 'ratelimit:otp',
})
```

---

## 2. Authorization (RBAC)

### Role Definitions

```typescript
// src/lib/auth/permissions.ts

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  EMPLOYEE: 'EMPLOYEE',
  ORDER_MANAGER: 'ORDER_MANAGER',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = keyof typeof ROLES

export const PERMISSIONS = {
  // Orders
  'orders.view': 'View orders',
  'orders.update': 'Update order status',
  'orders.cancel': 'Cancel orders',
  'orders.refund': 'Process refunds',
  'orders.export': 'Export orders',
  
  // Products
  'products.view': 'View products',
  'products.create': 'Create products',
  'products.update': 'Update products',
  'products.delete': 'Delete products',
  'products.inventory': 'Manage inventory',
  
  // Categories
  'categories.view': 'View categories',
  'categories.manage': 'Manage categories',
  
  // Customers
  'customers.view': 'View customers',
  'customers.update': 'Update customers',
  'customers.block': 'Block customers',
  
  // Reviews
  'reviews.view': 'View reviews',
  'reviews.moderate': 'Moderate reviews',
  
  // Coupons
  'coupons.view': 'View coupons',
  'coupons.manage': 'Manage coupons',
  
  // Employees
  'employees.view': 'View employees',
  'employees.manage': 'Manage employees',
  
  // Settings
  'settings.view': 'View settings',
  'settings.update': 'Update settings',
  
  // Reports
  'reports.view': 'View reports',
  'reports.export': 'Export reports',
  
  // Support
  'support.view': 'View support tickets',
  'support.respond': 'Respond to tickets',
} as const

export type Permission = keyof typeof PERMISSIONS

// Role -> Permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [],
  
  EMPLOYEE: [
    'orders.view',
    'products.view',
    'customers.view',
  ],
  
  ORDER_MANAGER: [
    'orders.view',
    'orders.update',
    'orders.cancel',
    'orders.refund',
    'orders.export',
    'products.view',
    'customers.view',
  ],
  
  PRODUCT_MANAGER: [
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'products.inventory',
    'categories.view',
    'categories.manage',
    'orders.view',
  ],
  
  SUPPORT_AGENT: [
    'orders.view',
    'customers.view',
    'reviews.view',
    'reviews.moderate',
    'support.view',
    'support.respond',
  ],
  
  ADMIN: [
    'orders.view',
    'orders.update',
    'orders.cancel',
    'orders.refund',
    'orders.export',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'products.inventory',
    'categories.view',
    'categories.manage',
    'customers.view',
    'customers.update',
    'reviews.view',
    'reviews.moderate',
    'coupons.view',
    'coupons.manage',
    'employees.view',
    'settings.view',
    'reports.view',
    'reports.export',
    'support.view',
    'support.respond',
  ],
  
  SUPER_ADMIN: Object.keys(PERMISSIONS) as Permission[],
}

// Permission check helper
export function hasPermission(
  userRole: Role,
  permission: Permission
): boolean {
  if (userRole === 'SUPER_ADMIN') return true
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

export function hasAnyPermission(
  userRole: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(userRole, p))
}

export function hasAllPermissions(
  userRole: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(userRole, p))
}
```

### Authorization Middleware

```typescript
// src/lib/auth/authorize.ts
import { auth } from '@/lib/auth'
import { hasPermission, Permission } from './permissions'

export function withPermission(permission: Permission) {
  return async function middleware(req: Request) {
    const session = await auth()
    
    if (!session?.user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!hasPermission(session.user.role, permission)) {
      return Response.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }
    
    return null // Continue to handler
  }
}

// Usage in API route
export async function POST(req: Request) {
  const authError = await withPermission('products.create')(req)
  if (authError) return authError
  
  // Handle request...
}
```

---

## 3. Input Validation

### Zod Schemas

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .transform((v) => v.trim()),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
})

// src/lib/validations/product.ts
export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  categoryId: z.string().cuid(),
  images: z.array(z.string().url()).min(1),
  isActive: z.boolean().default(true),
})

// Validate in API routes
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T; error: null } | { data: null; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { data: null, error: result.error }
  }
  return { data: result.data, error: null }
}
```

---

## 4. Security Headers

### Next.js Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.razorpay.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://api.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## 5. Data Protection

### Encryption

```typescript
// src/lib/security/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### PII Data Handling

```typescript
// src/lib/security/pii.ts

// Mask sensitive data for logging
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return '***'
  return `${phone.substring(0, 2)}****${phone.substring(phone.length - 2)}`
}

export function maskCardNumber(cardNumber: string): string {
  return `****-****-****-${cardNumber.substring(cardNumber.length - 4)}`
}

// Sanitize user data for frontend
export function sanitizeUserForClient(user: any) {
  const { passwordHash, ...safeUser } = user
  return safeUser
}
```

### Row Level Security (Supabase)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL
  USING (auth.uid() = user_id);

-- Products are publicly readable
CREATE POLICY "Products are public" ON products
  FOR SELECT
  USING (is_active = true);

-- Admin bypass (use service role key)
-- Service role key bypasses all RLS policies
```

---

## 6. Audit Logging

```typescript
// src/lib/security/audit.ts
import { prisma } from '@/lib/db'

type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'PASSWORD_CHANGE'
  | 'ORDER_CREATE'
  | 'ORDER_UPDATE'
  | 'ORDER_CANCEL'
  | 'REFUND_PROCESS'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'ADMIN_LOGIN'
  | 'SETTINGS_CHANGE'

interface AuditLogParams {
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: AuditLogParams) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  })
}

// Usage
await createAuditLog({
  userId: user.id,
  action: 'ORDER_UPDATE',
  entity: 'Order',
  entityId: order.id,
  oldValues: { status: 'PENDING' },
  newValues: { status: 'SHIPPED' },
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent'),
})
```

---

## 7. Security Checklist

### Pre-Launch Security Review

```
✅ Authentication
   □ Password hashing with bcrypt (cost factor 12+)
   □ JWT tokens with proper expiry
   □ OAuth 2.0 correctly implemented
   □ Phone OTP verification working
   □ Rate limiting on auth endpoints
   □ Account lockout after failed attempts

✅ Authorization
   □ RBAC implemented correctly
   □ All admin routes protected
   □ API routes check permissions
   □ No privilege escalation possible

✅ Input Validation
   □ All user inputs validated with Zod
   □ File upload restrictions in place
   □ SQL injection prevented (Prisma ORM)
   □ XSS prevention (React escaping + CSP)

✅ Data Protection
   □ HTTPS enforced everywhere
   □ Sensitive data encrypted at rest
   □ PII properly handled
   □ RLS enabled on database

✅ Payment Security
   □ PCI DSS via Razorpay
   □ No card data stored
   □ Webhook signatures verified
   □ Payment flow is secure

✅ Infrastructure
   □ Security headers configured
   □ CSP implemented
   □ DDoS protection enabled
   □ WAF rules configured
   □ Secrets not in code

✅ Monitoring
   □ Error tracking (Sentry)
   □ Audit logging enabled
   □ Suspicious activity alerts
   □ Uptime monitoring
```

---

## 8. Incident Response

### Security Incident Procedure

```
1. DETECT
   └── Monitor alerts from Sentry, Cloudflare, Supabase

2. CONTAIN
   └── Isolate affected systems
   └── Revoke compromised credentials
   └── Enable maintenance mode if needed

3. INVESTIGATE
   └── Review audit logs
   └── Analyze attack vectors
   └── Identify scope of breach

4. REMEDIATE
   └── Patch vulnerabilities
   └── Reset affected passwords
   └── Update security rules

5. RECOVER
   └── Restore from clean backups
   └── Verify system integrity
   └── Resume normal operations

6. POST-MORTEM
   └── Document incident
   └── Update security procedures
   └── Implement preventive measures
```

### Emergency Contacts

```
Security Team:     security@graphh.com
Tech Lead:         +91-XXXXXXXXXX
Cloud Provider:    Vercel Support
Database:          Supabase Support
Payments:          Razorpay Support
```
