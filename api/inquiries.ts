// POST /api/inquiries — public: submit inquiry
// GET  /api/inquiries — admin: list all inquiries
import { prisma } from './_lib/prisma';
import { verifyAuth } from './_lib/auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: public — submit inquiry ──
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message, watchId } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Rate limit: 3 inquiries per email per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCount = await prisma.inquiry.count({
        where: {
          email,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentCount >= 3) {
        return res.status(429).json({ error: 'Too many inquiries. Please try again later.' });
      }

      // If watchId provided, verify watch exists
      let watch = null;
      if (watchId) {
        watch = await prisma.watch.findUnique({
          where: { id: watchId },
          select: { id: true, brand: true, model: true, reference: true, pricePHP: true },
        });
      }

      const inquiry = await prisma.inquiry.create({
        data: {
          name,
          email,
          phone: phone || null,
          message: message || '',
          watchId: watch?.id || null,
          source: 'FORM',
          status: 'NEW',
        },
      });

      // Send email notification (async, don't block response)
      try {
        const emailModule = await import('../lib/email');
        await emailModule.sendInquiryNotificationEmail({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          message: message || '',
          watchBrand: watch?.brand,
          watchModel: watch?.model,
          watchReference: watch?.reference,
          watchPrice: watch?.pricePHP,
        });
      } catch (emailError) {
        console.error('Email notification failed (non-blocking):', emailError);
      }

      return res.status(201).json({ success: true, id: inquiry.id });
    } catch (error) {
      console.error('Error creating inquiry:', error);
      return res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  }

  // ── GET: admin — list inquiries ──
  if (req.method === 'GET') {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { status, limit } = req.query;

      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = status;
      }

      const inquiries = await prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit) : 100,
        include: {
          watch: {
            select: {
              id: true,
              slug: true,
              brand: true,
              model: true,
              reference: true,
              pricePHP: true,
              images: true,
            },
          },
        },
      });

      return res.status(200).json(inquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
