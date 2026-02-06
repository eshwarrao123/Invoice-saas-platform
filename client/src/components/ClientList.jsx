import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import API from "../api";


const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await API.get('/api/clients');
            setClients(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setLoading(false);
        }
    };

    const deleteClient = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await API.delete(`/api/clients/${id}`);
                fetchClients();
            } catch (error) {
                console.error('Error deleting client:', error);
            }
        }
    };

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
                    <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
                    <p className="text-slate-500">Manage your valuable client relationships</p>
                </div>
                <Link to="/clients/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
                    <FaPlus /> Add New Client
                </Link>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6 relative group">
                        {/* Actions Overlay */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Link to={`/clients/edit/${client._id}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                <FaEdit />
                            </Link>
                            <button onClick={() => deleteClient(client._id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600">
                                <FaTrash />
                            </button>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                                <FaUserTie />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{client.name}</h3>
                                <p className="text-xs text-slate-500">Client ID: {client._id.substring(client._id.length - 6)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <FaEnvelope className="text-slate-400" />
                                <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <FaPhone className="text-slate-400" />
                                <span>{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <FaMapMarkerAlt className="text-slate-400" />
                                <span className="truncate">{client.address || 'No Address Provided'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {clients.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUserTie size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No clients yet</h3>
                    <p className="text-slate-500 mb-6">Add your first client to start generating invoices.</p>
                    <Link to="/clients/new" className="text-blue-600 hover:text-blue-700 font-medium">
                        Add Client &rarr;
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ClientList;
