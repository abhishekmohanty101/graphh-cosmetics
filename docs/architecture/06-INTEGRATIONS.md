# Third-Party Integrations

## Overview

Complete integration guide for all external services used in the Graphh Cosmetics platform.

---

## 1. Razorpay (Payments)

### Setup

1. Create account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC verification
3. Get API keys from Settings → API Keys

### Configuration

```typescript
// src/lib/razorpay/client.ts
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})
```

### Create Order

```typescript
// src/lib/razorpay/create-order.ts
import { razorpay } from './client'
import { prisma } from '@/lib/db'

interface CreateRazorpayOrderParams {
  orderId: string
  amount: number  // In INR
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder({
  orderId,
  amount,
  currency = 'INR',
  receipt,
  notes,
}: CreateRazorpayOrderParams) {
  // Amount in paise (₹599 = 59900 paise)
  const amountInPaise = Math.round(amount * 100)
  
  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency,
    receipt: receipt || orderId,
    notes: {
      orderId,
      ...notes,
    },
  })
  
  // Save Razorpay order ID to database
  await prisma.payment.create({
    data: {
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      status: 'PENDING',
    },
  })
  
  return {
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    currency,
    key: process.env.RAZORPAY_KEY_ID,
  }
}
```

### Verify Payment

```typescript
// src/lib/razorpay/verify-payment.ts
import crypto from 'crypto'
import { prisma } from '@/lib/db'

interface VerifyPaymentParams {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: VerifyPaymentParams) {
  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex')
  
  const isValid = expectedSignature === razorpay_signature
  
  if (!isValid) {
    throw new Error('Invalid payment signature')
  }
  
  // Update payment record
  const payment = await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'CAPTURED',
      paidAt: new Date(),
    },
    include: { order: true },
  })
  
  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'CONFIRMED' },
  })
  
  return payment
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/razorpay/route.ts
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  const event = JSON.parse(body)
  
  switch (event.event) {
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment.entity)
      break
      
    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment.entity)
      break
      
    case 'refund.created':
      await handleRefundCreated(event.payload.refund.entity)
      break
  }
  
  return Response.json({ received: true })
}

async function handlePaymentCaptured(payment: any) {
  const paymentRecord = await prisma.payment.update({
    where: { razorpayOrderId: payment.order_id },
    data: {
      razorpayPaymentId: payment.id,
      status: 'CAPTURED',
      method: payment.method,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      cardLast4: payment.card?.last4,
      cardNetwork: payment.card?.network,
      paidAt: new Date(payment.created_at * 1000),
    },
    include: {
      order: { include: { user: true, items: true } },
    },
  })
  
  // Send confirmation email
  await sendOrderConfirmationEmail(paymentRecord.order)
}

async function handlePaymentFailed(payment: any) {
  await prisma.payment.update({
    where: { razorpayOrderId: payment.order_id },
    data: {
      status: 'FAILED',
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
    },
  })
}

async function handleRefundCreated(refund: any) {
  await prisma.payment.update({
    where: { razorpayPaymentId: refund.payment_id },
    data: {
      refundId: refund.id,
      refundAmount: refund.amount,
      refundStatus: refund.status,
      status: refund.amount === refund.payment_amount 
        ? 'REFUNDED' 
        : 'PARTIALLY_REFUNDED',
    },
  })
}
```

### Frontend Integration

```tsx
// src/components/checkout/razorpay-button.tsx
'use client'

import { useState } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface RazorpayButtonProps {
  orderId: string
  razorpayOrderId: string
  amount: number
  currency: string
  prefill: {
    name: string
    email: string
    contact: string
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayButton({
  orderId,
  razorpayOrderId,
  amount,
  currency,
  prefill,
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handlePayment = () => {
    setIsLoading(true)
    
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: 'Graphh Cosmetics',
      description: `Order #${orderId}`,
      image: 'https://graphh.com/logo.png',
      order_id: razorpayOrderId,
      prefill,
      theme: {
        color: '#E91E63',
      },
      handler: async (response: any) => {
        // Verify payment on server
        const verifyRes = await fetch('/api/v1/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
        
        const data = await verifyRes.json()
        
        if (data.success) {
          router.push(`/checkout/success?order=${orderId}`)
        } else {
          alert('Payment verification failed. Please contact support.')
        }
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false)
        },
      },
    }
    
    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }
  
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Processing...' : `Pay ₹${(amount / 100).toFixed(2)}`}
      </Button>
    </>
  )
}
```

---

## 2. Shiprocket (Shipping)

### Setup

1. Create account at [shiprocket.in](https://shiprocket.in)
2. Complete business verification
3. Add pickup addresses
4. Configure courier preferences

### Configuration

```typescript
// src/lib/shiprocket/client.ts

