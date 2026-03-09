import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Appointment {
  id: number;
  customer_id: number;
  vehicle_id: number;
  customer_name: string;
  make: string;
  model: string;
  plate_number: string;
  date: string;
  service_type: string;
  status: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  customer_id: number;
  make: string;
  model: string;
  plate_number: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    date: '',
    time: '',
    service_type: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
    fetchVehicles();
  }, []);

  const fetchAppointments = () => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  };

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  const fetchVehicles = () => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combine date and time
      const dateTime = `${formData.date}T${formData.time}:00`;
      
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: dateTime
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ customer_id: '', vehicle_id: '', date: '', time: '', service_type: '', status: 'scheduled' });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(a => 
    a.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter vehicles based on selected customer
  const availableVehicles = formData.customer_id 
    ? vehicles.filter(v => v.customer_id.toString() === formData.customer_id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">المواعيد</h1>
          <p className="text-zinc-500 mt-1">إدارة مواعيد الصيانة والفحص</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>حجز موعد</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text"
              placeholder="البحث بالزبون أو نوع الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-zinc-50 text-zinc-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">التاريخ والوقت</th>
                <th className="px-6 py-4 font-medium">الزبون</th>
                <th className="px-6 py-4 font-medium">المركبة</th>
                <th className="px-6 py-4 font-medium">نوع الخدمة</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">جاري التحميل...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">لا يوجد مواعيد</td></tr>
              ) : (
                filteredAppointments.map(apt => {
                  const dateObj = new Date(apt.date);
                  return (
                    <tr key={apt.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-zinc-900 font-medium">
                            <CalendarIcon size={16} className="text-emerald-500" />
                            {dateObj.toLocaleDateString('ar-EG')}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <Clock size={14} />
                            {dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900">{apt.customer_name}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        {apt.make} {apt.model} <span className="text-xs text-zinc-400 block" dir="ltr">{apt.plate_number}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{apt.service_type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                          apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {apt.status === 'scheduled' ? 'مجدول' : apt.status === 'completed' ? 'مكتمل' : 'ملغي'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">حجز موعد جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">الزبون</label>
                  <select 
                    required
                    value={formData.customer_id}
                    onChange={e => {
                      setFormData({...formData, customer_id: e.target.value, vehicle_id: ''});
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر الزبون...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">المركبة</label>
                  <select 
                    required
                    value={formData.vehicle_id}
                    onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                    disabled={!formData.customer_id}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-zinc-100"
                  >
                    <option value="">اختر المركبة...</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} - {v.plate_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">التاريخ</label>
                  <input 
                    required type="date" value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">الوقت</label>
                  <input 
                    required type="time" value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">نوع الخدمة</label>
                  <input 
                    required type="text" value={formData.service_type}
                    onChange={e => setFormData({...formData, service_type: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: فحص دوري، تغيير بطارية، صيانة محرك..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-medium transition-colors"
                >
                  تأكيد الحجز
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
