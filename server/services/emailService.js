import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendInvoiceEmail = async (to, invoice, clientName) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM || 'invoices@example.com', // Verified sender
        subject: `Invoice #${invoice.invoiceNumber} from My Freelance Business`,
        // In a real app, you'd attach the PDF here. For MVP, we'll send a link or just details.
        // Attaching generated PDF requires passing the buffer from frontend or generating it on backend.
        // For simplicity heavily requested by user, we'll generate simple HTML body for now.
        html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${clientName},</h2>
        <p>Here is your invoice <strong>#${invoice.invoiceNumber}</strong>.</p>
        <p><strong>Amount Due:</strong> ${invoice.currency} ${invoice.total.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <br/>
        <p>Please make the payment by the due date.</p>
        <p>Thank you for your business!</p>
      </div>
    `,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent to', to);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};