class ShiprocketClient {
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external'
  private token: string | null = null
  private tokenExpiry: Date | null = null
  
  async getToken(): Promise<string> {
    // Return cached token if valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token
    }
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    })
    
    const data = await response.json()
    this.token = data.token
    this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000) // 9 days
    
    return this.token
  }
  
  async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    
    return response.json()
  }
}

export const shiprocket = new ShiprocketClient()
```

### Create Shipment

```typescript
// src/lib/shiprocket/create-shipment.ts
import { shiprocket } from './client'
import { prisma } from '@/lib/db'

interface CreateShipmentParams {
  orderId: string
}

export async function createShipment({ orderId }: CreateShipmentParams) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  })
  
  if (!order) throw new Error('Order not found')
  
  const shippingAddress = order.shippingAddress as any
  
  // Create order in Shiprocket
  const shiprocketOrder = await shiprocket.request('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: '',
      billing_customer_name: shippingAddress.name,
      billing_last_name: '',
      billing_address: shippingAddress.line1,
      billing_address_2: shippingAddress.line2 || '',
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.pincode,
      billing_state: shippingAddress.state,
      billing_country: 'India',
      billing_email: order.user.email,
      billing_phone: shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.name,
        sku: item.sku || `SKU-${item.productId}`,
        units: item.quantity,
        selling_price: Number(item.price),
        discount: 0,
        tax: 0,
        hsn: '',
      })),
      payment_method: order.payment?.method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: Number(order.total),
      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    }),
  })
  
  // Generate AWB (Airway Bill)
  const awbResponse = await shiprocket.request('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({
      shipment_id: shiprocketOrder.shipment_id,
    }),
  })
  
  // Create shipment record
  await prisma.shipment.create({
    data: {
      orderId: order.id,
      shiprocketOrderId: shiprocketOrder.order_id.toString(),
      shiprocketShipmentId: shiprocketOrder.shipment_id.toString(),
      trackingNumber: awbResponse.response.data.awb_code,
      carrier: awbResponse.response.data.courier_name,
      status: 'PROCESSING',
    },
  })
  
  return shiprocketOrder
}
```

### Track Shipment

```typescript
// src/lib/shiprocket/track-shipment.ts
import { shiprocket } from './client'

export async function trackShipment(awbCode: string) {
  const tracking = await shiprocket.request(
    `/courier/track/awb/${awbCode}`
  )
  
  return {
    currentStatus: tracking.tracking_data.track_status,
    statusCode: tracking.tracking_data.shipment_status,
    activities: tracking.tracking_data.shipment_track_activities.map(
      (activity: any) => ({
        status: activity.activity,
        location: activity.location,
        date: activity.date,
      })
    ),
    estimatedDelivery: tracking.tracking_data.etd,
  }
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/shiprocket/route.ts
import { prisma } from '@/lib/db'
import { sendShipmentUpdateEmail } from '@/lib/email'

const STATUS_MAP: Record<string, string> = {
  '1': 'PICKED',
  '2': 'PICKED', 
  '3': 'IN_TRANSIT',
  '4': 'IN_TRANSIT',
  '5': 'IN_TRANSIT',
  '6': 'OUT_FOR_DELIVERY',
  '7': 'DELIVERED',
  '8': 'FAILED',
  '9': 'RETURNED',
}

export async function POST(req: Request) {
  const token = req.headers.get('x-shiprocket-token')
  
  if (token !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  
  const { awb, current_status, current_status_id, etd } = body
  
  // Update shipment
  const shipment = await prisma.shipment.update({
    where: { trackingNumber: awb },
    data: {
      status: STATUS_MAP[current_status_id] || 'IN_TRANSIT',
      estimatedDelivery: etd ? new Date(etd) : undefined,
      deliveredAt: current_status_id === '7' ? new Date() : undefined,
    },
    include: {
      order: { include: { user: true } },
    },
  })
  
  // Update order status
  if (STATUS_MAP[current_status_id]) {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: {
        status: current_status_id === '7' ? 'DELIVERED' : 
                current_status_id === '6' ? 'OUT_FOR_DELIVERY' : 
                'SHIPPED',
      },
    })
  }
  
  // Send email notification
  await sendShipmentUpdateEmail({
    to: shipment.order.user.email,
    orderNumber: shipment.order.orderNumber,
    status: current_status,
    trackingUrl: `https://shiprocket.co/tracking/${awb}`,
  })
  
  return Response.json({ received: true })
}
```

---

## 3. Cloudinary (Images)

### Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard

### Configuration

```typescript
// src/lib/cloudinary/config.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }
```

### Upload Image

```typescript
// src/lib/cloudinary/upload.ts
import { cloudinary } from './config'

