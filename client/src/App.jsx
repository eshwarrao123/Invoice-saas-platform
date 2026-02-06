import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import Subscription from './pages/Subscription';
import { FaUsers, FaFileInvoiceDollar, FaPlus, FaSignOutAlt, FaUserCircle, FaCreditCard } from 'react-icons/fa';
import { GiGalaxy } from "react-icons/gi";
// Mobile Bottom Nav Link
const MobileNavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-slate-400'
        }`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

// Sidebar Link Component
const SidebarLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${isActive
        ? 'bg-slate-800 text-white font-medium shadow-md shadow-brand-accent/10'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <div className={`text-lg ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

// Layout Wrapper
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const isPro = user?.subscriptionStatus === 'pro';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 fixed h-full shadow-sm z-20 flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
              <GiGalaxy />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                FinVoicer
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-10">Smart invoicing for freelancers</p>
        </div>

        <nav className="flex-1 p-4">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
          <SidebarLink to="/invoices" icon={<FaFileInvoiceDollar />} label="Invoices" />
          <SidebarLink to="/clients" icon={<FaUsers />} label="Clients" />
          <SidebarLink to="/subscription" icon={<FaCreditCard />} label="Subscription" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          {/* Plan Badge */}
          <div className={`mb-4 p-3 rounded-lg text-sm font-semibold flex justify-between items-center ${isPro ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            <span>{isPro ? 'PRO Plan' : 'Free Plan'}</span>
            {!isPro && <Link to="/subscription" className="text-blue-600 hover:underline text-xs">Upgrade</Link>}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-lg">
                <FaUserCircle />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Logged in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
              </div>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full h-full bg-slate-50/50 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto pb-10">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-30 flex justify-around items-center shadow-lg">
        <MobileNavLink to="/invoices" icon={<FaFileInvoiceDollar />} label="Invoices" />
        <MobileNavLink to="/clients" icon={<FaUsers />} label="Clients" />
        <div className="w-12 h-12 bg-blue-600 rounded-full -mt-8 flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-slate-50">
          <Link to="/invoices/new" className="text-white text-xl"><FaPlus /></Link>
        </div>
        <MobileNavLink to="/subscription" icon={<FaCreditCard />} label="Plans" />
        <button onClick={logout} className="flex flex-col items-center justify-center p-2 rounded-lg text-slate-400">
          <div className="text-xl mb-1"><FaSignOutAlt /></div>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes */}
      <Route path="/" element={<PrivateRoute><Layout><InvoiceList /></Layout></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><Layout><ClientList /></Layout></PrivateRoute>} />
      <Route path="/clients/new" element={<PrivateRoute><Layout><ClientForm /></Layout></PrivateRoute>} />
      <Route path="/clients/edit/:id" element={<PrivateRoute><Layout><ClientForm /></Layout></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><Layout><InvoiceList /></Layout></PrivateRoute>} />
      <Route path="/invoices/new" element={<PrivateRoute><Layout><InvoiceForm /></Layout></PrivateRoute>} />
      <Route path="/subscription" element={<PrivateRoute><Layout><Subscription /></Layout></PrivateRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
