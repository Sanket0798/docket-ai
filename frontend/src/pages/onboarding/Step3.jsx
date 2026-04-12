import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { MdAutoAwesome, MdRecordVoiceOver, MdColorLens, MdTimeline, MdOutlineSubtitles, MdOutlineMusicNote } from 'react-icons/md';

const aiOptions = [
  { id: 'script_writing', label: 'Script Writing', icon: <MdAutoAwesome size={30} />, desc: 'AI helps craft your script' },
  { id: 'voiceover', label: 'Voiceover', icon: <MdRecordVoiceOver size={30} />, desc: 'AI-generated narration' },
  { id: 'visual_style', label: 'Visual Style', icon: <MdColorLens size={30} />, desc: 'Scene aesthetics & mood' },
  { id: 'storyboarding', label: 'Storyboarding', icon: <MdTimeline size={30} />, desc: 'Scene-by-scene planning' },
  { id: 'subtitles', label: 'Subtitles & Captions', icon: <MdOutlineSubtitles size={30} />, desc: 'Auto-generated text' },
  { id: 'music', label: 'Background Music', icon: <MdOutlineMusicNote size={30} />, desc: 'AI music suggestions' },
];

const Step3 = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [selected, setSelected] = useState(
    () => sessionStorage.getItem('ob_ai_assistance') || ''
  );
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.post('/onboarding', {
        project_type: sessionStorage.getItem('ob_project_type'),
        scenes_elements: sessionStorage.getItem('ob_scenes'),
        ai_assistance: selected,
        completed: true,
      });
      // Clear session storage
      sessionStorage.removeItem('ob_project_type');
      sessionStorage.removeItem('ob_scenes');
      sessionStorage.removeItem('ob_ai_assistance');
      completeOnboarding();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/onboarding/step2');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-[700px] flex mb-12">
        <div className="h-2 flex-1 bg-[#1958FF]" />
        <div className="h-2 flex-1 bg-[#1958FF]" />
        <div className="h-2 flex-1 bg-[#1958FF]" />
      </div>

      {/* Heading */}
      <div className="w-full max-w-[700px] mb-10">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
          What would you like AI to help you with the most?
        </h1>
        <p className="text-[15px] text-gray-500">
          Choose where you want the most assistance in your workflow
        </p>
      </div>

      {/* Cards grid */}
      <div className="w-full max-w-[700px] grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {aiOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all text-center
              ${selected === opt.id
                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
          >
            {selected === opt.id && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <span className={selected === opt.id ? 'text-indigo-600' : 'text-gray-500'}>
              {opt.icon}
            </span>
            <div>
              <p className={`font-semibold text-sm ${selected === opt.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-[700px] flex items-center justify-between">
        <button
          onClick={handleBack}
          className="px-6 h-[38px] border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous question
        </button>
        <button
          onClick={handleFinish}
          disabled={!selected || loading}
          className="px-8 h-[38px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3;