interface UploadOptions {
  folder: string
  transformation?: object[]
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
}

export async function uploadImage(
  file: File | string,
  options: UploadOptions
) {
  // If File object, convert to base64
  let uploadSource: string
  
  if (file instanceof File) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    uploadSource = `data:${file.type};base64,${buffer.toString('base64')}`
  } else {
    uploadSource = file
  }
  
  const result = await cloudinary.uploader.upload(uploadSource, {
    folder: options.folder,
    resource_type: options.resourceType || 'auto',
    transformation: options.transformation || [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })
  
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  }
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}
```

### Image Transformations

```typescript
// src/lib/cloudinary/transform.ts

export function getProductImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
  } = {}
) {
  const { width = 600, height = 600, crop = 'fill' } = options
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_${crop},w_${width},h_${height},q_auto,f_auto/${publicId}`
}

export function getThumbnailUrl(publicId: string) {
  return getProductImageUrl(publicId, { width: 200, height: 200 })
}

export function getHeroImageUrl(publicId: string) {
  return getProductImageUrl(publicId, { width: 1920, height: 800, crop: 'fill' })
}
```

---

## 4. Resend (Email)

### Setup

1. Create account at [resend.com](https://resend.com)
2. Verify your domain (graphh.com)
3. Get API key

### Configuration

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

### Email Templates

```tsx
// src/lib/email/templates/order-confirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Button,
  Hr,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    price: number
    image: string
  }>
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  estimatedDelivery: string
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddress,
  estimatedDelivery,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://graphh.com/logo.png"
              alt="Graphh Cosmetics"
              width={150}
            />
          </Section>
          
          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.heading}>
              Thanks for your order, {customerName}! 🎉
            </Text>
            
            <Text style={styles.text}>
              Your order <strong>#{orderNumber}</strong> has been confirmed
              and will be shipped soon.
            </Text>
            
            <Text style={styles.text}>
              Estimated delivery: <strong>{estimatedDelivery}</strong>
            </Text>
            
            <Button
              href={`https://graphh.com/account/orders/${orderNumber}`}
              style={styles.button}
            >
              Track Your Order
            </Button>
          </Section>
          
          <Hr style={styles.hr} />
          
          {/* Order Items */}
          <Section style={styles.content}>
            <Text style={styles.subheading}>Order Summary</Text>
            
            {items.map((item, index) => (
              <div key={index} style={styles.item}>
                <Img
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  style={styles.itemImage}
                />
                <div style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    Qty: {item.quantity} × ₹{item.price}
                  </Text>
                </div>
              </div>
            ))}
          </Section>
          
          <Hr style={styles.hr} />
          
          {/* Totals */}
          <Section style={styles.content}>
            <div style={styles.totals}>
              <div style={styles.totalRow}>
                <Text>Subtotal</Text>
                <Text>₹{subtotal}</Text>
              </div>
              <div style={styles.totalRow}>
                <Text>Shipping</Text>
                <Text>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text>
              </div>
              {discount > 0 && (
                <div style={styles.totalRow}>
                  <Text>Discount</Text>
                  <Text style={{ color: '#10b981' }}>-₹{discount}</Text>
                </div>
              )}
              <Hr style={styles.hr} />
              <div style={styles.totalRow}>
                <Text style={{ fontWeight: 'bold' }}>Total</Text>
                <Text style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ₹{total}
                </Text>
              </div>
            </div>
          </Section>
          
          <Hr style={styles.hr} />
          
          {/* Shipping Address */}
          <Section style={styles.content}>
            <Text style={styles.subheading}>Shipping Address</Text>
            <Text style={styles.address}>
              {shippingAddress.line1}
              {shippingAddress.line2 && <br />}
              {shippingAddress.line2}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
            </Text>
          </Section>
          
          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact us at support@graphh.com
            </Text>
            <Text style={styles.footerText}>
              © 2024 Graphh Cosmetics. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    maxWidth: '600px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#E91E63',
    padding: '24px',
    textAlign: 'center' as const,
  },
  content: {
    padding: '24px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  subheading: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#4a5568',
    lineHeight: '24px',
  },
  button: {
    backgroundColor: '#E91E63',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '16px',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '0',
  },
  item: {
    display: 'flex',
    marginBottom: '16px',
  },
  itemImage: {
    borderRadius: '4px',
  },
  itemDetails: {
    marginLeft: '16px',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0',
  },
  itemMeta: {
    fontSize: '14px',
    color: '#718096',
    margin: '4px 0 0 0',
  },
  totals: {},
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
  },
  address: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '22px',
  },
  footer: {
    backgroundColor: '#f7fafc',
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#718096',
    margin: '4px 0',
  },
}
```

### Send Email

```typescript
// src/lib/email/send.ts
import { resend } from './resend'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { ShipmentUpdateEmail } from './templates/shipment-update'
import { WelcomeEmail } from './templates/welcome'

