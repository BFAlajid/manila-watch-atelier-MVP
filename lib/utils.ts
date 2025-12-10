// Utility Functions

import { prisma } from './prisma';

/**
 * Generate unique order number
 * Format: MWA-YYYY-NNNN (e.g., MWA-2025-0001)
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MWA-${year}-`;

  // Find the latest order for this year
  const latestOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextNumber = 1;

  if (latestOrder) {
    // Extract number from MWA-2025-0001
    const currentNumber = parseInt(latestOrder.orderNumber.split('-')[2]);
    nextNumber = currentNumber + 1;
  }

  // Pad with zeros (0001, 0002, etc.)
  const paddedNumber = String(nextNumber).padStart(4, '0');

  return `${prefix}${paddedNumber}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    SGD: 'S$',
    HKD: 'HK$',
    AUD: 'A$',
  };

  const symbol = currencySymbols[currency] || currency;

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it's a valid number with 10-15 digits
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Sanitize filename for upload
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.\-_]/gi, '_')
    .toLowerCase();
}

/**
 * Get order status display name
 */
export function getOrderStatusDisplay(status: string): {
  label: string;
  color: string;
} {
  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: 'gray' },
    PAYMENT_PENDING: { label: 'Payment Pending', color: 'yellow' },
    PAYMENT_VERIFIED: { label: 'Payment Verified', color: 'green' },
    PROCESSING: { label: 'Processing', color: 'blue' },
    READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'purple' },
    SHIPPED: { label: 'Shipped', color: 'blue' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
  };

  return statusMap[status] || { label: status, color: 'gray' };
}

/**
 * Get payment status display name
 */
export function getPaymentStatusDisplay(status: string): {
  label: string;
  color: string;
} {
  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: 'yellow' },
    AWAITING_VERIFICATION: { label: 'Awaiting Verification', color: 'orange' },
    VERIFIED: { label: 'Verified', color: 'green' },
    FAILED: { label: 'Failed', color: 'red' },
    REFUNDED: { label: 'Refunded', color: 'gray' },
  };

  return statusMap[status] || { label: status, color: 'gray' };
}
