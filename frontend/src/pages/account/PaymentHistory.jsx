import { useState, useEffect } from 'react';
import { MdCheckCircle, MdWarning, MdCancel, MdSearch } from 'react-icons/md';
import { HiOutlineDownload } from 'react-icons/hi';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const statusConfig = {
  completed: { icon: <MdCheckCircle size={15} />, label: 'Completed', cls: 'text-green-600 bg-green-50' },
  pending:   { icon: <MdWarning size={15} />,     label: 'Pending',   cls: 'text-yellow-600 bg-yellow-50' },
  failed:    { icon: <MdCancel size={15} />,      label: 'Failed',    cls: 'text-red-600 bg-red-50' },
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/credits/payments')
      .then(res => setPayments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    p.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpay_order_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_method?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[22px] font-bold text-gray-900">Payment History</h1>
          <button
            onClick={() => window.location.href = '/credits'}
            className="h-[38px] px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            + Buy Credits
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Track your billing activity, invoices, and subscription payments
        </p>

        {/* Search */}
        <div className="relative mb-6 max-w-[400px]">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-[42px] pl-9 pr-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-6 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200">
              {['Transaction ID', 'Plan / Product', 'Amount', 'Payment Method', 'Date', 'Status'].map(h => (
                <p key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-gray-400 text-sm">
                {search ? 'No transactions match your search' : 'No payment history yet'}
              </div>
            ) : (
              filtered.map((p, i) => {
                const status = statusConfig[p.status] || statusConfig.pending;
                return (
                  <div
                    key={p.id}
                    className={`grid grid-cols-6 gap-4 px-5 py-4 items-center border-b border-gray-100 hover:bg-gray-50 transition
                      ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <p className="text-sm text-gray-700 font-mono truncate">
                      {p.razorpay_order_id?.slice(0, 14) || '—'}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">{p.plan_name || '—'}</p>
                    <p className="text-sm text-gray-900 font-semibold">₹{p.amount}</p>
                    <p className="text-sm text-gray-600">{p.payment_method || '—'}</p>
                    <p className="text-sm text-gray-500">{formatDate(p.created_at)}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                        {status.icon} {status.label}
                      </span>
                      {p.status === 'completed' && (
                        <button className="ml-1 text-gray-400 hover:text-indigo-600 transition" title="Download Invoice">
                          <HiOutlineDownload size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default PaymentHistory;
