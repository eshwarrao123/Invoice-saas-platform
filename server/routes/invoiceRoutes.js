import express from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import auth from '../middleware/auth.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import { sendInvoiceSMS } from '../services/smsService.js';
import { createCheckoutSession } from '../services/paymentService.js';

const router = express.Router();

// @route   POST api/invoices
// @desc    Create a new invoice
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const {
            invoiceNumber,
            client,
            items,
            taxRate,
            currency,
            dueDate,
            notes,
            status
        } = req.body;

        // Check Subscription Limits
        if (req.user.subscriptionStatus !== 'pro') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const invoiceCount = await Invoice.countDocuments({
                user: req.user.id,
                createdAt: { $gte: startOfDay }
            });

            if (invoiceCount >= 10) {
                return res.status(403).json({
                    message: 'Free Plan Limit Reached (10 Invoices/Day). Upgrade to Pro for unlimited invoices.',
                    limitReached: true
                });
            }
        }

        // Verify that the client belongs to this user
        if (client) {
            const clientExists = await Client.findOne({ _id: client, user: req.user.id });
            if (!clientExists) {
                return res.status(404).json({ message: 'Client not found or access denied' });
            }
        }

        // specialized logic to calculate totals on backend for security/reliability
        let subTotal = 0;
        if (items) {
            items.forEach(item => {
                subTotal += Number(item.quantity) * Number(item.rate);
            });
        }

        const taxAmount = (subTotal * (taxRate || 0)) / 100;
        const total = subTotal + taxAmount;

        const newInvoice = new Invoice({
            invoiceNumber,
            client,
            items,
            subTotal,
            taxRate,
            taxAmount,
            total,
            currency,
            dueDate,
            notes,
            status,
            user: req.user.id
        });

        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/invoices
// @desc    Get all invoices for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.user.id })
            .populate('client', 'name email')
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/invoices/:id
// @desc    Get invoice by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id }).populate('client');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { items, taxRate, client } = req.body;

        // If client is being updated, verify it belongs to user
        if (client) {
            const clientExists = await Client.findOne({ _id: client, user: req.user.id });
            if (!clientExists) {
                return res.status(404).json({ message: 'Client not found or access denied' });
            }
        }

        let updateData = { ...req.body };

        if (items) {
            let subTotal = 0;
            items.forEach(item => {
                subTotal += Number(item.quantity) * Number(item.rate);
            });
            updateData.subTotal = subTotal;

            const rate = taxRate !== undefined ? taxRate : (await Invoice.findOne({ _id: req.params.id, user: req.user.id }))?.taxRate || 0;
            updateData.taxAmount = (subTotal * rate) / 100;
            updateData.total = updateData.subTotal + updateData.taxAmount;
        }

        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST api/invoices/:id/send
// @desc    Send invoice via email
// @access  Private
router.post('/:id/send', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id }).populate('client');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (!invoice.client || !invoice.client.email) {
            return res.status(400).json({ message: 'Client email is missing' });
        }

        await sendInvoiceEmail(invoice.client.email, invoice, invoice.client.name);

        if (invoice.status === 'Draft') {
            invoice.status = 'Sent';
            await invoice.save();
        }

        res.json({ message: 'Invoice sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send email', error: err.message });
    }
});

// @route   POST api/invoices/:id/send-sms
// @desc    Send invoice via SMS
// @access  Private
router.post('/:id/send-sms', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id }).populate('client');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (!invoice.client || !invoice.client.phone) {
            return res.status(400).json({ message: 'Client phone number is missing' });
        }

        await sendInvoiceSMS(invoice.client.phone, invoice, invoice.client.name);

        res.json({ message: 'SMS sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send SMS', error: err.message });
    }
});

// @route   POST api/invoices/:id/pay
// @desc    Create Stripe Checkout Session
// @access  Private
router.post('/:id/pay', auth, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id }).populate('client');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const clientEmail = invoice.client ? invoice.client.email : undefined;

        const sessionUrl = await createCheckoutSession(invoice, clientEmail);

        res.json({ url: sessionUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create payment session', error: err.message });
    }
});

export default router;
