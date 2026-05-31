import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Receipt, PieChart, Download, Database, Sun, Moon, Plus } from 'lucide-react';
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = 'http://localhost:3000/api';
const CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Gaji', 'Bonus', 'Lainnya'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#85BCF6', '#EC4899', '#10B981', '#6B7280'];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ date: '', type: 'Pengeluaran', category: 'Makan', amount: '', note: '' });

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions`, form);
      setForm({ date: '', type: 'Pengeluaran', category: 'Makan', amount: '', note: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving transaction", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  // Fungsi untuk Export ke Excel secara realtime dari client-side
  const exportToExcel = () => {
    if (transactions.length === 0) {
      alert('Tidak ada data transaksi untuk diexport.');
      return;
    }

    // Membuat template HTML khusus Excel agar mendukung pembatas gridlines & warna teks
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #2563EB; color: white; font-weight: bold; text-align: left; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; }
          .pemasukan { color: #16a34a; }
          .pengeluaran { color: #dc2626; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis Transaksi</th>
              <th>Kategori</th>
              <th>Nominal</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Looping data transaksi
    transactions.forEach(t => {
      const isPemasukan = t.type === 'Pemasukan';
      html += `
        <tr>
          <td>${t.date}</td>
          <td class="${isPemasukan ? 'pemasukan' : 'pengeluaran'}"><b>${t.type}</b></td>
          <td>${t.category}</td>
          <td>Rp ${Number(t.amount).toLocaleString('id-ID')}</td>
          <td>${t.note || '-'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Make file blob Excel (.xls)
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Financeku_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPemasukan = transactions
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPengeluaran = transactions
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;

  const expenseData = CATEGORIES.filter(cat => cat !== 'Gaji' && cat !== 'Bonus').map(cat => {
    const total = transactions
      .filter(t => t.type === 'Pengeluaran' && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  return (
    <div className={darkMode ? 'dark bg-gray-900 text-white min-h-screen flex' : 'bg-gray-50 text-gray-900 min-h-screen flex'}>
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8 px-2">Financeku</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'transaksi' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Receipt size={20} /> Transaksi
            </button>
            <button
              onClick={() => setActiveTab('statistik')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'statistik' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <PieChart size={20} /> Statistik
            </button>
          </nav>
        </div>
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button 
            onClick={exportToExcel}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download size={16} /> Export Excel
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Database size={16} /> Backup SQLite
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Content Body */}
        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Saldo</p>
                <p className="text-2xl font-bold mt-2">Rp {totalSaldo.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pemasukan (Bulan Ini)</p>
                <p className="text-2xl font-bold text-green-600 mt-2">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pengeluaran (Bulan Ini)</p>
                <p className="text-2xl font-bold text-red-600 mt-2">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transaksi (Bulan Ini)</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{transactions.length}</p>
              </div>
            </div>
          )}

          {activeTab === 'transaksi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                <h3 className="text-lg font-bold mb-4">Tambah Transaksi</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Jenis</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Pemasukan">Pemasukan</option>
                      <option value="Pengeluaran">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Nominal</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Catatan</label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                    <Plus size={18} /> Simpan
                  </button>
                </form>
              </div>

              {/* Table */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700 text-gray-500 text-sm">
                        <th className="pb-3 font-semibold">Tanggal</th>
                        <th className="pb-3 font-semibold">Kategori</th>
                        <th className="pb-3 font-semibold">Catatan</th>
                        <th className="pb-3 font-semibold">Nominal</th>
                        <th className="pb-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-400">Belum ada transaksi.</td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr key={t.id} className="text-sm">
                            <td className="py-3">{t.date}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md">{t.category}</span>
                            </td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{t.note || '-'}</td>
                            <td className={`py-3 font-semibold ${t.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'Pemasukan' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3">
                              <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 font-medium">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistik' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-center mb-6">Distribusi Pengeluaran Bulan Ini</h3>
              {expenseData.length === 0 ? (
                <p className="text-center py-12 text-gray-400">Belum ada data pengeluaran untuk dianalisis.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartPie>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Legend />
                  </RechartPie>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}