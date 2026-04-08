import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';

const ScriptSubmitted = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'my_workspace';

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/questions`,
        { state: { workspaceName } });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-[500px]">
        {/* Animated check */}
        <div className="relative mb-8">
          <div className="w-[140px] h-[140px] rounded-full bg-indigo-50 flex items-center justify-center">
            <MdCheckCircle size={72} className="text-indigo-600" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-30" />
        </div>

        <h1 className="text-[28px] font-bold text-gray-900 mb-3">
          Your script has been submitted!
        </h1>

        <p className="text-[15px] text-gray-500 mb-2">
          Analyzing your script, please wait...
        </p>
        <p className="text-[14px] text-gray-400 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
          Redirecting to next step...
        </p>
      </div>
    </div>
  );
};

export default ScriptSubmitted;
