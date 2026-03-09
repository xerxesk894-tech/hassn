/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Battery, Wrench, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Batteries from './pages/Batteries';
import Maintenance from './pages/Maintenance';
import Appointments from './pages/Appointments';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'لوحة القيادة', href: '/', icon: LayoutDashboard },
    { name: 'الزبائن', href: '/customers', icon: Users },
    { name: 'المركبات', href: '/vehicles', icon: Car },
    { name: 'البطاريات', href: '/batteries', icon: Battery },
    { name: 'سجلات الصيانة', href: '/maintenance', icon: Wrench },
    { name: 'المواعيد', href: '/appointments', icon: Calendar },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-zinc-900 text-white rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-zinc-900 text-zinc-100 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `} dir="rtl">
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Battery className="text-emerald-400" />
            ورشة EV برو
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans" dir="rtl">
        <Sidebar />
        <main className="md:mr-64 p-6 md:p-8 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/batteries" element={<Batteries />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
