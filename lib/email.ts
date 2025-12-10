// Email Service using Resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderConfirmationEmail {
  to: string;
  customerName: string;
  orderNumber: string;
  watchBrand: string;
  watchModel: string;
  totalPhp: number;
  paymentMethod: 'STRIPE_CARD' | 'BANK_TRANSFER';
  fulfillmentType: 'SHIPPING' | 'PICKUP';
}

export interface PaymentVerificationEmail {
  orderNumber: string;
  customerName: string;
  watchBrand: string;
  watchModel: string;
  totalPhp: number;
  paymentProofUrl: string;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmail) {
  try {
    await resend.emails.send({
      from: 'Manila Watch Atelier <orders@manilawatch.com>',
      to: data.to,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Thank You for Your Order!</h1>

          <p>Dear ${data.customerName},</p>

          <p>We have received your order for the <strong>${data.watchBrand} ${data.watchModel}</strong>.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Watch:</strong> ${data.watchBrand} ${data.watchModel}</p>
            <p><strong>Total:</strong> ₱${data.totalPhp.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod === 'STRIPE_CARD' ? 'Credit/Debit Card' : 'Bank Transfer'}</p>
            <p><strong>Fulfillment:</strong> ${data.fulfillmentType === 'SHIPPING' ? 'Shipping' : 'Pickup'}</p>
          </div>

          ${data.paymentMethod === 'BANK_TRANSFER' ? `
            <div style="background: #fffbea; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0;">
              <p><strong>Next Steps:</strong></p>
              <p>Your payment is currently under verification. We will confirm your order within 2 hours after verifying your payment proof.</p>
            </div>
          ` : `
            <p>Your payment has been confirmed! We will prepare your order for ${data.fulfillmentType.toLowerCase()}.</p>
          `}

          <p>For any questions, please contact us at ${process.env.ADMIN_EMAIL}</p>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            © 2025 Manila Watch Atelier. All rights reserved.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendAdminPaymentVerificationEmail(data: PaymentVerificationEmail) {
  try {
    await resend.emails.send({
      from: 'Manila Watch Atelier <system@manilawatch.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: `⚠️ Payment Verification Needed - ${data.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">New Payment to Verify</h1>

          <p>A customer has submitted a bank transfer payment proof that requires your verification.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Watch:</strong> ${data.watchBrand} ${data.watchModel}</p>
            <p><strong>Amount:</strong> ₱${data.totalPhp.toLocaleString()}</p>
          </div>

          <p><strong>Payment Proof:</strong></p>
          <p><a href="${data.paymentProofUrl}" target="_blank" style="color: #D4AF37;">View Screenshot</a></p>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders"
               style="background: #D4AF37; color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Admin Dashboard
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send admin verification email:', error);
  }
}

export async function sendPaymentApprovedEmail(data: OrderConfirmationEmail) {
  try {
    await resend.emails.send({
      from: 'Manila Watch Atelier <orders@manilawatch.com>',
      to: data.to,
      subject: `✅ Payment Verified - ${data.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Payment Verified!</h1>

          <p>Dear ${data.customerName},</p>

          <p>Great news! Your payment for the <strong>${data.watchBrand} ${data.watchModel}</strong> has been verified.</p>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p>Your order is now being processed and will be ready for ${data.fulfillmentType.toLowerCase()} soon.</p>
          </div>

          <p>We will send you another email once your order is ready.</p>

          <p>Thank you for choosing Manila Watch Atelier!</p>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            © 2025 Manila Watch Atelier. All rights reserved.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send payment approved email:', error);
  }
}

export async function sendPaymentRejectedEmail(data: OrderConfirmationEmail & { reason?: string }) {
  try {
    await resend.emails.send({
      from: 'Manila Watch Atelier <orders@manilawatch.com>',
      to: data.to,
      subject: `Payment Verification Issue - ${data.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Payment Verification Issue</h1>

          <p>Dear ${data.customerName},</p>

          <p>We were unable to verify your payment for order <strong>${data.orderNumber}</strong>.</p>

          ${data.reason ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p><strong>Reason:</strong></p>
              <p>${data.reason}</p>
            </div>
          ` : ''}

          <p>Please contact us at ${process.env.ADMIN_EMAIL} or WhatsApp to resolve this issue.</p>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            © 2025 Manila Watch Atelier. All rights reserved.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send payment rejected email:', error);
  }
}
