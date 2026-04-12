import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMovieCreation, MdCampaign, MdSchool, MdBusinessCenter } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { BsMusicNoteBeamed } from 'react-icons/bs';

const projectTypes = [
  { id: 'short_film', label: 'Short Film', icon: <MdMovieCreation size={32} />, desc: 'Narrative storytelling' },
  { id: 'advertisement', label: 'Advertisement', icon: <MdCampaign size={32} />, desc: 'Brand & product promos' },
  { id: 'educational', label: 'Educational', icon: <MdSchool size={32} />, desc: 'Tutorials & explainers' },
  { id: 'corporate', label: 'Corporate', icon: <MdBusinessCenter size={32} />, desc: 'Business presentations' },
  { id: 'music_video', label: 'Music Video', icon: <BsMusicNoteBeamed size={32} />, desc: 'Visual music content' },
  { id: 'ai_creative', label: 'AI Creative', icon: <HiSparkles size={32} />, desc: 'AI-generated scenes' },
];

const Step1 = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(
    () => sessionStorage.getItem('ob_project_type') || ''
  );

  const handleNext = () => {
    if (!selected) return;
    sessionStorage.setItem('ob_project_type', selected);
    navigate('/onboarding/step2');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-[700px] flex mb-12">
        <div className="h-2 flex-1 bg-[#1958FF]" />
        <div className="h-2 flex-1 bg-[#D9D9D9]" />
        <div className="h-2 flex-1 bg-[#D9D9D9]" />
      </div>

      {/* Heading */}
      <div className="w-full max-w-[700px] mb-10">
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
          What kind of project are you planning to create right now?
          <span className="text-indigo-500 ml-2">✦</span>
        </h1>
        <p className="text-[15px] text-gray-500">
          Tell us about your current project so we can guide you better
        </p>
      </div>

      {/* Cards grid */}
      <div className="w-full max-w-[700px] grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {projectTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelected(type.id)}
            className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all text-center
              ${selected === type.id
                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
          >
            {/* Tick badge */}
            {selected === type.id && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <span className={selected === type.id ? 'text-indigo-600' : 'text-gray-500'}>
              {type.icon}
            </span>
            <div>
              <p className={`font-semibold text-sm ${selected === type.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                {type.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-[700px] flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selected}
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

export default Step1;
