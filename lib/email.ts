// Email Service using Resend — Inquiry notifications only

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InquiryNotificationEmail {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  watchBrand?: string;
  watchModel?: string;
  watchReference?: string;
  watchPrice?: number;
}

export async function sendInquiryNotificationEmail(data: InquiryNotificationEmail) {
  try {
    const watchInfo = data.watchBrand
      ? `${data.watchBrand} ${data.watchModel} Ref. ${data.watchReference}`
      : 'General Inquiry';

    const priceInfo = data.watchPrice
      ? `<p><strong>Listed Price:</strong> ₱${data.watchPrice.toLocaleString()}</p>`
      : '';

    await resend.emails.send({
      from: 'Manila Watch Atelier <inquiries@manilawatch.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: `New inquiry about ${watchInfo}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">New Watch Inquiry</h1>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
            ${data.customerPhone ? `<p><strong>Phone:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>` : ''}
          </div>

          ${data.watchBrand ? `
          <div style="background: #fffbea; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0;">
            <h3>Watch</h3>
            <p><strong>${data.watchBrand} ${data.watchModel}</strong></p>
            <p>Ref. ${data.watchReference}</p>
            ${priceInfo}
          </div>
          ` : ''}

          <div style="margin: 20px 0;">
            <h3>Message</h3>
            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${data.message || 'No message provided.'}</p>
          </div>

          <p style="margin-top: 30px;">
            <a href="${process.env.APP_URL || 'https://manilawatch.com'}/admin/dashboard"
               style="background: #D4AF37; color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Admin Dashboard
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Manila Watch Atelier — Inquiry System
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send inquiry notification email:', error);
  }
}
