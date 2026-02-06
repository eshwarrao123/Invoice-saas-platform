import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import API from "../api";

const InvoiceForm = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);

    // Form State
    const [invoiceData, setInvoiceData] = useState({
        client: '',
        invoiceNumber: `INV-${Date.now()}`, // Quick generation
        dueDate: '',
        currency: 'USD',
        status: 'Draft',
        notes: '',
        items: [
            { description: '', quantity: 1, rate: 0 }
        ]
    });

    // Totals State
    const [totals, setTotals] = useState({
        subTotal: 0,
        taxRate: 0, // Percentage
        taxAmount: 0,
        total: 0
    });

    const [error, setError] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    // Recalculate totals whenever items or tax rate changes
    useEffect(() => {
        calculateTotals();
    }, [invoiceData.items, totals.taxRate]);

    const fetchClients = async () => {
        try {
            const res = await API.get('/api/clients');
            setClients(res.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const calculateTotals = () => {
        const subTotal = invoiceData.items.reduce((sum, item) => {
            return sum + (item.quantity * item.rate);
        }, 0);

        const taxAmount = subTotal * (totals.taxRate / 100);
        const total = subTotal + taxAmount;

        setTotals(prev => ({
            ...prev,
            subTotal,
            taxAmount,
            total
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setInvoiceData({ ...invoiceData, [name]: value });
    };

    // Item Handlers
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...invoiceData.items];
        newItems[index][name] = name === 'description' ? value : parseFloat(value) || 0;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const addItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...invoiceData,
                ...totals
            };
            await API.post('/api/invoices', payload);
            navigate('/invoices');
        } catch (error) {
            console.error('Error creating invoice:', error);
            const msg = error.response?.data?.message || 'Failed to create invoice';
            setError(msg);
        }
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/invoices" className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-2 text-sm">
                    <FaArrowLeft /> Back to Invoices
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">New Invoice</h2>
                        <p className="text-slate-500">Create a new invoice for your client</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Invoice Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={invoiceData.invoiceNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Client</label>
                            <select
                                name="client"
                                value={invoiceData.client}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">-- Choose Client --</option>
                                {clients.map(client => (
                                    <option key={client._id} value={client._id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <FaCalendarAlt />
                                </div>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={invoiceData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Items */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                        <h3 className="text-lg font-bold text-slate-800">Line Items</h3>
                        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            <FaPlus size={12} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 hidden md:grid">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-2 text-right">Rate</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="md:col-span-6">
                                    <label className="md:hidden text-xs font-bold text-slate-500 mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="md:hidden text-xs font-bold text-slate-500 mb-1 block">Qty</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="1"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-right focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="md:hidden text-xs font-bold text-slate-500 mb-1 block">Rate</label>
                                    <input
                                        type="number"
                                        name="rate"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded bg-white text-right focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center justify-between gap-2">
                                    <span className="font-mono font-medium text-slate-700">
                                        {(item.quantity * item.rate).toFixed(2)}
                                    </span>
                                    {invoiceData.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-1">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: Totals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes / Payment Instructions</label>
                        <textarea
                            name="notes"
                            value={invoiceData.notes}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Thank you for your business. Payment via wire transfer..."
                        ></textarea>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span>{invoiceData.currency} {totals.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Tax Rate (%):</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={totals.taxRate}
                                    onChange={(e) => setTotals({ ...totals, taxRate: parseFloat(e.target.value) || 0 })}
                                    className="w-20 px-2 py-1 border border-slate-200 rounded text-right focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tax Amount:</span>
                                <span>{invoiceData.currency} {totals.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">Total:</span>
                                <span className="text-2xl font-bold text-blue-600">{invoiceData.currency} {totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 pt-2 pb-10">
                    <div className="flex gap-3">
                        <Link to="/invoices" className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-8 py-3 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                        >
                            <FaSave /> Create Invoice
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 font-medium text-sm">{error}</p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;
