import React, { useState, useEffect } from 'react';
import { Plus, Search, Car, Battery } from 'lucide-react';

interface Vehicle {
  id: number;
  customer_id: number;
  customer_name: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  plate_number: string;
  battery_type: string;
  battery_capacity: number;
}

interface Customer {
  id: number;
  name: string;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    plate_number: '',
    battery_type: '',
    battery_capacity: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  const fetchVehicles = () => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        setLoading(false);
      });
  };

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          customer_id: '', make: '', model: '', year: new Date().getFullYear(),
          vin: '', plate_number: '', battery_type: '', battery_capacity: ''
        });
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate_number.includes(searchTerm) ||
    v.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">إدارة المركبات</h1>
          <p className="text-zinc-500 mt-1">إضافة وتعديل بيانات السيارات الكهربائية</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>إضافة مركبة</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text"
              placeholder="البحث بالنوع، الموديل، أو رقم اللوحة..."
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
                <th className="px-6 py-4 font-medium">المركبة</th>
                <th className="px-6 py-4 font-medium">المالك</th>
                <th className="px-6 py-4 font-medium">رقم اللوحة</th>
                <th className="px-6 py-4 font-medium">البطارية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-zinc-500">جاري التحميل...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-zinc-500">لا يوجد مركبات</td></tr>
              ) : (
                filteredVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <Car size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-zinc-500">{vehicle.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{vehicle.customer_name}</td>
                    <td className="px-6 py-4 text-zinc-600 font-mono text-sm" dir="ltr">{vehicle.plate_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Battery size={16} className="text-emerald-500" />
                        <span className="text-sm text-zinc-600">{vehicle.battery_type} ({vehicle.battery_capacity} kWh)</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">إضافة مركبة جديدة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">المالك (الزبون)</label>
                  <select 
                    required
                    value={formData.customer_id}
                    onChange={e => setFormData({...formData, customer_id: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر الزبون...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">الشركة المصنعة (Make)</label>
                  <input 
                    required type="text" value={formData.make}
                    onChange={e => setFormData({...formData, make: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: Tesla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">الموديل (Model)</label>
                  <input 
                    required type="text" value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: Model 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">سنة الصنع</label>
                  <input 
                    required type="number" min="2000" max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">رقم اللوحة</label>
                  <input 
                    required type="text" value={formData.plate_number}
                    onChange={e => setFormData({...formData, plate_number: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">نوع البطارية</label>
                  <input 
                    required type="text" value={formData.battery_type}
                    onChange={e => setFormData({...formData, battery_type: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: Li-ion"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">سعة البطارية (kWh)</label>
                  <input 
                    required type="number" step="0.1" value={formData.battery_capacity}
                    onChange={e => setFormData({...formData, battery_capacity: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-medium transition-colors"
                >
                  حفظ
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
