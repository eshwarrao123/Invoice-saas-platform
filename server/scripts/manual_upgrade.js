import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load env vars
dotenv.config({ path: '../.env' });

const email = 'erao2303@gmai.com';

const upgradeUser = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.subscriptionStatus = 'pro';
        // Optional: Set a fake subscription ID if validation requires it, but usually status is enough
        user.stripeCustomerId = user.stripeCustomerId || 'cus_manual_dev_update';
        user.subscriptionId = user.subscriptionId || 'sub_manual_dev_update';

        await user.save();

        console.log(`SUCCESS: User ${email} has been upgraded to PRO.`);
        console.log('New Status:', user.subscriptionStatus);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

upgradeUser();
