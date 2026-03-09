import { useEffect, useState } from 'react';
import { Users, Car, Calendar, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  customers: number;
  vehicles: number;
  appointments: number;
  revenue: number;
  recentAppointments: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><Activity className="animate-spin text-emerald-500" size={48} /></div>;

  const statCards = [
    { title: 'إجمالي الزبائن', value: stats?.customers || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'المركبات المسجلة', value: stats?.vehicles || 0, icon: Car, color: 'bg-emerald-500' },
    { title: 'المواعيد القادمة', value: stats?.appointments || 0, icon: Calendar, color: 'bg-amber-500' },
    { title: 'الإيرادات', value: `${stats?.revenue || 0} د.أ`, icon: DollarSign, color: 'bg-purple-500' },
  ];

  // Mock data for chart
  const chartData = [
    { name: 'يناير', revenue: 4000 },
    { name: 'فبراير', revenue: 3000 },
    { name: 'مارس', revenue: 2000 },
    { name: 'أبريل', revenue: 2780 },
    { name: 'مايو', revenue: 1890 },
    { name: 'يونيو', revenue: 2390 },
    { name: 'يوليو', revenue: 3490 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">لوحة القيادة</h1>
        <p className="text-zinc-500 mt-2">نظرة عامة على أداء ورشة صيانة السيارات الكهربائية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-xl text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">الإيرادات الشهرية</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">المواعيد الأخيرة</h2>
          <div className="space-y-4">
            {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
              stats.recentAppointments.map((apt, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900">{apt.customer_name}</h4>
                    <p className="text-sm text-zinc-500">{apt.make} {apt.model} - {apt.service_type}</p>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(apt.date).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-8">لا توجد مواعيد حديثة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
