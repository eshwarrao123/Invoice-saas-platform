import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaArrowLeft } from 'react-icons/fa';

const ClientForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchClient();
        }
    }, [id]);

    const fetchClient = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/clients/${id}`);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching client:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/clients/${id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/clients', formData);
            }
            navigate('/clients');
        } catch (error) {
            console.error('Error saving client:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link to="/clients" className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-2 text-sm">
                    <FaArrowLeft /> Back to Clients
                </Link>
                <h2 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit Client' : 'Add New Client'}</h2>
                <p className="text-slate-500">Enter the client details below</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Eshwar Rao"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <FaPhone />
                                </div>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Billing Address</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                                <FaMapMarkerAlt />
                            </div>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Street address, City, State, Zip"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link to="/clients" className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-5 py-2.5 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                        >
                            <FaSave /> {isEditMode ? 'Update Client' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
