# Infrastructure & DevOps

## Overview

Serverless infrastructure on Vercel with supporting services for database, storage, and third-party integrations.

**Domains:**
- Production: `graphh.com`, `graphh.in`
- Admin: `admin.graphh.com`
- Staff: `staff.graphh.com`
- API: `api.graphh.com`
- Staging: `staging.graphh.com`

---

## Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN MANAGEMENT                                   │
│                                                                                  │
│    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐       │
│    │   Hostinger      │     │   Cloudflare     │     │    Vercel        │       │
│    │   (Domain        │────▶│   (DNS/CDN)      │────▶│   (Hosting)      │       │
│    │    Registrar)    │     │                  │     │                  │       │
│    └──────────────────┘     └──────────────────┘     └──────────────────┘       │
│                                                                                  │
│    graphh.com ─────────────────────────────────────────▶ Vercel Production      │
│    graphh.in  ─────────────────────────────────────────▶ Redirect to .com       │
│    admin.graphh.com ───────────────────────────────────▶ Vercel (Admin App)     │
│    staff.graphh.com ───────────────────────────────────▶ Vercel (Staff App)     │
│    api.graphh.com ─────────────────────────────────────▶ Vercel (API Routes)    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL PLATFORM                                     │
│                                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────┐  │
│    │                         Edge Network (Global)                            │  │
│    │                                                                          │  │
│    │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            │  │
│    │  │  Mumbai   │  │ Singapore │  │  London   │  │    USA    │  ...       │  │
│    │  │  (BOM)    │  │   (SIN)   │  │   (LHR)   │  │   (IAD)   │            │  │
│    │  └───────────┘  └───────────┘  └───────────┘  └───────────┘            │  │
│    │                                                                          │  │
│    └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│    │  Static Assets  │  │  Serverless     │  │  Edge           │               │
│    │  (HTML/CSS/JS)  │  │  Functions      │  │  Middleware     │               │
│    │                 │  │  (API Routes)   │  │  (Auth/Geo)     │               │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          ▼                            ▼                            ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│     SUPABASE      │      │    CLOUDINARY     │      │   THIRD-PARTY     │
│                   │      │                   │      │                   │
│  ┌─────────────┐  │      │  ┌─────────────┐  │      │  ┌─────────────┐  │
│  │ PostgreSQL  │  │      │  │   Image     │  │      │  │  Razorpay   │  │
│  │  Database   │  │      │  │   Storage   │  │      │  │  (Payments) │  │
│  └─────────────┘  │      │  └─────────────┘  │      │  └─────────────┘  │
│                   │      │                   │      │                   │
│  ┌─────────────┐  │      │  ┌─────────────┐  │      │  ┌─────────────┐  │
│  │    Auth     │  │      │  │    Video    │  │      │  │  Shiprocket │  │
│  │  (Optional) │  │      │  │   (Future)  │  │      │  │  (Shipping) │  │
│  └─────────────┘  │      │  └─────────────┘  │      │  └─────────────┘  │
│                   │      │                   │      │                   │
│  ┌─────────────┐  │      │  ┌─────────────┐  │      │  ┌─────────────┐  │
│  │   Storage   │  │      │  │    CDN      │  │      │  │   Resend    │  │
│  │  (Invoices) │  │      │  │  Delivery   │  │      │  │   (Email)   │  │
│  └─────────────┘  │      │  └─────────────┘  │      │  └─────────────┘  │
│                   │      │                   │      │                   │
│  Region: Mumbai   │      │  Region: Auto     │      │  ┌─────────────┐  │
│  (ap-south-1)     │      │                   │      │  │   MSG91     │  │
└───────────────────┘      └───────────────────┘      │  │   (SMS)     │  │
                                                      │  └─────────────┘  │
                                                      │                   │
                                                      │  ┌─────────────┐  │
                                                      │  │   Sentry    │  │
                                                      │  │  (Errors)   │  │
                                                      │  └─────────────┘  │
                                                      └───────────────────┘
