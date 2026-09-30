import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/webhooks/sanity - Handle Sanity CMS webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Verify webhook signature if SANITY_WEBHOOK_SECRET is set
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('sanity-webhook-signature')
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(body)
          .digest('hex')

        if (signature !== expectedSignature) {
          console.error('Sanity webhook signature mismatch')
          return errorResponse('Invalid signature', 401)
        }
      }
    }

    const event = JSON.parse(body)
    console.log('Sanity webhook received:', event)

    const { _type, _id, operation } = event

    // Handle different document types
    switch (_type) {
      case 'product':
        await handleProductUpdate(_id, operation, event)
        break

      case 'category':
        await handleCategoryUpdate(_id, operation, event)
        break

      case 'banner':
        await handleBannerUpdate(_id, operation, event)
        break

      case 'blogPost':
        await handleBlogPostUpdate(_id, operation, event)
        break

      case 'page':
        await handlePageUpdate(_id, operation, event)
        break

      default:
        console.log(`Unhandled document type: ${_type}`)
    }

    return successResponse({
      received: true,
      type: _type,
      id: _id,
      operation,
    })
  } catch (error) {
    console.error('Sanity webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}

async function handleProductUpdate(id: string, operation: string, data: any) {
  console.log(`Product ${operation}: ${id}`)
  // Revalidate product pages
  // await revalidatePath(`/products/${data.slug}`)
  // await revalidatePath('/products')
  // await revalidateTag('products')
}

async function handleCategoryUpdate(id: string, operation: string, data: any) {
  console.log(`Category ${operation}: ${id}`)
  // Revalidate category pages
  // await revalidatePath(`/category/${data.slug}`)
  // await revalidateTag('categories')
}

async function handleBannerUpdate(id: string, operation: string, data: any) {
  console.log(`Banner ${operation}: ${id}`)
  // Revalidate homepage
  // await revalidatePath('/')
  // await revalidateTag('banners')
}

async function handleBlogPostUpdate(id: string, operation: string, data: any) {
  console.log(`Blog post ${operation}: ${id}`)
  // Revalidate blog pages
  // await revalidatePath(`/blog/${data.slug}`)
  // await revalidatePath('/blog')
  // await revalidateTag('blog')
}

async function handlePageUpdate(id: string, operation: string, data: any) {
  console.log(`Page ${operation}: ${id}`)
  // Revalidate specific page
  // await revalidatePath(`/${data.slug}`)
}

// Handle GET request (for webhook verification)
export async function GET(request: NextRequest) {
  return successResponse({
    status: 'ok',
    message: 'Sanity webhook endpoint is active',
  })
}
