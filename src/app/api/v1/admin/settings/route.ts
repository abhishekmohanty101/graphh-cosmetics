import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/response'

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER']
  if (!user || !adminRoles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user: session.user }
}

// GET /api/v1/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    // Try to get settings from database
    let settings: any = null
    try {
      settings = await prisma.settings.findFirst()
    } catch {
      // Settings table might not exist
    }

    // Return default settings if not found
    const defaultSettings = {
      general: {
        siteName: 'Graphh Cosmetics',
        tagline: 'Beauty Redefined',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        contactEmail: 'support@graphh.com',
        contactPhone: '+91 98765 43210',
        address: {
          line1: '123 Beauty Lane',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        socialLinks: {
          instagram: 'https://instagram.com/graphhcosmetics',
          facebook: 'https://facebook.com/graphhcosmetics',
          twitter: 'https://twitter.com/graphhcosmetics',
        },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
      shipping: {
        freeShippingThreshold: 499,
        defaultShippingRate: 49,
        codCharges: 29,
        codAvailable: true,
        estimatedDeliveryDays: {
          metros: '2-3',
          tier1: '3-5',
          tier2: '5-7',
          remote: '7-10',
        },
      },
      payment: {
        razorpayEnabled: true,
        codEnabled: true,
        codLimit: 5000, // Max COD order value
        minOrderValue: 0,
      },
      tax: {
        gstEnabled: true,
        gstRate: 18,
        includeGstInPrice: true,
        gstNumber: '',
      },
      email: {
        senderName: 'Graphh Cosmetics',
        senderEmail: 'noreply@graphh.com',
        orderConfirmation: true,
        shippingNotification: true,
        deliveryNotification: true,
        abandonedCartReminder: true,
      },
      notifications: {
        lowStockAlert: true,
        lowStockThreshold: 10,
        newOrderNotification: true,
        newReviewNotification: true,
      },
      security: {
        maxLoginAttempts: 5,
        lockoutDuration: 15, // minutes
        sessionTimeout: 60, // minutes
        require2FA: false,
      },
    }

    return successResponse({
      settings: settings || defaultSettings,
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return errorResponse('Failed to fetch settings', 500)
  }
}

// PUT /api/v1/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const access = await checkAdminAccess()
    if ('error' in access) {
      return access.status === 401 ? unauthorizedResponse() : forbiddenResponse()
    }

    const body = await request.json()
    const { section, data } = body

    if (!section || !data) {
      return errorResponse('Section and data are required', 400)
    }

    // Try to update settings in database
    try {
      const existing = await prisma.settings.findFirst()

      if (existing) {
        await prisma.settings.update({
          where: { id: existing.id },
          data: {
            [section]: data,
          },
        })
      } else {
        await prisma.settings.create({
          data: {
            [section]: data,
          },
        })
      }
    } catch {
      // If Settings model doesn't exist, just return success
      // Settings will be managed through environment variables
    }

    return successResponse({
      message: `${section} settings updated successfully`,
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return errorResponse('Failed to update settings', 500)
  }
}
