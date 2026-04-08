import { useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { HiArrowUpRight } from 'react-icons/hi2';

const ExportSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-[600px]">

        {/* Animated success icon */}
        <div className="relative mb-10">
          <div className="w-[160px] h-[160px] rounded-full bg-indigo-50 flex items-center justify-center">
            <MdCheckCircle size={80} className="text-indigo-600" />
          </div>
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-20" />
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border-2 border-indigo-300 opacity-40" />
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-gray-900 mb-4 leading-tight">
          Video Exported Successfully!
        </h1>

        <p className="text-[15px] text-gray-500 mb-10 leading-relaxed">
          Your project has been exported and is ready. Head back to your dashboard to manage your workspaces or start a new project.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 h-[44px] px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-md hover:shadow-lg"
        >
          Back to dashboard
          <HiArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExportSuccess;
