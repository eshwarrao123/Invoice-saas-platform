import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (invoice, clientEmail) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: invoice.items.map(item => ({
                price_data: {
                    currency: invoice.currency.toLowerCase(),
                    product_data: {
                        name: item.description,
                    },
                    unit_amount: Math.round(item.rate * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            })),
            // Add tax if applicable (simplified for now, ideally use Stripe Tax or calculate line item)
            // For MVP, we'll just let the line items sum up. If tax is separate line item, we'd add it here.
            // If tax is a flat rate on subtotal, we might need a custom line item or use Stripe Tax features.
            // Let's stick to line items for simplicity or add a "Tax" line item if needed.

            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices`,
            customer_email: clientEmail,
            client_reference_id: invoice._id.toString(),
            metadata: {
                invoiceId: invoice._id.toString(),
                invoiceNumber: invoice.invoiceNumber
            }
        });

        return session.url;
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        throw error;
    }
};
