import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

export async function POST(request: Request) {
  try {
    const { listingId, listingTitle, price, rentalPeriod, deposit, sellerId } = await request.json();

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      );
    }

    // Validate required fields
    if (!listingId || !listingTitle || !price || !rentalPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map rental period to Stripe interval
    const intervalMap: Record<string, Stripe.Price.Recurring.Interval> = {
      hourly: 'day', // Stripe doesn't support hourly, use day
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
    };

    const interval = intervalMap[rentalPeriod] || 'month';

    // Create line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${listingTitle} - ${rentalPeriod} rental`,
            description: `Recurring rental from NS Market`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
          recurring: {
            interval,
          },
        },
        quantity: 1,
      },
    ];

    // Add security deposit as one-time fee if exists
    if (deposit && deposit > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Security Deposit (one-time)',
            description: 'Refundable security deposit',
          },
          unit_amount: Math.round(deposit * 100),
        },
        quantity: 1,
      });
    }

    // Create Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/listing/${listingId}`,
      metadata: {
        listingId,
        sellerId,
        rentalPeriod,
        deposit: deposit || 0,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription session' },
      { status: 500 }
    );
  }
}
