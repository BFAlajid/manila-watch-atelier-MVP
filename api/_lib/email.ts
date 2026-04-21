import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface InquiryNotification {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string;
  source?: string;
  createdAt: string;
  watch?: {
    brand: string;
    model: string;
    reference: string;
    pricePHP?: number | null;
  } | null;
}

export async function sendInquiryNotification(inquiry: InquiryNotification): Promise<boolean> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — inquiry notification skipped');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@manilawatch.com';
  const fromAddress = process.env.EMAIL_FROM || 'Manila Watch Atelier <notifications@manilawatch.com>';
  const sourceLabel = inquiry.source === 'AI_CHAT' ? ' (AI Chat Lead)' : '';

  const watchInfo = inquiry.watch
    ? `\n\nWatch: ${inquiry.watch.brand} ${inquiry.watch.model} (Ref. ${inquiry.watch.reference})\nPrice: PHP ${inquiry.watch.pricePHP?.toLocaleString() ?? 'N/A'}`
    : '';

  const body = [
    'New inquiry received:',
    '',
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email || 'N/A'}`,
    `Phone: ${inquiry.phone || 'N/A'}`,
    `Message: ${inquiry.message || 'No message'}`,
    watchInfo,
    '',
    `Received: ${inquiry.createdAt}`,
    `Inquiry ID: ${inquiry.id}`,
  ].join('\n');

  try {
    await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: `New Inquiry${sourceLabel} from ${inquiry.name}`,
      text: body,
    });
    return true;
  } catch (err: any) {
    console.error('[email] Failed to send inquiry notification:', err?.message || err);
    return false;
  }
}
