import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    items: [
        {
            description: String,
            quantity: Number,
            rate: Number,
            section: String // Optional: for section like 'Service', 'Product' etc.
        }
    ],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
        default: 'Draft'
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to calculate totals if not provided?
// For now, we'll assume frontend sends calculated totals or we calc in route.

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
