import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendInvoiceSMS = async (to, invoice, clientName) => {
    if (!to) {
        throw new Error('Phone number is missing');
    }

    const message = `Hello ${clientName}, Invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.total.toFixed(2)} is due on ${new Date(invoice.dueDate).toLocaleDateString()}. Thank you!`;

    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log('SMS sent successfully. SID:', response.sid);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};
