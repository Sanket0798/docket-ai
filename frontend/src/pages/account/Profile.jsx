import { useState, useEffect } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { HiOutlineUser } from 'react-icons/hi';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        setForm({
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    setSaving(true);
    try {
      await api.put('/profile', { full_name: form.full_name, phone: form.phone });
      // Refresh user in context
      const res = await api.get('/auth/me');
      login(localStorage.getItem('token'), res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-8">
        {/* Header */}
        <h1 className="text-[22px] font-bold text-gray-900 mb-8">Profile Settings</h1>

        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-[900px]">
            {/* Avatar section */}
            <div className="flex items-center gap-5 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{form.full_name}</p>
                <p className="text-sm text-gray-500">{form.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MdCheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Email verified</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400 mb-0.5">Credits balance</p>
                <p className="text-xl font-bold text-indigo-600">
                  {parseFloat(user?.credits || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Success / Error */}
            {saved && (
              <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <MdCheckCircle size={18} className="text-green-500" />
                <p className="text-sm text-green-700 font-medium">Profile updated successfully!</p>
              </div>
            )}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full h-[42px] px-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className="w-full h-[42px] px-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Email — read only */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full h-[42px] px-4 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HiOutlineUser size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default Profile;
