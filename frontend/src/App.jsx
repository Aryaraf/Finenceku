import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Receipt, PieChart, Download, Database, Sun, Moon, Plus } from 'lucide-react';
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const API_URL = 'http://localhost:3000/api';
const CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Gaji', 'Bonus', 'Lainnya'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6', '#EC4899', '#10B981', '#6B7280'];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ date: '', type: 'Pengeluaran', category: 'Makan', amount: '', note: '' });

  // Fetch Data
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`);
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/transactions`, form);
    fetchData();
    setForm({ ...form, amount: '', note: '' }); // reset partial
    alert('Transaksi berhasil ditambahkan!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchData();
    }
  };

  const handleExport = () => window.open(`${API_URL}/export`);
  const handleBackup = () => window.open(`${API_URL}/backup`);

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentMonthData = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  
  const totalIncome = currentMonthData.filter(t => t.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = currentMonthData.filter(t => t.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = transactions.reduce((acc, curr) => curr.type === 'Pemasukan' ? acc + curr.amount : acc - curr.amount, 0);

  // Chart Data
  const expenseByCategory = currentMonthData
    .filter(t => t.type === 'Pengeluaran')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
  const chartData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Financeku</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-gray-700 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <LayoutDashboard className="mr-3" size={20}/> Dashboard
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'transactions' ? 'bg-blue-50 dark:bg-gray-700 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <Receipt className="mr-3" size={20}/> Transaksi
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'stats' ? 'bg-blue-50 dark:bg-gray-700 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <PieChart className="mr-3" size={20}/> Statistik
          </button>
        </nav>
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <button onClick={handleExport} className="flex items-center w-full p-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"><Download size={16} className="mr-2"/> Export Excel</button>
          <button onClick={handleBackup} className="flex items-center w-full p-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"><Database size={16} className="mr-2"/> Backup SQLite</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
        <header className="p-6 flex justify-between items-center border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="p-6">
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Saldo</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp {balance.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pemasukan (Bulan Ini)</p>
                  <h3 className="text-2xl font-bold text-green-500">Rp {totalIncome.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pengeluaran (Bulan Ini)</p>
                  <h3 className="text-2xl font-bold text-red-500">Rp {totalExpense.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transaksi (Bulan Ini)</p>
                  <h3 className="text-2xl font-bold text-blue-500">{currentMonthData.length}</h3>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS VIEW */}
          {activeTab === 'transactions' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Form Tambah */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-fit">
                <h3 className="text-lg font-semibold mb-4">Tambah Transaksi</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Tanggal</label>
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Jenis</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                      <option>Pemasukan</option>
                      <option>Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Kategori</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Nominal</label>
                    <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value === '' ? '' : parseFloat(e.target.value)})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Catatan</label>
                    <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex justify-center items-center">
                    <Plus size={18} className="mr-2" /> Simpan
                  </button>
                </form>
              </div>

              {/* Tabel Riwayat */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th className="p-4 font-medium">Tanggal</th>
                        <th className="p-4 font-medium">Kategori</th>
                        <th className="p-4 font-medium">Catatan</th>
                        <th className="p-4 font-medium">Nominal</th>
                        <th className="p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-4">{t.date}</td>
                          <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-600">{t.category}</span></td>
                          <td className="p-4">{t.note}</td>
                          <td className={`p-4 font-semibold ${t.type === 'Pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                            {t.type === 'Pemasukan' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4">
                            <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada transaksi.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STATISTICS VIEW */}
          {activeTab === 'stats' && (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-[400px]">
               <h3 className="text-lg font-semibold mb-4 text-center">Distribusi Pengeluaran Bulan Ini</h3>
               {chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartPie>
                     <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                       {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                   </RechartPie>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-500">Data pengeluaran bulan ini kosong.</div>
               )}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}