import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// Shipping rates configuration (can be moved to database/settings)
const SHIPPING_CONFIG = {
  freeShippingThreshold: 499,
  baseRate: 49,
  codCharges: 29,
  weightRate: 10, // per 500g
  zones: {
    metro: { days: '2-3', multiplier: 1 },
    tier1: { days: '3-5', multiplier: 1.2 },
    tier2: { days: '5-7', multiplier: 1.4 },
    remote: { days: '7-10', multiplier: 1.8 },
  },
  // Major metro pincodes (simplified)
  metroPincodes: ['110', '400', '560', '600', '500', '700'],
  // Tier 1 city pincodes
  tier1Pincodes: ['380', '411', '226', '302', '201', '122', '641'],
}

function getZone(pincode: string): keyof typeof SHIPPING_CONFIG.zones {
  const prefix = pincode.substring(0, 3)
  
  if (SHIPPING_CONFIG.metroPincodes.includes(prefix)) {
    return 'metro'
  }
  if (SHIPPING_CONFIG.tier1Pincodes.includes(prefix)) {
    return 'tier1'
  }
  // Remote areas (Northeast, J&K, etc.)
  if (['79', '78', '19', '18', '17'].some((p) => pincode.startsWith(p))) {
    return 'remote'
  }
  return 'tier2'
}

// POST /api/v1/shipping/estimate - Estimate shipping cost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pincode, cartTotal, weight, isCOD } = body

    if (!pincode || pincode.length !== 6) {
      return errorResponse('Valid 6-digit pincode is required', 400)
    }

    // Validate pincode is numeric
    if (!/^\d{6}$/.test(pincode)) {
      return errorResponse('Invalid pincode format', 400)
    }

    const zone = getZone(pincode)
    const zoneConfig = SHIPPING_CONFIG.zones[zone]

    // Check serviceability (simplified - all pincodes serviceable)
    const isServiceable = true

    if (!isServiceable) {
      return successResponse({
        serviceable: false,
        message: 'Delivery not available to this pincode',
      })
    }

    // Calculate shipping cost
    let shippingCost = SHIPPING_CONFIG.baseRate

    // Add weight-based charges
    if (weight && weight > 500) {
      const extraWeight = Math.ceil((weight - 500) / 500)
      shippingCost += extraWeight * SHIPPING_CONFIG.weightRate
    }

    // Apply zone multiplier
    shippingCost = Math.round(shippingCost * zoneConfig.multiplier)

    // Check free shipping eligibility
    const qualifiesForFreeShipping = cartTotal && cartTotal >= SHIPPING_CONFIG.freeShippingThreshold
    if (qualifiesForFreeShipping) {
      shippingCost = 0
    }

    // COD charges
    const codCharges = isCOD ? SHIPPING_CONFIG.codCharges : 0

    return successResponse({
      serviceable: true,
      pincode,
      zone,
      shipping: {
        cost: shippingCost,
        freeShipping: qualifiesForFreeShipping,
        freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,
        amountForFreeShipping: cartTotal 
          ? Math.max(0, SHIPPING_CONFIG.freeShippingThreshold - cartTotal)
          : SHIPPING_CONFIG.freeShippingThreshold,
      },
      cod: {
        available: true,
        charges: codCharges,
      },
      delivery: {
        estimatedDays: zoneConfig.days,
        message: `Estimated delivery in ${zoneConfig.days} business days`,
      },
      total: {
        shipping: shippingCost,
        cod: codCharges,
        total: shippingCost + codCharges,
      },
    })
  } catch (error) {
    console.error('Shipping estimate error:', error)
    return errorResponse('Failed to calculate shipping', 500)
  }
}
