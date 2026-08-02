import Stripe from 'stripe';
import { env } from '../config/env';

const { STRIPE_SECRET_KEY, FRONTEND_URL, STRIPE_WEBHOOK_SECRET } = env;

export const stripe = new Stripe(STRIPE_SECRET_KEY);

interface CreateCheckoutSessionParams {
    priceId: string;
    userId: string;
    customerEmail: string;
    existingCustomerId?: string;
}

export async function createCheckoutSession({
    priceId,
    userId,
    customerEmail,
    existingCustomerId,
}: CreateCheckoutSessionParams) {
    return stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${FRONTEND_URL}/billing?checkout=success`,
        cancel_url: `${FRONTEND_URL}/pricing?checkout=cancel`,
        client_reference_id: userId,
        customer: existingCustomerId,
        customer_email: existingCustomerId ? undefined : customerEmail,
    });
}

interface CreateBillingPortalSessionParams {
    customerId: string;
}

export async function createBillingPortalSession({
    customerId,
}: CreateBillingPortalSessionParams) {
    return stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${env.FRONTEND_URL}/billing`,
    });
}

export function constructWebhookEvent(payload: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}
