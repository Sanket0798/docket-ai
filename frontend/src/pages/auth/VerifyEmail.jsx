import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import loginIllustration from '../../assets/login-illustration.svg';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const userId = location.state?.userId;
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/login');
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-email', { userId, otp: otpString });
      login(res.data.token, res.data.user);
      navigate('/onboarding/step1');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { userId });
      setSuccess('OTP resent! Check your email.');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#F8F7FF] w-[57%] px-16 relative overflow-hidden">
        <div className="w-full max-w-[500px]">
          <img
            src={loginIllustration}
            alt="Verify illustration"
            className="w-full h-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col justify-center w-full lg:w-[43%] px-8 lg:px-[94px]">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Docket Factory
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-[26px] font-semibold text-gray-900 leading-tight mb-3">
            Email Verification
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            We sent a verification code to your email. Enter the code from the email in the field below.
          </p>
          {email && (
            <p className="mt-2 text-sm font-semibold text-gray-800">{email}</p>
          )}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-900"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Verify Email'}
          </button>
        </form>

        {/* Resend */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          Didn't get the code?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
