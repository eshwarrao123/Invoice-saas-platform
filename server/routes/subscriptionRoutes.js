import express from 'express';
import auth from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscriptionController.js';

const router = express.Router();

// @route   POST api/subscription/create-checkout-session
// @desc    Create Stripe Checkout Session for Pro Plan
// @access  Private
router.post('/create-checkout-session', auth, subscriptionController.createCheckoutSession);

// @route   POST api/subscription/webhook
// @desc    Stripe Webhook
// @access  Public
router.post('/webhook', subscriptionController.webhook);

export default router;
