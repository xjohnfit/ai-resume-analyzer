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
        success_url: `${FRONTEND_URL}/settings?section=billing&checkout=success`,
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
        return_url: `${env.FRONTEND_URL}/settings?section=billing`,
    });
}

export function constructWebhookEvent(payload: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
    return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function reactivateSubscription(subscriptionId: string) {
    return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
}

export async function changeSubscriptionPlan(subscriptionId: string, newPriceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;
    return stripe.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: 'create_prorations',
    });
}
