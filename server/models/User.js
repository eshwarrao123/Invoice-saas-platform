import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String
    },
    subscriptionId: {
        type: String
    }
});

const User = mongoose.model('User', UserSchema);
export default User;
