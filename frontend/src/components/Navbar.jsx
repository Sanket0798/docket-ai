import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdPayment } from 'react-icons/md';
import { HiOutlineBell, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);

  // Refresh credits every 30s and on route change
  useEffect(() => {
    const refreshCredits = async () => {
      try {
        const res = await api.get('/auth/me');
        login(localStorage.getItem('token'), res.data);
      } catch {
        // silent fail
      }
    };

    refreshCredits();
    intervalRef.current = setInterval(refreshCredits, 30000);
    return () => clearInterval(intervalRef.current);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const credits = parseFloat(user?.credits || 0).toFixed(2);
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="w-full h-[97px] border-b border-gray-200 bg-white flex items-center px-[60px] flex-shrink-0">
      <div className="flex items-center justify-between w-full">

        {/* Logo */}
        <Link to="/dashboard" className="text-[22px] font-bold text-gray-900 tracking-tight">
          Docket Factory
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Dashboard link */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <MdDashboard size={17} />
            Dashboard
          </Link>

          {/* Payment history link */}
          <Link
            to="/payment-history"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <MdPayment size={17} />
            Payment history
          </Link>

          {/* Credits pill */}
          <Link
            to="/credits"
            className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition group"
          >
            <HiOutlineCurrencyRupee size={16} className="text-gray-400 group-hover:text-indigo-500" />
            <span className="text-gray-500 text-xs">Credits:</span>
            <span className="font-bold text-gray-900">{credits}</span>
            <span className="text-indigo-600 font-bold text-base leading-none ml-0.5">+</span>
          </Link>

          {/* Bell */}
          <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500 hover:text-gray-700">
            <HiOutlineBell size={18} />
          </button>

          {/* Avatar dropdown */}
          <div className="relative group">
            <button className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition select-none">
              {initials}
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[180px] hidden group-hover:block">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              <Link to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                👤 Profile Settings
              </Link>
              <Link to="/credit-usage"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                📊 Credit Usage
              </Link>
              <Link to="/payment-history"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                💳 Payment History
              </Link>

              <hr className="border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