export async function sendOrderConfirmationEmail(order: any) {
  await resend.emails.send({
    from: 'Graphh Cosmetics <orders@graphh.com>',
    to: order.user.email,
    subject: `Order Confirmed - #${order.orderNumber}`,
    react: OrderConfirmationEmail({
      customerName: order.user.name,
      orderNumber: order.orderNumber,
      // ... other props
    }),
  })
}

export async function sendShipmentUpdateEmail({
  to,
  orderNumber,
  status,
  trackingUrl,
}: {
  to: string
  orderNumber: string
  status: string
  trackingUrl: string
}) {
  await resend.emails.send({
    from: 'Graphh Cosmetics <shipping@graphh.com>',
    to,
    subject: `Shipping Update - Order #${orderNumber}`,
    react: ShipmentUpdateEmail({
      orderNumber,
      status,
      trackingUrl,
    }),
  })
}

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  await resend.emails.send({
    from: 'Graphh Cosmetics <hello@graphh.com>',
    to: user.email,
    subject: 'Welcome to Graphh! 💄',
    react: WelcomeEmail({ name: user.name }),
  })
}
```

---

## 5. MSG91 (SMS/OTP)

### Setup

1. Create account at [msg91.com](https://msg91.com)
2. Get Auth Key
3. Create SMS templates (DLT registered)

### Send OTP

```typescript
// src/lib/sms/msg91.ts

const MSG91_BASE_URL = 'https://control.msg91.com/api/v5'

export async function sendOTP(phone: string) {
  const response = await fetch(
    `${MSG91_BASE_URL}/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}`,
    {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )
  
  return response.json()
}

export async function verifyOTP(phone: string, otp: string) {
  const response = await fetch(
    `${MSG91_BASE_URL}/otp/verify?mobile=91${phone}&otp=${otp}`,
    {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY!,
      },
    }
  )
  
  const data = await response.json()
  return data.type === 'success'
}

export async function sendSMS(phone: string, message: string) {
  const response = await fetch(`${MSG91_BASE_URL}/flow/`, {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flow_id: process.env.MSG91_FLOW_ID,
      recipients: [
        {
          mobiles: `91${phone}`,
          message,
        },
      ],
    }),
  })
  
  return response.json()
}
```

---

## 6. Sanity CMS (Content)

### Setup

1. Create project at [sanity.io](https://sanity.io)
2. Install Sanity Studio

### Schema Example

```typescript
// sanity/schemas/product.ts
export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    },
  ],
}
```

### Fetch Content

```typescript
// src/lib/sanity/client.ts
import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2024-01-01',
})

// Queries
export async function getProducts() {
  return sanity.fetch(`
    *[_type == "product" && isActive == true] | order(_createdAt desc) {
      _id,
      name,
      "slug": slug.current,
      price,
      comparePrice,
      "images": images[].asset->url,
      category->{name, slug},
      isFeatured
    }
  `)
}

export async function getProduct(slug: string) {
  return sanity.fetch(`
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      comparePrice,
      "images": images[].asset->url,
      category->{name, slug},
      ingredients,
      howToUse,
      benefits
    }
  `, { slug })
}
```

---

## Integration Summary

| Service | Purpose | Free Tier | Paid From |
|---------|---------|-----------|-----------|
| Razorpay | Payments | 2% per txn | Same |
| Shiprocket | Shipping | Per shipment | Same |
| Cloudinary | Images | 25GB/25K | ₹3,750/mo |
| Resend | Email | 3,000/mo | ₹1,700/mo |
| MSG91 | SMS/OTP | Pay per SMS | ~₹0.20/SMS |
| Sanity | CMS | 100K API calls | ₹8,300/mo |
| Sentry | Errors | 5K events | ₹2,200/mo |
| Upstash | Redis | 10K/day | ₹850/mo |
