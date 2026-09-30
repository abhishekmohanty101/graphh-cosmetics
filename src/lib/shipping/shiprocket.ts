// Shiprocket Integration
// Documentation: https://apidocs.shiprocket.in/

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD
const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external'

let authToken: string | null = null
let tokenExpiry: number = 0

interface ShiprocketAddress {
  name: string
  phone: string
  address: string
  address_2?: string
  city: string
  state: string
  pincode: string
  country: string
}

interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  hsn?: string
}

interface CreateOrderParams {
  order_id: string
  order_date: string
  pickup_location?: string
  channel_id?: string
  billing_customer_name: string
  billing_last_name?: string
  billing_address: string
  billing_address_2?: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  shipping_customer_name?: string
  shipping_last_name?: string
  shipping_address?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_pincode?: string
  shipping_state?: string
  shipping_country?: string
  shipping_email?: string
  shipping_phone?: string
  order_items: ShiprocketOrderItem[]
  payment_method: 'Prepaid' | 'COD'
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}

async function getAuthToken(): Promise<string> {
  // Return cached token if valid
  if (authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error('Shiprocket credentials not configured')
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket')
  }

  const data = await response.json()
  authToken = data.token
  // Token valid for 10 days, but we refresh after 9 days
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000

  return authToken!
}

async function shiprocketRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const token = await getAuthToken()

  const response = await fetch(`${SHIPROCKET_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Shiprocket API error: ${response.status}`)
  }

  return response.json()
}

// Create a new order in Shiprocket
export async function createShipment(params: CreateOrderParams) {
  try {
    const result = await shiprocketRequest('/orders/create/adhoc', 'POST', params)
    return {
      success: true,
      order_id: result.order_id,
      shipment_id: result.shipment_id,
      awb_code: result.awb_code,
      courier_company_id: result.courier_company_id,
      courier_name: result.courier_name,
    }
  } catch (error) {
    console.error('Shiprocket create order error:', error)
    throw error
  }
}

// Get available courier services for a shipment
export async function getAvailableCouriers(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  codAmount: number = 0
) {
  try {
    const result = await shiprocketRequest(
      `/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${codAmount > 0 ? 1 : 0}`
    )
    return result.data.available_courier_companies || []
  } catch (error) {
    console.error('Shiprocket get couriers error:', error)
    throw error
  }
}

// Generate AWB (Air Waybill) for a shipment
export async function generateAWB(shipmentId: string, courierId: string) {
  try {
    const result = await shiprocketRequest('/courier/assign/awb', 'POST', {
      shipment_id: shipmentId,
      courier_id: courierId,
    })
    return {
      success: true,
      awb_code: result.response.data.awb_code,
      courier_name: result.response.data.courier_name,
    }
  } catch (error) {
    console.error('Shiprocket generate AWB error:', error)
    throw error
  }
}

// Request pickup for a shipment
export async function requestPickup(shipmentId: string) {
  try {
    const result = await shiprocketRequest('/courier/generate/pickup', 'POST', {
      shipment_id: [shipmentId],
    })
    return {
      success: true,
      pickup_scheduled_date: result.response.pickup_scheduled_date,
      pickup_token_number: result.response.pickup_token_number,
    }
  } catch (error) {
    console.error('Shiprocket request pickup error:', error)
    throw error
  }
}

// Track shipment by AWB
export async function trackShipment(awbCode: string) {
  try {
    const result = await shiprocketRequest(`/courier/track/awb/${awbCode}`)
    const tracking = result.tracking_data
    return {
      success: true,
      current_status: tracking.shipment_status,
      current_status_id: tracking.shipment_status_id,
      delivered_date: tracking.delivered_date,
      edd: tracking.edd, // Expected delivery date
      activities: tracking.shipment_track_activities || [],
    }
  } catch (error) {
    console.error('Shiprocket track error:', error)
    throw error
  }
}

// Track shipment by order ID
export async function trackByOrderId(orderId: string) {
  try {
    const result = await shiprocketRequest(`/courier/track?order_id=${orderId}`)
    return result
  } catch (error) {
    console.error('Shiprocket track by order error:', error)
    throw error
  }
}

// Cancel shipment
export async function cancelShipment(awbCodes: string[]) {
  try {
    const result = await shiprocketRequest('/orders/cancel', 'POST', {
      awbs: awbCodes,
    })
    return { success: true, ...result }
  } catch (error) {
    console.error('Shiprocket cancel error:', error)
    throw error
  }
}

// Get pickup locations
export async function getPickupLocations() {
  try {
    const result = await shiprocketRequest('/settings/company/pickup')
    return result.data.shipping_address || []
  } catch (error) {
    console.error('Shiprocket get pickup locations error:', error)
    throw error
  }
}

// Generate shipping label
export async function generateLabel(shipmentId: string) {
  try {
    const result = await shiprocketRequest('/courier/generate/label', 'POST', {
      shipment_id: [shipmentId],
    })
    return {
      success: true,
      label_url: result.label_url,
    }
  } catch (error) {
    console.error('Shiprocket generate label error:', error)
    throw error
  }
}

// Generate invoice
export async function generateInvoice(orderIds: string[]) {
  try {
    const result = await shiprocketRequest('/orders/print/invoice', 'POST', {
      ids: orderIds,
    })
    return {
      success: true,
      invoice_url: result.invoice_url,
    }
  } catch (error) {
    console.error('Shiprocket generate invoice error:', error)
    throw error
  }
}

// Helper to create order from our order data
export function formatOrderForShiprocket(order: {
  orderNumber: string
  createdAt: Date
  user: { firstName: string; lastName?: string; email: string }
  shippingAddress: {
    firstName: string
    lastName?: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  items: {
    name: string
    sku?: string
    quantity: number
    price: number
  }[]
  subtotal: number
  paymentStatus: string
}): CreateOrderParams {
  return {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().split('T')[0],
    billing_customer_name: order.shippingAddress.firstName,
    billing_last_name: order.shippingAddress.lastName || '',
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || '',
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.postalCode,
    billing_state: order.shippingAddress.state,
    billing_country: 'India',
    billing_email: order.user.email,
    billing_phone: order.shippingAddress.phone.replace('+91', '').replace(/\D/g, ''),
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku || 'SKU-DEFAULT',
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentStatus === 'PAID' ? 'Prepaid' : 'COD',
    sub_total: order.subtotal,
    length: 20, // Default dimensions in cm
    breadth: 15,
    height: 10,
    weight: 0.5, // Default weight in kg
  }
}