```

---

## Domain Configuration

### Hostinger DNS Setup

Since domain is registered with Hostinger, configure nameservers to point to Cloudflare:

```
Nameservers (Update in Hostinger):
ns1.cloudflare.com
ns2.cloudflare.com
```

### Cloudflare DNS Records

```
Type    Name              Content                         Proxy
─────────────────────────────────────────────────────────────────
A       graphh.com        76.76.21.21 (Vercel)           Yes
CNAME   www               cname.vercel-dns.com           Yes
CNAME   admin             cname.vercel-dns.com           Yes
CNAME   staff             cname.vercel-dns.com           Yes
CNAME   api               cname.vercel-dns.com           Yes
CNAME   staging           cname.vercel-dns.com           Yes

# Email (if using custom email)
MX      graphh.com        mx1.hostinger.com              No
MX      graphh.com        mx2.hostinger.com              No
TXT     graphh.com        v=spf1 include:_spf.google...  No

# Domain verification
TXT     _vercel           vc-domain-verify=...           No
```

### Cloudflare Settings

```yaml
SSL/TLS:
  mode: Full (strict)
  
Security:
  security_level: medium
  challenge_passage: 30
  browser_integrity_check: on
  
Speed:
  auto_minify: 
    javascript: on
    css: on
    html: on
  brotli: on
  
Caching:
  caching_level: standard
  browser_cache_ttl: 14400
  
Page Rules:
  - URL: "*graphh.com/*"
    settings:
      always_use_https: on
      
  - URL: "graphh.in/*"
    settings:
      forwarding_url:
        status_code: 301
        url: "https://graphh.com/$1"
```

---

## Vercel Configuration

### vercel.json

```json
{
  "version": 2,
  "regions": ["bom1"],
  "framework": "nextjs",
  
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://graphh.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/products",
      "destination": "/category/all",
      "permanent": false
    }
  ],
  
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    }
  ]
}
```

### Environment Variables

```bash
# .env.production (Vercel Dashboard)

# App
NEXT_PUBLIC_APP_URL=https://graphh.com
NEXT_PUBLIC_API_URL=https://api.graphh.com
NODE_ENV=production

# Database (Supabase)
DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgres://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Auth
NEXTAUTH_URL=https://graphh.com
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Shiprocket
SHIPROCKET_EMAIL=xxx
SHIPROCKET_PASSWORD=xxx
SHIPROCKET_WEBHOOK_TOKEN=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=graphh
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Graphh <hello@graphh.com>

# SMS (MSG91)
MSG91_AUTH_KEY=xxx
MSG91_SENDER_ID=GRAPHH
MSG91_TEMPLATE_ID=xxx

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=xxx
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

  deploy-preview:
    needs: lint-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Preview
        run: |
          url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "PREVIEW_URL=$url" >> $GITHUB_ENV
      
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed to: ${process.env.PREVIEW_URL}`
            })

  deploy-staging:
    needs: lint-and-test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Staging
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} --alias staging.graphh.com

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Production deployed successfully!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ *Production Deployment Successful*\n<https://graphh.com|View Live Site>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Database Migrations

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Generate Prisma Client
        run: npx prisma generate
```

---

## Monitoring & Observability

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  tracesSampleRate: 0.1,  // 10% of transactions
  
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { prisma } from '@/lib/db'

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      redis: false,
    },
  }
  
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = true
  } catch (e) {
    checks.status = 'unhealthy'
  }
  
  try {
    // Redis check
    const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL!)
    await redis.ping()
    checks.checks.redis = true
  } catch (e) {
    checks.status = 'unhealthy'
  }
  
  return Response.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  })
}
```

### Uptime Monitoring (Better Uptime)

```yaml
Monitors:
  - name: Graphh Production
    url: https://graphh.com
    check_interval: 60
    regions: [mumbai, singapore]
    
  - name: Graphh API
    url: https://api.graphh.com/health
    check_interval: 60
    
  - name: Graphh Admin
    url: https://admin.graphh.com
    check_interval: 300

Alerts:
  - email: tech@graphh.com
  - slack: #alerts
  - phone: +91-XXXXXXXXXX (for critical)
