import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCheck } from 'react-icons/fa';

const Subscription = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/subscription/create-checkout-session');
            window.location.href = res.data.url;
        } catch (err) {
            console.error('Upgrade failed:', err);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isPro = user?.subscriptionStatus === 'pro';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Subscription Plans</h1>
                <p className="text-slate-500">Choose the right plan for your business</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className={`p-8 rounded-2xl border-2 ${!isPro ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                            <p className="text-slate-500">For side hustles</p>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">$0<span className="text-sm font-normal text-slate-500">/mo</span></span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>10 Invoices per day</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>Client Management</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>Basic PDF Export</span>
                        </li>
                    </ul>

                    {isPro ? (
                        <button disabled className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-400 font-medium">
                            Included
                        </button>
                    ) : (
                        <button disabled className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-medium">
                            Current Plan
                        </button>
                    )}
                </div>

                {/* Pro Plan */}
                <div className={`p-8 rounded-2xl border-2 relative overflow-hidden ${isPro ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200 bg-white shadow-xl shadow-blue-900/5'}`}>
                    {isPro && (
                        <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                            ACTIVE
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                            <p className="text-slate-500">For serious freelancers</p>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">$10<span className="text-sm font-normal text-slate-500">/mo</span></span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span><strong>Unlimited</strong> Invoices</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>Priority Support</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>Remove Watermark</span>
                        </li>
                        <li className="flex items-center gap-3 text-slate-700">
                            <FaCheck className="text-blue-500 flex-shrink-0" />
                            <span>SMS Reminders</span>
                        </li>
                    </ul>

                    {isPro ? (
                        <button className="w-full py-3 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30">
                            Manage Subscription
                        </button>
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-75"
                        >
                            {loading ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Subscription;
