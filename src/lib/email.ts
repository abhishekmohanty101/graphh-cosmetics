import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOTPEmailParams {
  to: string
  otp: string
  name?: string
}

export async function sendOTPEmail({ to, otp, name }: SendOTPEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Graphh Beauty <noreply@graphhbeauty.com>',
      to,
      subject: 'Your Graphh Beauty Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #ec4899; font-size: 28px; margin: 0;">Graphh Beauty</h1>
                </div>
                
                <!-- Greeting -->
                <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                  Hi${name ? ` ${name}` : ''},
                </p>
                
                <!-- Message -->
                <p style="color: #374151; font-size: 16px; margin-bottom: 32px;">
                  Your verification code is:
                </p>
                
                <!-- OTP Code -->
                <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                  <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
                </div>
                
                <!-- Warning -->
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
                  This code will expire in <strong>10 minutes</strong>. Please don't share this code with anyone.
                </p>
                
                <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 8px;">
                  © ${new Date().getFullYear()} Graphh Beauty. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendWelcomeEmail({ to, name }: { to: string; name?: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Graphh Beauty <noreply@graphhbeauty.com>',
      to,
      subject: 'Welcome to Graphh Beauty! 💄',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #ec4899; font-size: 28px; margin: 0;">Graphh Beauty</h1>
                </div>
                
                <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px; text-align: center;">
                  Welcome${name ? `, ${name}` : ''}! 🎉
                </h2>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Thank you for joining Graphh Beauty! We're thrilled to have you as part of our community.
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                  Discover our curated collection of premium cosmetics and skincare products designed to make you look and feel your best.
                </p>
                
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://graphhbeauty.com'}/products" 
                     style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                    Start Shopping
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Graphh Beauty. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
