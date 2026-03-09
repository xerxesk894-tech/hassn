import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, DollarSign } from 'lucide-react';

interface MaintenanceRecord {
  id: number;
  vehicle_id: number;
  make: string;
  model: string;
  plate_number: string;
  customer_name: string;
  date: string;
  description: string;
  cost: number;
  status: string;
  notes: string;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  plate_number: string;
  customer_name: string;
}

export default function Maintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    description: '',
    cost: '',
    status: 'completed',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchVehicles();
  }, []);

  const fetchRecords = () => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      });
  };

  const fetchVehicles = () => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ vehicle_id: '', description: '', cost: '', status: 'completed', notes: '' });
        fetchRecords();
      }
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.plate_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">سجلات الصيانة</h1>
          <p className="text-zinc-500 mt-1">تتبع عمليات الصيانة والتكاليف</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>إضافة سجل صيانة</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text"
              placeholder="البحث بالوصف، الزبون، أو رقم اللوحة..."
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
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المركبة / الزبون</th>
                <th className="px-6 py-4 font-medium">الوصف</th>
                <th className="px-6 py-4 font-medium">التكلفة</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">جاري التحميل...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-500">لا يوجد سجلات صيانة</td></tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 text-sm">
                      {new Date(record.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-100 p-2 rounded-full text-zinc-600">
                          <Wrench size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{record.make} {record.model}</p>
                          <p className="text-xs text-zinc-500">{record.customer_name} - {record.plate_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-xs truncate">{record.description}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-600">{record.cost} د.أ</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        record.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status === 'completed' ? 'مكتمل' : record.status === 'pending' ? 'قيد الانتظار' : record.status}
                      </span>
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
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">إضافة سجل صيانة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">المركبة</label>
                  <select 
                    required
                    value={formData.vehicle_id}
                    onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر المركبة...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} - {v.plate_number} ({v.customer_name})</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">وصف الصيانة</label>
                  <textarea 
                    required rows={3} value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="تفاصيل العمل الذي تم إنجازه..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">التكلفة (د.أ)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      required type="number" step="0.01" min="0" value={formData.cost}
                      onChange={e => setFormData({...formData, cost: e.target.value})}
                      className="w-full pl-4 pr-10 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">الحالة</label>
                  <select 
                    required value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="completed">مكتمل</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">جاري العمل</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">ملاحظات إضافية (اختياري)</label>
                  <textarea 
                    rows={2} value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-medium transition-colors"
                >
                  حفظ السجل
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
