import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/shipping/carriers - Get shipping carriers
export async function GET(request: NextRequest) {
  try {
    // Shipping carriers configuration (Shiprocket couriers)
    const carriers = [
      {
        id: 'carrier_delhivery',
        name: 'Delhivery',
        code: 'delhivery',
        logo: '/images/carriers/delhivery.png',
        isActive: true,
        supportsCOD: true,
        trackingUrl: 'https://www.delhivery.com/track/package/',
        avgDeliveryDays: 3,
        rating: 4.2,
      },
      {
        id: 'carrier_bluedart',
        name: 'Blue Dart',
        code: 'bluedart',
        logo: '/images/carriers/bluedart.png',
        isActive: true,
        supportsCOD: true,
        trackingUrl: 'https://www.bluedart.com/tracking/',
        avgDeliveryDays: 2,
        rating: 4.5,
      },
      {
        id: 'carrier_ekart',
        name: 'Ekart Logistics',
        code: 'ekart',
        logo: '/images/carriers/ekart.png',
        isActive: true,
        supportsCOD: true,
        trackingUrl: 'https://ekartlogistics.com/track/',
        avgDeliveryDays: 4,
        rating: 4.0,
      },
      {
        id: 'carrier_xpressbees',
        name: 'XpressBees',
        code: 'xpressbees',
        logo: '/images/carriers/xpressbees.png',
        isActive: true,
        supportsCOD: true,
        trackingUrl: 'https://www.xpressbees.com/track/',
        avgDeliveryDays: 3,
        rating: 4.1,
      },
      {
        id: 'carrier_dtdc',
        name: 'DTDC',
        code: 'dtdc',
        logo: '/images/carriers/dtdc.png',
        isActive: false,
        supportsCOD: true,
        trackingUrl: 'https://www.dtdc.in/tracking/',
        avgDeliveryDays: 5,
        rating: 3.8,
      },
    ]

    return successResponse({ carriers })
  } catch (error) {
    console.error('Get carriers error:', error)
    return errorResponse('Failed to fetch carriers', 500)
  }
}

// PATCH /api/v1/admin/shipping/carriers - Update carrier settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { carrierId, isActive, priority } = body

    if (!carrierId) {
      return errorResponse('Carrier ID is required', 400)
    }

    // In production, update in database or Shiprocket settings
    return successResponse({
      message: 'Carrier settings updated',
      carrier: {
        id: carrierId,
        isActive,
        priority,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Update carrier error:', error)
    return errorResponse('Failed to update carrier', 500)
  }
}
