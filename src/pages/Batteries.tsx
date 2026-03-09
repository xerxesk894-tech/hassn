import { useState, useEffect, useRef } from 'react';
import { Search, Printer, Battery as BatteryIcon, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

interface BatteryType {
  id: number;
  name: string;
  capacity: number;
  price: number;
  stock: number;
  description: string;
}

export default function Batteries() {
  const [batteries, setBatteries] = useState<BatteryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBattery, setSelectedBattery] = useState<BatteryType | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/batteries')
      .then(res => res.json())
      .then(data => {
        setBatteries(data);
        setLoading(false);
      });
  }, []);

  const handlePrint = (battery: BatteryType) => {
    setSelectedBattery(battery);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredBatteries = batteries.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">أنواع البطاريات</h1>
          <p className="text-zinc-500 mt-1">إدارة المخزون، الأسعار، وطباعة الباركود</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden print:hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text"
              placeholder="البحث عن نوع بطارية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-zinc-50/50">
          {loading ? (
            <div className="col-span-full text-center py-8 text-zinc-500">جاري التحميل...</div>
          ) : filteredBatteries.length === 0 ? (
            <div className="col-span-full text-center py-8 text-zinc-500">لا يوجد بيانات</div>
          ) : (
            filteredBatteries.map(battery => (
              <div key={battery.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                    <BatteryIcon size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    battery.stock > 5 ? 'bg-emerald-100 text-emerald-700' : 
                    battery.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    المخزون: {battery.stock}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{battery.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{battery.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">السعة:</span>
                    <span className="font-medium text-zinc-900">{battery.capacity} kWh</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">السعر:</span>
                    <span className="font-bold text-emerald-600">{battery.price} د.أ</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePrint(battery)}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer size={18} />
                  <span>طباعة ملصق (QR/Barcode)</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Print View - Only visible during printing */}
      <div className="hidden print:block fixed inset-0 bg-white z-50 p-8" dir="ltr">
        {selectedBattery && (
          <div className="max-w-md mx-auto border-2 border-black p-8 rounded-2xl flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold mb-2">EV Pro Workshop</h1>
            <h2 className="text-xl font-semibold mb-6">{selectedBattery.name}</h2>
            
            <div className="mb-8 p-4 bg-white">
              <QRCodeSVG 
                value={JSON.stringify({
                  id: selectedBattery.id,
                  name: selectedBattery.name,
                  capacity: selectedBattery.capacity,
                  price: selectedBattery.price
                })} 
                size={200} 
              />
            </div>
            
            <div className="mb-6">
              <Barcode value={`BAT-${selectedBattery.id.toString().padStart(4, '0')}`} width={2} height={60} />
            </div>

            <div className="w-full border-t border-black pt-4 mt-4 text-left">
              <p className="text-lg"><strong>Capacity:</strong> {selectedBattery.capacity} kWh</p>
              <p className="text-lg"><strong>Price:</strong> {selectedBattery.price} JOD</p>
              <p className="text-sm mt-4 text-gray-500">Scan QR code for full details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
