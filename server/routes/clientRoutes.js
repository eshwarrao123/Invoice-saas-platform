import express from 'express';
import Client from '../models/Client.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/clients
// @desc    Create a new client
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, phone, address, logo } = req.body;

        const existingClient = await Client.findOne({ email, user: req.user.id });
        if (existingClient) {
            return res.status(400).json({ message: 'Client with this email already exists' });
        }

        const newClient = new Client({
            name,
            email,
            phone,
            address,
            logo,
            user: req.user.id
        });

        const savedClient = await newClient.save();
        res.status(201).json(savedClient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/clients
// @desc    Get all clients for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const clients = await Client.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, email, phone, address, logo } = req.body;
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name, email, phone, address, logo },
            { new: true, runValidators: true }
        );

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json(client);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
