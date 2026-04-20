import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    name: 'Monthly',
    amount: 999,
    display: '£9.99',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    name: 'Yearly',
    amount: 9999,
    display: '£99.99',
    interval: 'year' as const,
  },
}