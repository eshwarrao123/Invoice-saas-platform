import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from "../api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure Axios defaults
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }

    useEffect(() => {
        loadUser();
    }, [token]);

    const loadUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await API.get('/api/auth/user');
            setUser(res.data);
        } catch (err) {
            console.error('Error loading user:', err);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['x-auth-token'];
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        try {
            const res = await API.post('/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            await loadUser();
            return true;
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
            return false;
        }
    };

    const login = async (formData) => {
        try {
            const res = await API.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            await loadUser();
            return true;
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['x-auth-token'];
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            register,
            login,
            logout,
            clearError,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