```

---

## Backup Strategy

### Database Backups

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKUP STRATEGY                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Continuous (Point-in-Time Recovery)                            │
│  ├── Provider: Supabase                                         │
│  ├── Retention: 7 days                                          │
│  └── Recovery: Any point within 7 days                          │
│                                                                  │
│  Daily Snapshots                                                │
│  ├── Provider: Supabase                                         │
│  ├── Time: 02:00 AM IST                                         │
│  ├── Retention: 30 days                                         │
│  └── Location: Same region (ap-south-1)                         │
│                                                                  │
│  Weekly Archives                                                │
│  ├── Provider: Custom script → AWS S3                           │
│  ├── Time: Sunday 03:00 AM IST                                  │
│  ├── Retention: 90 days                                         │
│  ├── Encryption: AES-256                                        │
│  └── Location: S3 ap-south-1                                    │
│                                                                  │
│  Monthly Archives                                               │
│  ├── Provider: Custom script → AWS S3 Glacier                   │
│  ├── Time: 1st of month, 04:00 AM IST                          │
│  ├── Retention: 1 year                                          │
│  ├── Encryption: AES-256                                        │
│  └── Location: S3 Glacier ap-south-1                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Backup Script

```typescript
// scripts/backup.ts
import { exec } from 'child_process'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createReadStream } from 'fs'

async function backupDatabase() {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `backup-${timestamp}.sql.gz`
  
  // Create backup
  await exec(`pg_dump ${process.env.DATABASE_URL} | gzip > /tmp/${filename}`)
  
  // Upload to S3
  const s3 = new S3Client({ region: 'ap-south-1' })
  
  await s3.send(new PutObjectCommand({
    Bucket: 'graphh-backups',
    Key: `database/${filename}`,
    Body: createReadStream(`/tmp/${filename}`),
    ServerSideEncryption: 'AES256',
  }))
  
  console.log(`Backup uploaded: ${filename}`)
}

backupDatabase()
```

---

## Scaling Checklist

### Phase 1: Launch (0-10K users/month)

```
✅ Vercel Hobby/Pro
✅ Supabase Free/Pro
✅ Cloudinary Free
✅ Single region (Mumbai)
✅ Basic monitoring (Sentry free)
```

### Phase 2: Growth (10K-100K users/month)

```
□ Vercel Pro
□ Supabase Pro with connection pooling
□ Cloudinary Paid plan
□ Upstash Redis for caching
□ Better Uptime monitoring
□ CDN optimization
```

### Phase 3: Scale (100K+ users/month)

```
□ Vercel Enterprise
□ Supabase Team/Enterprise
□ Read replicas for database
□ Multi-region deployment
□ Dedicated support channels
□ Load testing and optimization
□ Consider dedicated infrastructure
```

---

## Cost Estimates

### Monthly Infrastructure Costs

| Service | Launch | Growth | Scale |
|---------|--------|--------|-------|
| Vercel | ₹0 | ₹1,700 | ₹12,500+ |
| Supabase | ₹0 | ₹2,100 | ₹8,300+ |
| Cloudinary | ₹0 | ₹3,750 | ₹7,500+ |
| Upstash Redis | ₹0 | ₹850 | ₹2,500+ |
| Resend | ₹0 | ₹1,700 | ₹4,200+ |
| Sentry | ₹0 | ₹2,200 | ₹6,700+ |
| Better Uptime | ₹0 | ₹1,700 | ₹1,700 |
| **Total** | **₹0** | **~₹14,000** | **~₹43,000+** |

*Note: Razorpay (2% per transaction) and Shiprocket (per shipment) are variable costs.*

---

## Disaster Recovery

### RTO & RPO Targets

| Metric | Target | Current |
|--------|--------|---------|
| RTO (Recovery Time) | < 1 hour | ~30 mins |
| RPO (Data Loss) | < 1 hour | ~5 mins (PITR) |

### Recovery Procedures

```
1. Database Failure
   └── Automatic failover by Supabase
   └── If prolonged: Restore from PITR backup

2. Vercel Outage
   └── Rare (99.99% SLA)
   └── Fallback: Deploy to backup (Cloudflare Pages)

3. Complete Disaster
   └── Restore database from S3 backup
   └── Redeploy from GitHub
   └── Update DNS if needed
   └── Estimated recovery: 2-4 hours
```
