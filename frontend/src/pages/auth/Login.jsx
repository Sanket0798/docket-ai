import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import loginIllustration from '../../assets/login-illustration.svg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(res.data.onboardingDone ? '/dashboard' : '/onboarding/step1');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.status === 403) {
        // Email not verified
        navigate('/verify-email', { state: { userId: err.response.data.userId, email: form.email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#F8F7FF] w-[57%] px-16 relative overflow-hidden">
        <div className="w-full max-w-[500px]">
          <img
            src={loginIllustration}
            alt="Login illustration"
            className="w-full h-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        {/* Bottom line decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col justify-center w-full lg:w-[43%] px-8 lg:px-[94px]">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Docket Factory
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-gray-900 leading-tight mb-2">
            Welcome to Docket Factory!
          </h2>
          <p className="text-[15px] text-gray-500">
            Please sign in to your account and start the adventure
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full h-[42px] px-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full h-[42px] px-4 pr-11 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Sign in'}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          New on our platform?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>

        {/* Terms */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-gray-400">
            By signing in, you accept our{' '}
            <span className="text-indigo-500 cursor-pointer hover:underline">Terms and Conditions</span>
          </p>
          <p className="text-xs text-indigo-500 cursor-pointer hover:underline">
            See our Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
