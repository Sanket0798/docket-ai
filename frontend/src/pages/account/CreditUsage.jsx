import { useState, useEffect } from 'react';
import { MdCheckCircle, MdWarning, MdCancel } from 'react-icons/md';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const statusConfig = {
  completed: { icon: <MdCheckCircle size={14} />, cls: 'text-green-600 bg-green-50' },
  pending: { icon: <MdWarning size={14} />, cls: 'text-yellow-600 bg-yellow-50' },
  failed: { icon: <MdCancel size={14} />, cls: 'text-red-600 bg-red-50' },
};

const CreditUsage = () => {
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowCredits, setLowCredits] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/credits/usage'),
      api.get('/credits/history'),
    ]).then(([usageRes, histRes]) => {
      setUsage(usageRes.data);
      setHistory(histRes.data);
      setLowCredits(parseFloat(usageRes.data.credits_left) < 50);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const spentPercent = usage
    ? Math.min((parseFloat(usage.total_spent) / Math.max(parseFloat(usage.total_purchased), 1)) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Low credits warning banner */}
      {lowCredits && (
        <div className="w-full bg-yellow-50 border-b border-yellow-200 px-[60px] py-3 flex items-center gap-3">
          <MdWarning size={18} className="text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-700 font-medium">
            You're running low on credits. <a href="/credits" className="underline font-semibold">Buy more credits</a> to continue.
          </p>
          <button className="ml-auto text-yellow-500 hover:text-yellow-700 text-lg leading-none">✕</button>
        </div>
      )}

      <main className="flex-1 px-[60px] py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[22px] font-bold text-gray-900">Credit Usage</h1>
          <button
            onClick={() => window.location.href = '/credits'}
            className="h-[38px] px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            + Buy Credits
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Track your credit usage and manage your activity
        </p>

        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-5 mb-10">
              {[
                { label: 'Total credits purchased', value: usage?.total_purchased || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Credits already spent', value: usage?.total_spent || 0, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Credits left to use', value: usage?.credits_left || 0, color: 'text-green-600', bg: 'bg-green-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-100`}>
                  <div className="flex items-center gap-1 mb-1">
                    <HiOutlineCurrencyRupee size={18} className={stat.color} />
                    <span className={`text-[42px] font-bold leading-none ${stat.color}`}>
                      {parseFloat(stat.value).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Usage progress bar */}
            <div className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Usage Overview</p>
                <p className="text-sm text-gray-500">
                  {parseFloat(usage?.total_spent || 0).toFixed(0)} / {parseFloat(usage?.total_purchased || 0).toFixed(0)} credits used
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${spentPercent > 80 ? 'bg-red-500' : spentPercent > 50 ? 'bg-yellow-500' : 'bg-indigo-600'}`}
                  style={{ width: `${spentPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{spentPercent.toFixed(1)}% of total credits used</p>
            </div>

            {/* Detailed history table */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Detailed Usage History</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track your credit usage and manage your activity</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
                {['Action', 'Project', 'Credits Used', 'Date', 'Status'].map(h => (
                  <p key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</p>
                ))}
              </div>

              {history.length === 0 ? (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No credit usage history yet
                </div>
              ) : (
                history.map((item, i) => {
                  const status = statusConfig[item.status] || statusConfig.completed;
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-5 gap-4 px-5 py-4 items-center border-b border-gray-100 hover:bg-gray-50 transition
                        ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <p className="text-sm text-gray-700 font-medium truncate">{item.action}</p>
                      <p className="text-sm text-gray-500 truncate">{item.project_name || '—'}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${item.type === 'credit' ? 'text-green-600' : 'text-orange-500'}`}>
                          {item.type === 'credit' ? '+' : '-'}{parseFloat(item.credits_used).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${status.cls}`}>
                        {status.icon}
                        {item.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CreditUsage;
