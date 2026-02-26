// PUT /api/inquiries/:id — Admin: update inquiry status
import { prisma } from '../_lib/prisma';
import { verifyAuth } from '../_lib/auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Inquiry ID is required' });
  }

  try {
    const { status } = req.body;

    if (!status || !['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be NEW, CONTACTED, or CLOSED.' });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: id as string },
      data: { status },
    });

    return res.status(200).json({ success: true, inquiry });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
}
