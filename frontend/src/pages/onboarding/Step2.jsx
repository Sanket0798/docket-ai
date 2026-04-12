import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Step2 = () => {
  const navigate = useNavigate();
  const [text, setText] = useState(
    () => sessionStorage.getItem('ob_scenes') || ''
  );

  const handleNext = () => {
    if (!text.trim()) return;
    sessionStorage.setItem('ob_scenes', text);
    navigate('/onboarding/step3');
  };

  const handleBack = () => navigate('/onboarding/step1');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-[700px] flex mb-12">
        <div className="h-2 flex-1 bg-[#1958FF]" />
        <div className="h-2 flex-1 bg-[#1958FF]" />
        <div className="h-2 flex-1 bg-[#D9D9D9]" />
      </div>

      {/* Heading */}
      <div className="w-full max-w-[700px] mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
          What kind of scenes or elements do you want to include?
        </h1>
        <p className="text-[15px] text-gray-500">
          Mention any specific ideas, moods, or elements you'd like to see in your videos
        </p>
      </div>

      {/* Text area */}
      <div className="w-full max-w-[700px] mb-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your scenes
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Cinematic outdoor shots at golden hour, close-up product reveals, upbeat background music, text overlays with key stats..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1.5 text-right">{text.length} characters</p>
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
          onClick={handleNext}
          disabled={!text.trim()}
          className="px-8 h-[38px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
        >
          Save & next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step2;
