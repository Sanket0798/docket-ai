import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { LuSend } from 'react-icons/lu';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const Preview = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'my_workspace';

  const [project, setProject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, qRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/questions`),
        ]);
        setProject(projRes.data);
        setQuestions(qRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.put(`/projects/${projectId}/status`, { status: 'completed' });
      navigate(`/workspace/${workspaceId}/project/${projectId}/success`,
        { state: { workspaceName } });
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
      setShowConfirm(false);
    }
  };

  const labelMap = {
    golden_hour: 'Golden Hour', studio_soft: 'Studio Soft', dramatic: 'Dramatic',
    natural: 'Natural Light', neon: 'Neon / Night', cinematic: 'Cinematic',
    overcast: 'Overcast', backlit: 'Backlit', energetic: 'Energetic',
    calm: 'Calm & Peaceful', inspirational: 'Inspirational', serious: 'Serious',
    playful: 'Playful', mysterious: 'Mysterious', romantic: 'Romantic',
    nostalgic: 'Nostalgic', fast_cuts: 'Fast Cuts', slow_motion: 'Slow Motion',
    steady: 'Steady Flow', dynamic: 'Dynamic Mix', documentary: 'Documentary',
    cinematic_slow: 'Cinematic Slow', music_sync: 'Music Synced', timelapse: 'Time-lapse',
    warm_tones: 'Warm Tones', cool_tones: 'Cool Tones', vibrant: 'Vibrant',
    desaturated: 'Desaturated', vintage: 'Vintage Film', teal_orange: 'Teal & Orange',
    black_white: 'Black & White', pastel: 'Pastel Soft',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-8">
        {/* Breadcrumb + back */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate(`/workspace/${workspaceId}/project/${projectId}/questions`,
                { state: { workspaceName } })}
              className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
            >
              ← Back
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">{workspaceName}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-semibold">Preview</span>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 h-[38px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            <LuSend size={15} />
            Save & Export
          </button>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-gray-900">Preview</h1>
          <p className="text-sm text-gray-500 mt-1">All selected answers in one place</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Left — Script */}
            <div className="w-[40%]">
              <div className="border border-gray-200 rounded-xl p-5 h-full">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                  Script
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {project?.script_text || (
                    <span className="text-gray-400 italic">No script text added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Q&A answers */}
            <div className="w-[60%] space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Your Selections
              </h2>

              {questions.length === 0 ? (
                <div className="border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                  No questions answered yet
                </div>
              ) : (
                questions.map((q, i) => (
                  <div key={q.id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                          Question {i + 1}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mb-2">{q.question}</p>
                        <div className="flex items-center gap-2">
                          <MdCheckCircle size={16} className="text-green-500 shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">
                            {labelMap[q.answer] || q.answer}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full shrink-0">
                        Selected
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Export Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[500px] p-8 shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <LuSend size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to save and export? No changes can be done once the file is exported.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-[38px] px-6 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="h-[38px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
              >
                {exporting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Yes, Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
