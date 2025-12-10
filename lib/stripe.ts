// Stripe Configuration

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Helper to format amount for Stripe (convert to cents)
export function formatAmountForStripe(amount: number, currency: string): number {
  // Stripe expects amounts in smallest currency unit
  // For PHP, 1 PHP = 100 centavos
  return Math.round(amount * 100);
}

// Helper to format Stripe amount for display
export function formatAmountFromStripe(amount: number, currency: string): number {
  return amount / 100;
}
