import { useState, useEffect } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get('/credits/plans')
      .then(res => setPlans(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (plan) => {
    setOrdering(plan.id);
    try {
      const res = await api.post('/credits/order', { plan_id: plan.id });

      if (res.data.is_mock) {
        // Dev mode — auto-verify without real payment
        await api.post('/credits/verify', {
          order_id:       res.data.order_id,
          payment_id:     `pay_mock_${Date.now()}`,
          payment_method: 'Mock',
        });
        setSuccessPlan(plan);
        toast(`${plan.credits} credits added to your account!`, 'success');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        // Real Razorpay checkout
        const options = {
          key:      res.data.key_id,
          amount:   res.data.amount,
          currency: res.data.currency,
          name:     'Docket Factory',
          description: `${plan.name} — ${plan.credits} Credits`,
          order_id: res.data.order_id,
          handler: async (response) => {
            try {
              await api.post('/credits/verify', {
                order_id:           res.data.order_id,
                payment_id:         response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_method:     'Razorpay',
              });
              setSuccessPlan(plan);
              toast(`${plan.credits} credits added to your account!`, 'success');
              setTimeout(() => window.location.reload(), 2000);
            } catch {
              toast('Payment verification failed. Contact support.', 'error');
            }
          },
          prefill: { name: '', email: '' },
          theme:   { color: '#6366F1' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => toast('Payment failed. Please try again.', 'error'));
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      toast('Could not initiate payment. Please try again.', 'error');
    } finally {
      setOrdering(null);
    }
  };

  const planFeatures = {
    Starter: ['100 AI credits', 'Up to 3 projects', 'PDF & Audio upload', 'Basic support'],
    Pro: ['500 AI credits', 'Unlimited projects', 'PDF & Audio upload', 'Priority support', 'Advanced AI questions'],
    Business: ['1500 AI credits', 'Unlimited projects', 'All Pro features', 'Dedicated support', 'Team collaboration', 'Custom exports'],
  };

  const planColors = {
    Starter: { bg: 'bg-white', border: 'border-gray-200', badge: '', btn: 'bg-indigo-600 hover:bg-indigo-700' },
    Pro: { bg: 'bg-indigo-600', border: 'border-indigo-600', badge: 'Most Popular', btn: 'bg-white hover:bg-gray-100 text-indigo-600' },
    Business: { bg: 'bg-white', border: 'border-gray-200', badge: '', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HiSparkles size={22} className="text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Credits</span>
          </div>
          <h1 className="text-[32px] font-bold text-gray-900 mb-3">
            Power Your Creativity with Credits
          </h1>
          <p className="text-[15px] text-gray-500 max-w-[500px] mx-auto">
            Use credits to generate images, videos, and AI-powered scenes
          </p>
        </div>

        {/* Success banner */}
        {successPlan && (
          <div className="mb-8 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 max-w-[600px] mx-auto">
            <MdCheckCircle size={22} className="text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              {successPlan.credits} credits added successfully! Refreshing...
            </p>
          </div>
        )}

        {/* Plans grid */}
        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {plans.map((plan) => {
              const colors = planColors[plan.name] || planColors.Starter;
              const features = planFeatures[plan.name] || [];
              const isPro = plan.name === 'Pro';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 p-7 transition-all
                    ${colors.border}
                    ${isPro ? 'bg-indigo-600 text-white shadow-2xl scale-[1.03]' : 'bg-white text-gray-900 shadow-sm hover:shadow-md'}`}
                >
                  {/* Badge */}
                  {colors.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                      {colors.badge}
                    </span>
                  )}

                  {/* Plan name */}
                  <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isPro ? 'text-indigo-200' : 'text-indigo-600'}`}>
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-sm font-medium ${isPro ? 'text-indigo-200' : 'text-gray-500'}`}>₹</span>
                    <span className="text-[42px] font-bold leading-none">{plan.price}</span>
                  </div>
                  <p className={`text-sm mb-6 ${isPro ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {plan.credits} credits
                  </p>

                  {/* Description */}
                  <p className={`text-sm mb-6 ${isPro ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <MdCheckCircle size={16} className={isPro ? 'text-indigo-200' : 'text-indigo-500'} />
                        <span className={isPro ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleBuy(plan)}
                    disabled={ordering === plan.id}
                    className={`w-full h-[42px] rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2
                      ${isPro
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-60`}
                  >
                    {ordering === plan.id ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : `Get ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Payments are processed securely via Razorpay. Credits never expire.
        </p>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default Credits;
