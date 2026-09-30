import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/v1/admin/shipping/rates - Get shipping rates
export async function GET(request: NextRequest) {
  try {
    // Shipping rates configuration
    const rates = {
      standard: {
        id: 'rate_standard',
        name: 'Standard Shipping',
        description: 'Regular delivery',
        baseCost: 49,
        freeAbove: 499,
        weightRate: 10, // per 500g above 1kg
        estimatedDays: '3-7',
        isActive: true,
      },
      express: {
        id: 'rate_express',
        name: 'Express Shipping',
        description: 'Faster delivery',
        baseCost: 99,
        freeAbove: 999,
        weightRate: 15,
        estimatedDays: '1-3',
        isActive: true,
      },
      cod: {
        id: 'rate_cod',
        name: 'Cash on Delivery',
        description: 'Pay when delivered',
        handlingFee: 29,
        maxOrderValue: 5000,
        isActive: true,
      },
    }

    // Zone-based pricing
    const zonePricing = [
      { zone: 'Metro Cities', standard: 40, express: 80 },
      { zone: 'Tier 1 Cities', standard: 49, express: 99 },
      { zone: 'Tier 2 Cities', standard: 59, express: 119 },
      { zone: 'Remote Areas', standard: 79, express: 149 },
    ]

    // Weight slabs
    const weightSlabs = [
      { maxWeight: 500, additionalCost: 0 },
      { maxWeight: 1000, additionalCost: 10 },
      { maxWeight: 2000, additionalCost: 25 },
      { maxWeight: 5000, additionalCost: 50 },
    ]

    return successResponse({
      rates,
      zonePricing,
      weightSlabs,
      freeShippingThreshold: 499,
    })
  } catch (error) {
    console.error('Get shipping rates error:', error)
    return errorResponse('Failed to fetch shipping rates', 500)
  }
}

// POST /api/v1/admin/shipping/rates - Update shipping rates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rateId, baseCost, freeAbove, weightRate, isActive } = body

    if (!rateId) {
      return errorResponse('Rate ID is required', 400)
    }

    // In production, update in database
    // For now, return success
    return successResponse({
      message: 'Shipping rate updated successfully',
      rate: {
        id: rateId,
        baseCost,
        freeAbove,
        weightRate,
        isActive,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Update shipping rate error:', error)
    return errorResponse('Failed to update shipping rate', 500)
  }
}
