import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BsFilePdf, BsMicFill } from 'react-icons/bs';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const UploadScript = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'my_workspace';

  const [creating, setCreating] = useState(false);

  const handleChoice = async (type) => {
    setCreating(true);
    try {
      // Create a new project in this workspace
      const res = await api.post(`/projects/workspace/${workspaceId}`, {
        name: `Project ${Date.now()}`,
      });
      const projectId = res.data.id;
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/editor`,
        { state: { workspaceName, uploadType: type } }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ← Back
          </button>
          <span className="text-gray-300 mx-2">/</span>
          <span className="text-gray-500 font-medium">{workspaceName}</span>
          <span className="text-gray-300 mx-2">/</span>
          <span className="text-gray-900 font-semibold">New Project</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            Choose a way to upload a script
          </h1>
          <p className="text-[15px] text-gray-500">
            Select the script upload method
          </p>
        </div>

        {/* Choice cards */}
        <div className="flex items-center justify-center gap-6">
          {/* PDF */}
          <button
            onClick={() => handleChoice('pdf')}
            disabled={creating}
            className="group flex flex-col items-center justify-center gap-4 w-[340px] h-[160px] border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition disabled:opacity-50"
          >
            <BsFilePdf size={48} className="text-red-400 group-hover:text-indigo-500 transition" />
            <span className="text-base font-semibold text-gray-700 group-hover:text-indigo-700 transition">
              Upload a PDF file
            </span>
          </button>

          {/* Audio */}
          <button
            onClick={() => handleChoice('audio')}
            disabled={creating}
            className="group flex flex-col items-center justify-center gap-4 w-[340px] h-[160px] border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition disabled:opacity-50"
          >
            <BsMicFill size={44} className="text-indigo-400 group-hover:text-indigo-500 transition" />
            <span className="text-base font-semibold text-gray-700 group-hover:text-indigo-700 transition">
              Upload an Audio file
            </span>
          </button>
        </div>

        {creating && (
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default UploadScript;
