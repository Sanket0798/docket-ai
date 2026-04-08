import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

// Static question set (AI will generate these dynamically in future)
const QUESTIONS = [
  {
    id: 'lighting',
    question: 'What lighting tone fits this scene?',
    subtitle: 'Lighting influences the visual mood and depth of your scene',
    options: [
      { id: 'golden_hour', label: 'Golden Hour', color: '#F59E0B', emoji: '🌅' },
      { id: 'studio_soft', label: 'Studio Soft', color: '#6366F1', emoji: '💡' },
      { id: 'dramatic', label: 'Dramatic', color: '#1F2937', emoji: '🎭' },
      { id: 'natural', label: 'Natural Light', color: '#10B981', emoji: '☀️' },
      { id: 'neon', label: 'Neon / Night', color: '#8B5CF6', emoji: '🌃' },
      { id: 'cinematic', label: 'Cinematic', color: '#EF4444', emoji: '🎬' },
      { id: 'overcast', label: 'Overcast', color: '#9CA3AF', emoji: '☁️' },
      { id: 'backlit', label: 'Backlit', color: '#F97316', emoji: '🔆' },
    ],
  },
  {
    id: 'mood',
    question: 'What mood should the video convey?',
    subtitle: 'The emotional tone shapes how your audience connects with the content',
    options: [
      { id: 'energetic', label: 'Energetic', color: '#F59E0B', emoji: '⚡' },
      { id: 'calm', label: 'Calm & Peaceful', color: '#10B981', emoji: '🌿' },
      { id: 'inspirational', label: 'Inspirational', color: '#6366F1', emoji: '🚀' },
      { id: 'serious', label: 'Serious', color: '#1F2937', emoji: '💼' },
      { id: 'playful', label: 'Playful', color: '#EC4899', emoji: '🎉' },
      { id: 'mysterious', label: 'Mysterious', color: '#7C3AED', emoji: '🌙' },
      { id: 'romantic', label: 'Romantic', color: '#F43F5E', emoji: '❤️' },
      { id: 'nostalgic', label: 'Nostalgic', color: '#D97706', emoji: '📷' },
    ],
  },
  {
    id: 'pace',
    question: 'What should the video pacing feel like?',
    subtitle: 'Pacing controls the rhythm and energy of your final video',
    options: [
      { id: 'fast_cuts', label: 'Fast Cuts', color: '#EF4444', emoji: '⚡' },
      { id: 'slow_motion', label: 'Slow Motion', color: '#6366F1', emoji: '🐢' },
      { id: 'steady', label: 'Steady Flow', color: '#10B981', emoji: '🌊' },
      { id: 'dynamic', label: 'Dynamic Mix', color: '#F59E0B', emoji: '🎯' },
      { id: 'documentary', label: 'Documentary', color: '#1F2937', emoji: '🎥' },
      { id: 'cinematic_slow', label: 'Cinematic Slow', color: '#8B5CF6', emoji: '🎞️' },
      { id: 'music_sync', label: 'Music Synced', color: '#EC4899', emoji: '🎵' },
      { id: 'timelapse', label: 'Time-lapse', color: '#D97706', emoji: '⏩' },
    ],
  },
  {
    id: 'color_grade',
    question: 'What color grading style do you prefer?',
    subtitle: 'Color grading sets the overall visual aesthetic of your video',
    options: [
      { id: 'warm_tones', label: 'Warm Tones', color: '#F59E0B', emoji: '🍂' },
      { id: 'cool_tones', label: 'Cool Tones', color: '#3B82F6', emoji: '❄️' },
      { id: 'vibrant', label: 'Vibrant', color: '#EC4899', emoji: '🌈' },
      { id: 'desaturated', label: 'Desaturated', color: '#6B7280', emoji: '🖤' },
      { id: 'vintage', label: 'Vintage Film', color: '#D97706', emoji: '📽️' },
      { id: 'teal_orange', label: 'Teal & Orange', color: '#0D9488', emoji: '🎨' },
      { id: 'black_white', label: 'Black & White', color: '#1F2937', emoji: '⬛' },
      { id: 'pastel', label: 'Pastel Soft', color: '#A78BFA', emoji: '🌸' },
    ],
  },
];

const AIQuestions = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'my_workspace';

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const question = QUESTIONS[currentStep];
  const totalSteps = QUESTIONS.length;
  const selectedAnswer = answers[question.id];

  const handleSelect = (optionId) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = async () => {
    if (!selectedAnswer) return;

    // Save answer to DB
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/questions`, {
        question: question.question,
        answer: selectedAnswer,
        question_order: currentStep,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }

    if (currentStep < totalSteps - 1) {
      // Show brief loading between questions
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
      }, 600);
    } else {
      // All done — go to preview
      navigate(`/workspace/${workspaceId}/project/${projectId}/preview`,
        { state: { workspaceName, answers } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/upload`, { state: { workspaceName } })}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ← Back
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{workspaceName}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">AI Questions</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-10">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step counter */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Question {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {/* Loading state between questions */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading next question...</p>
          </div>
        ) : (
          <>
            {/* Question heading */}
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-2">
                {question.question}
              </h1>
              <p className="text-[15px] text-gray-500">{question.subtitle}</p>
            </div>

            {/* Options grid — 4 per row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {question.options.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 transition-all
                      h-[140px] sm:h-[160px]
                      ${isSelected
                        ? 'border-indigo-600 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${opt.color}18, ${opt.color}30)`
                        : 'white',
                    }}
                  >
                    {/* Tick badge */}
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}

                    {/* Color swatch */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: `${opt.color}25`, border: `2px solid ${opt.color}40` }}
                    >
                      {opt.emoji}
                    </div>

                    <span className={`text-sm font-semibold text-center px-2 leading-tight
                      ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 h-[38px] px-5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous question
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedAnswer || saving}
                className="flex items-center gap-2 h-[38px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {currentStep === totalSteps - 1 ? 'Go to Preview' : 'Save & next'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 py-4 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default AIQuestions;
