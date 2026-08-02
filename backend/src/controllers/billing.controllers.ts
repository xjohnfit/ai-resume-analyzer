import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.model';
import Stripe from 'stripe';
import { stripe, createCheckoutSession, createBillingPortalSession, constructWebhookEvent } from '../services/stripe.service';

import { env } from '../config/env';

const { STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY } = env;

const checkoutSchema = z.object({
    plan: z.enum(['monthly', 'yearly']),
});

export async function checkout(req: Request, res: Response) {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const priceId =
        parsed.data.plan === 'monthly'
            ? STRIPE_PRICE_ID_MONTHLY
            : STRIPE_PRICE_ID_YEARLY;

    const session = await createCheckoutSession({
        priceId,
        userId: user.id,
        customerEmail: user.email,
        existingCustomerId: user.subscription.stripeCustomerId,
    });

    res.json({ url: session.url });
}

export async function portal(req: Request, res: Response) {
    const user = await User.findById(req.user!.userId);
    if (!user?.subscription.stripeCustomerId) {
        return res.status(400).json({ error: 'No billing account yet' });
    }

    const session = await createBillingPortalSession({
        customerId: user.subscription.stripeCustomerId,
    });

    res.json({ url: session.url });
}

export async function handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
        return res.status(400).send('Missing Stripe signature');
    }

    let event: Stripe.Event;
    try {
        event = constructWebhookEvent(req.body, signature);
    } catch (error) {
        return res.status(400).send('Webhook signature verification failed');
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const subscriptionId = session.subscription as string;
            if (userId && subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;
                const plan = priceId === env.STRIPE_PRICE_ID_YEARLY ? 'yearly' : 'monthly';

                const cancelAtPeriodEnd = subscription.cancel_at_period_end || subscription.cancel_at !== null;

                await User.findByIdAndUpdate(userId, {
                    'subscription.stripeCustomerId': session.customer as string,
                    'subscription.stripeSubscriptionId': subscriptionId,
                    'subscription.stripePriceId': priceId,
                    'subscription.plan': plan,
                    'subscription.status': subscription.status,
                    'subscription.currentPeriodEnd': new Date(subscription.items.data[0].current_period_end * 1000),
                    'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd,
                });
            }
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const priceId = subscription.items.data[0].price.id;
            const plan = priceId === env.STRIPE_PRICE_ID_YEARLY ? 'yearly' : 'monthly';

            const cancelAtPeriodEnd = subscription.cancel_at_period_end || subscription.cancel_at !== null;

            await User.findOneAndUpdate(
                { 'subscription.stripeCustomerId': subscription.customer as string },
                {
                    'subscription.status': subscription.status,
                    'subscription.stripePriceId': priceId,
                    'subscription.plan': plan,
                    'subscription.currentPeriodEnd': new Date(subscription.items.data[0].current_period_end * 1000),
                    'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd,
                },
            );
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await User.findOneAndUpdate(
                { 'subscription.stripeCustomerId': subscription.customer as string },
                { 'subscription.status': 'canceled', 'subscription.plan': 'free' },
            );
            break;
        }
    }

    res.json({ received: true });
}
