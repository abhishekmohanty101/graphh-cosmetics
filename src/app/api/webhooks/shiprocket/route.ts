import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api/response'

// POST /api/webhooks/shiprocket - Handle Shiprocket webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Verify webhook signature if SHIPROCKET_WEBHOOK_SECRET is set
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-shiprocket-signature')
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(body)
          .digest('hex')
        
        if (signature !== expectedSignature) {
          console.error('Shiprocket webhook signature mismatch')
          return errorResponse('Invalid signature', 401)
        }
      }
    }

    const event = JSON.parse(body)
    console.log('Shiprocket webhook received:', event)

    // Handle different event types
    const { awb, current_status, current_status_id, scans } = event

    if (!awb) {
      return errorResponse('Missing AWB number', 400)
    }

    // Find shipment by tracking number
    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber: awb },
      include: { order: true },
    })

    if (!shipment) {
      console.log(`Shipment not found for AWB: ${awb}`)
      return successResponse({ received: true, message: 'Shipment not found' })
    }

    // Map Shiprocket status to our status
    const statusMap: Record<number, { shipmentStatus: string; orderStatus: string }> = {
      1: { shipmentStatus: 'PENDING', orderStatus: 'PROCESSING' }, // AWB Assigned
      2: { shipmentStatus: 'PENDING', orderStatus: 'PROCESSING' }, // Label Generated
      3: { shipmentStatus: 'PICKED', orderStatus: 'SHIPPED' }, // Pickup Scheduled
      4: { shipmentStatus: 'PICKED', orderStatus: 'SHIPPED' }, // Pickup Queued
      5: { shipmentStatus: 'PROCESSING', orderStatus: 'PROCESSING' }, // Manifest Generated
      6: { shipmentStatus: 'PICKED', orderStatus: 'SHIPPED' }, // Shipped
      7: { shipmentStatus: 'DELIVERED', orderStatus: 'DELIVERED' }, // Delivered
      8: { shipmentStatus: 'CANCELLED', orderStatus: 'CANCELLED' }, // Cancelled
      9: { shipmentStatus: 'RETURNED', orderStatus: 'RETURNED' }, // RTO Initiated
      10: { shipmentStatus: 'RETURNED', orderStatus: 'RETURNED' }, // RTO Delivered
      17: { shipmentStatus: 'OUT_FOR_DELIVERY', orderStatus: 'OUT_FOR_DELIVERY' }, // Out For Delivery
      18: { shipmentStatus: 'IN_TRANSIT', orderStatus: 'SHIPPED' }, // In Transit
      19: { shipmentStatus: 'FAILED', orderStatus: 'SHIPPED' }, // Undelivered
      20: { shipmentStatus: 'PICKED', orderStatus: 'SHIPPED' }, // Pickup Exception
      21: { shipmentStatus: 'RETURNED', orderStatus: 'RETURNED' }, // RTO In Transit
      38: { shipmentStatus: 'PICKED', orderStatus: 'SHIPPED' }, // Picked Up
    }

    const statusInfo = statusMap[current_status_id]
    if (!statusInfo) {
      console.log(`Unknown status ID: ${current_status_id}`)
      return successResponse({ received: true, message: 'Unknown status' })
    }

    // Update shipment
    const updateData: any = {
      status: statusInfo.shipmentStatus as any,
    }

    // Set timestamps based on status
    if (statusInfo.shipmentStatus === 'PICKED') {
      updateData.pickedAt = new Date()
    } else if (statusInfo.shipmentStatus === 'OUT_FOR_DELIVERY' || statusInfo.shipmentStatus === 'IN_TRANSIT') {
      if (!shipment.shippedAt) {
        updateData.shippedAt = new Date()
      }
    } else if (statusInfo.shipmentStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: updateData,
    })

    // Update order status
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: statusInfo.orderStatus as any },
    })

    // TODO: Send notification to customer
    // await sendShipmentUpdateEmail(shipment.order.userId, {
    //   orderNumber: shipment.order.orderNumber,
    //   status: current_status,
    //   trackingNumber: awb,
    // })

    console.log(`Updated shipment ${shipment.id} to status ${statusInfo.shipmentStatus}`)

    return successResponse({ 
      received: true,
      shipmentId: shipment.id,
      newStatus: statusInfo.shipmentStatus,
    })
  } catch (error) {
    console.error('Shiprocket webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}

// Handle GET request (for webhook verification if needed)
export async function GET(request: NextRequest) {
  return successResponse({ 
    status: 'ok',
    message: 'Shiprocket webhook endpoint is active',
  })
}
