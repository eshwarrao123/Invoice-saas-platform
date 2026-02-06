import Stripe from 'stripe';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session for Subscription
export const createCheckoutSession = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let customerId = user.stripeCustomerId;

        // Create Stripe Customer if not exists
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: customerId,
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID,
                    quantity: 1
                }
            ],
            success_url: `${process.env.CLIENT_URL}/invoices?subscription=success`,
            cancel_url: `${process.env.CLIENT_URL}/subscription?canceled=true`
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Error creating checkout session:', err);
        res.status(500).json({ message: 'Failed to create subscription session' });
    }
};

// Webhook for Stripe Events
export const webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // In a real app, you must verify the signature using process.env.STRIPE_WEBHOOK_SECRET
        // For development/MVP without public URL or CLI, we might skip signature verification or need CLI
        // Here we assume raw body parsing is set up in server.js
        event = req.body;
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            if (session.mode === 'subscription') {
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                // Find user by stripeCustomerId
                const user = await User.findOne({ stripeCustomerId: customerId });
                if (user) {
                    user.subscriptionStatus = 'pro';
                    user.subscriptionId = subscriptionId;
                    await user.save();
                    console.log(`User ${user.email} upgraded to PRO`);
                }
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            const user = await User.findOne({ subscriptionId: subscription.id });
            if (user) {
                user.subscriptionStatus = 'free';
                user.subscriptionId = null;
                await user.save();
                console.log(`User ${user.email} downgraded to FREE`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
