import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getPaginationParams, createPagination } from '@/lib/api/response'

// GET /api/v1/admin/shipping/zones - Get shipping zones
export async function GET(request: NextRequest) {
  try {
    // Since we don't have a ShippingZone model, return configured zones
    // In production, these would come from database
    const zones = [
      {
        id: 'zone_metros',
        name: 'Metro Cities',
        description: 'Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad',
        pincodePatterns: ['110', '400', '560', '600', '700', '500'],
        estimatedDays: '2-3',
        isActive: true,
      },
      {
        id: 'zone_tier1',
        name: 'Tier 1 Cities',
        description: 'Pune, Ahmedabad, Jaipur, Lucknow, etc.',
        pincodePatterns: ['411', '380', '302', '226'],
        estimatedDays: '3-5',
        isActive: true,
      },
      {
        id: 'zone_tier2',
        name: 'Tier 2 Cities',
        description: 'Other urban areas',
        pincodePatterns: [],
        estimatedDays: '5-7',
        isActive: true,
      },
      {
        id: 'zone_remote',
        name: 'Remote Areas',
        description: 'Rural and remote locations',
        pincodePatterns: [],
        estimatedDays: '7-10',
        isActive: true,
      },
    ]

    return successResponse({ zones })
  } catch (error) {
    console.error('Get shipping zones error:', error)
    return errorResponse('Failed to fetch shipping zones', 500)
  }
}

// POST /api/v1/admin/shipping/zones - Create/Update shipping zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, pincodePatterns, estimatedDays, isActive } = body

    if (!name) {
      return errorResponse('Zone name is required', 400)
    }

    // In production, save to database
    // For now, return success with the created zone
    const zone = {
      id: `zone_${Date.now()}`,
      name,
      description,
      pincodePatterns: pincodePatterns || [],
      estimatedDays: estimatedDays || '5-7',
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
    }

    return successResponse({ zone, message: 'Shipping zone created' })
  } catch (error) {
    console.error('Create shipping zone error:', error)
    return errorResponse('Failed to create shipping zone', 500)
  }
}
