// Email service using Resend
// To use: npm install resend

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@graphh.com'
const FROM_NAME = process.env.FROM_NAME || 'Graphh Cosmetics'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('Email send error:', error)
      throw new Error(error.message)
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (data: {
    customerName: string
    orderNumber: string
    orderTotal: number
    items: { name: string; quantity: number; price: number }[]
    shippingAddress: string
  }) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
          .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Order!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>We've received your order and it's being processed. Here are your order details:</p>
            
            <h3>Order #${data.orderNumber}</h3>
            
            ${data.items
              .map(
                (item) => `
              <div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price.toLocaleString()}</span>
              </div>
            `
              )
              .join('')}
            
            <div class="total">
              Total: ₹${data.orderTotal.toLocaleString()}
            </div>
            
            <h4>Shipping To:</h4>
            <p>${data.shippingAddress}</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" class="btn">Track Your Order</a>
          </div>
          <div class="footer">
            <p>Graphh Cosmetics | hello@graphh.com</p>
            <p>If you have any questions, reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderShipped: (data: {
    customerName: string
    orderNumber: string
    trackingNumber: string
    carrier: string
    trackingUrl?: string
  }) => ({
    subject: `Your Order #${data.orderNumber} Has Been Shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
          .tracking-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order is On Its Way!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Great news! Your order #${data.orderNumber} has been shipped and is on its way to you.</p>
            
            <div class="tracking-box">
              <p><strong>Carrier:</strong> ${data.carrier}</p>
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            </div>
            
            ${
              data.trackingUrl
                ? `<a href="${data.trackingUrl}" class="btn">Track Your Package</a>`
                : ''
            }
            
            <p style="margin-top: 30px;">Expected delivery: 3-5 business days</p>
          </div>
          <div class="footer">
            <p>Graphh Cosmetics | hello@graphh.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderDelivered: (data: {
    customerName: string
    orderNumber: string
  }) => ({
    subject: `Your Order #${data.orderNumber} Has Been Delivered!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
          .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Your order #${data.orderNumber} has been delivered. We hope you love your products!</p>
            
            <p>We'd love to hear your feedback. Please take a moment to review your purchase.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" class="btn">Review Your Products</a>
            
            <p style="margin-top: 30px;">Thank you for shopping with Graphh Cosmetics! 💖</p>
          </div>
          <div class="footer">
            <p>Graphh Cosmetics | hello@graphh.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (data: {
    customerName: string
    resetUrl: string
  }) => ({
    subject: 'Reset Your Password - Graphh Cosmetics',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
          .btn { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${data.resetUrl}" class="btn">Reset Password</a>
            
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>Graphh Cosmetics | hello@graphh.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcomeEmail: (data: {
    customerName: string
  }) => ({
    subject: 'Welcome to Graphh Cosmetics! 💖',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
          .btn { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { text-align: center; padding: 15px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Graphh! 🌸</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Thank you for joining the Graphh family! We're thrilled to have you.</p>
            
            <p>As a welcome gift, use code <strong>WELCOME10</strong> for 10% off your first order!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="btn">Start Shopping</a>
            
            <div style="display: flex; margin-top: 30px;">
              <div class="feature">
                <p>🌿 Natural Ingredients</p>
              </div>
              <div class="feature">
                <p>🐰 Cruelty-Free</p>
              </div>
              <div class="feature">
                <p>💯 Quality Assured</p>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Graphh Cosmetics | hello@graphh.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
}

// Convenience functions
export async function sendOrderConfirmation(
  email: string,
  data: Parameters<typeof emailTemplates.orderConfirmation>[0]
) {
  const template = emailTemplates.orderConfirmation(data)
  return sendEmail({ to: email, ...template })
}

export async function sendOrderShipped(
  email: string,
  data: Parameters<typeof emailTemplates.orderShipped>[0]
) {
  const template = emailTemplates.orderShipped(data)
  return sendEmail({ to: email, ...template })
}

export async function sendOrderDelivered(
  email: string,
  data: Parameters<typeof emailTemplates.orderDelivered>[0]
) {
  const template = emailTemplates.orderDelivered(data)
  return sendEmail({ to: email, ...template })
}

export async function sendPasswordReset(
  email: string,
  data: Parameters<typeof emailTemplates.passwordReset>[0]
) {
  const template = emailTemplates.passwordReset(data)
  return sendEmail({ to: email, ...template })
}

export async function sendWelcomeEmail(
  email: string,
  data: Parameters<typeof emailTemplates.welcomeEmail>[0]
) {
  const template = emailTemplates.welcomeEmail(data)
  return sendEmail({ to: email, ...template })
}
