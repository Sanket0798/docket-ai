import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Refresh credits on route change
  useEffect(() => {
    const refreshCredits = async () => {
      try {
        const res = await api.get('/auth/me');
        login(localStorage.getItem('token'), res.data);
      } catch {
        // silent
      }
    };
    refreshCredits();
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const credits = parseFloat(user?.credits || 0).toFixed(2);
  const initials = user?.first_name
    ? (user.first_name[0] + (user.last_name?.[0] || '')).toUpperCase()
    : 'U';

  return (
    <nav className="w-full h-[97px] bg-[#FBFCFF] flex items-center px-[60px] shrink-0">
      <div className="flex items-center justify-between w-full">

        {/* Logo */}
        <Link to="/dashboard" className="text-[20px] font-bold text-gray-900 tracking-tight">
          Docket Factory
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">

          <div className='flex items-center justify-between gap-5'>
            {/* Dashboard link */}
            <Link to="/dashboard"
              className="flex items-center gap-1 font-normal text-base text-brand-color transition">
              <img src="/assets/icons/Dashboard.svg" alt="" />
              Dashboard
            </Link>

            {/* Payment history link */}
            <Link to="/payment-history"
              className="flex items-center gap-1 font-normal text-base text-[#484848] transition">
              <img src="/assets/icons/Rupee.svg" alt="" />
              Payment history
            </Link>
          </div>

          {/* Credits pill */}
          <Link to="/credits"
            className="flex items-center border border-button-border rounded-[4px] p-[7px] text-sm hover:border-indigo-300 hover:bg-indigo-50 transition group">
            <img src="/assets/icons/Credits.svg" alt="" />
            <span className="font-normal text-xs leading-relaxed ml-1">Credits:</span>
            <span className="font-normal text-xs text-[#F2245B] flex items-center"><span>
              <img src="/assets/icons/Rupee.svg" alt="" className='text-white w-3 h-3' />
            </span> {credits} +</span>
          </Link>

          {/* Bell */}
          <button className="w-9 h-9 flex items-center justify-center border border-button-border rounded-[4px] hover:bg-gray-50 transition">
            <img src="/assets/icons/Bell.svg" alt="Notifications" />
          </button>

          {/* Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="w-9 h-9 flex items-center justify-center bg-[#E6F0FF] text-info border border-[#94B8FF] rounded-[4px] font-bold text-base transition select-none cursor-pointer"
            >
              {initials}
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-11 bg-white border border-[#C3C3C3] z-50 min-w-[239px] gap-y-1 flex flex-col">
                {/* <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div> */}
                <Link to="/profile" onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2 font-normal text-[15px] leading-[22px] text-[#777485] hover:bg-gray-50 transition">
                  <div className='flex items-center gap-2'>
                    <img src="/assets/icons/smart-home.svg" alt="" />
                    Profile Settings
                  </div>
                  <img src="assets/icons/chevron-right.svg" alt="" />
                </Link>
                <Link to="/credit-usage" onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2 font-normal text-[15px] leading-[22px] text-[#777485] hover:bg-gray-50 transition">
                  <div className='flex items-center gap-2'>
                    <img src="assets/icons/data-usage.svg" alt="" />
                    Credit Usage
                  </div>
                  <img src="assets/icons/chevron-right.svg" alt="" />
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center justify-between px-4 py-2 font-normal text-[15px] leading-[22px] text-[#777485] hover:bg-gray-50 transition">
                  <div className='flex items-center gap-2'>
                    <img src="assets/icons/layout-grid.svg" alt="" />
                    Logout
                  </div>
                  <img src="assets/icons/chevron-right.svg" alt="" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
