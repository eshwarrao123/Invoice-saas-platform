import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaTrash, FaFilePdf, FaPaperPlane, FaCommentDots, FaCreditCard, FaSearch, FaFilter } from 'react-icons/fa';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import API from "../api";

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await API.get('/api/invoices');
            setInvoices(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setLoading(false);
        }
    };

    const deleteInvoice = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await API.delete(`/api/invoices/${id}`);
                fetchInvoices();
            } catch (error) {
                console.error('Error deleting invoice:', error);
            }
        }
    };

    const sendEmail = async (id) => {
        if (window.confirm('Send this invoice to the client?')) {
            try {
                await API.post(`/api/invoices/${id}/send`);
                alert('Invoice sent successfully!');
                fetchInvoices();
            } catch (error) {
                console.error('Error sending email:', error);
                alert('Failed to send email.');
            }
        }
    };

    const sendSMS = async (id) => {
        if (window.confirm('Send SMS reminder?')) {
            try {
                await API.post(`/api/invoices/${id}/send-sms`);
                alert('SMS sent successfully!');
            } catch (error) {
                console.error('Error sending SMS:', error);
                alert('Failed to send SMS.');
            }
        }
    };

    const handlePayment = async (id) => {
        try {
            const response = await API.post(`/api/invoices/${id}/pay`);
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert('Failed to generate payment link');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Failed to initiate payment');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Stats
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = totalAmount - paidAmount;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
                    <p className="text-slate-500">Manage your invoices and payments</p>
                </div>
                <Link to="/invoices/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                    <FaPlus /> Create Invoice
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500">Total Invoiced</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-emerald-600">Total Paid</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">${paidAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-orange-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">${pendingAmount.toFixed(2)}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium">
                    <FaFilter /> Filter
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                            #{invoice.invoiceNumber}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.client ? (
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{invoice.client.name}</p>
                                                <p className="text-xs text-slate-500">{invoice.client.email}</p>
                                            </div>
                                        ) : (
                                            <span className="text-red-500 text-sm">Unknown Client</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-500">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-400">Due Date</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-bold text-slate-900">
                                            {invoice.currency} {invoice.total.toFixed(2)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <div className="flex bg-slate-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => generateInvoicePDF(invoice)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                                                    title="Download PDF"
                                                >
                                                    <FaFilePdf size={14} />
                                                </button>
                                                <button
                                                    onClick={() => sendEmail(invoice._id)}
                                                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
                                                    title="Send Email"
                                                >
                                                    <FaPaperPlane size={14} />
                                                </button>
                                                <button
                                                    onClick={() => sendSMS(invoice._id)}
                                                    className="p-2 text-slate-500 hover:text-orange-500 hover:bg-white rounded-md transition-all"
                                                    title="Send SMS"
                                                >
                                                    <FaCommentDots size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handlePayment(invoice._id)}
                                                    className="p-2 text-slate-500 hover:text-purple-600 hover:bg-white rounded-md transition-all"
                                                    title="Pay via Stripe"
                                                >
                                                    <FaCreditCard size={14} />
                                                </button>
                                                <div className="w-px bg-slate-200 mx-1"></div>
                                                <button
                                                    onClick={() => deleteInvoice(invoice._id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-md transition-all"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredInvoices.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-sm">No invoices found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
