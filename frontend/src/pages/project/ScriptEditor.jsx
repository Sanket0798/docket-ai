import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MdAdd, MdDelete, MdPlayArrow, MdPause, MdStop, MdSave } from 'react-icons/md';
import { BsFilePdf, BsMicFill, BsUpload } from 'react-icons/bs';
import { LuSend } from 'react-icons/lu';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ScriptEditor = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const location = useLocation();
  const workspaceName = location.state?.workspaceName || 'my_workspace';
  const uploadType = location.state?.uploadType || 'pdf';
  const { toast } = useToast();

  // Script text state
  const [scriptText, setScriptText] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // PDF state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const pdfInputRef = useRef();

  // Audio state
  const [audioFiles, setAudioFiles] = useState([]);
  const [audioUploading, setAudioUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const audioInputRef = useRef();
  const timerRef = useRef();
  const audioRefs = useRef([]);

  // Load existing project data
  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(res => {
        if (res.data.script_text) setScriptText(res.data.script_text);
        if (res.data.script_pdf_url) setPdfUrl(res.data.script_pdf_url);
      })
      .catch(console.error);
  }, [projectId]);

  // ── PDF handlers ──────────────────────────────────────────
  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    handlePdfUpload(file);
  };

  const handlePdfUpload = async (file) => {
    setPdfUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/projects/${projectId}/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPdfUrl(res.data.url);
    } catch (err) {
      console.error('PDF upload failed:', err);
      toast('PDF upload failed. Check Cloudinary credentials in .env', 'error');
    } finally {
      setPdfUploading(false);
    }
  };

  // ── Audio handlers ─────────────────────────────────────────
  const handleAudioSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/projects/${projectId}/upload-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAudioFiles(prev => [...prev, { name: file.name, url: res.data.url, type: 'uploaded' }]);
    } catch (err) {
      console.error('Audio upload failed:', err);
      // For dev without Cloudinary — store locally
      const localUrl = URL.createObjectURL(file);
      setAudioFiles(prev => [...prev, { name: file.name, url: localUrl, type: 'local' }]);
      toast('Audio stored locally (Cloudinary not configured)', 'warning');
    } finally {
      setAudioUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const name = `Recording ${audioFiles.length + 1}`;
        setAudioFiles(prev => [...prev, { name, url, type: 'recorded', blob }]);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      toast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const deleteAudio = (index) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const togglePlay = (index) => {
    const audio = audioRefs.current[index];
    if (!audio) return;
    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      audioRefs.current.forEach((a, i) => { if (i !== index && a) a.pause(); });
      audio.play();
      setPlayingIndex(index);
      audio.onended = () => setPlayingIndex(null);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Save & Submit ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/projects/${projectId}/script`, { script_text: scriptText });
      setSavedMsg('Saved!');
      toast('Draft saved successfully', 'success');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (err) {
      console.error(err);
      toast('Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!scriptText.trim()) {
      toast('Please add some script text before submitting', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/projects/${projectId}/script`, { script_text: scriptText });
      await api.put(`/projects/${projectId}/status`, { status: 'processing' });
      navigate(`/workspace/${workspaceId}/project/${projectId}/submitted`,
        { state: { workspaceName } });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-[60px] py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/upload`, { state: { workspaceName } })}
            className="text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
          >
            ← Back
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{workspaceName}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold">
            {uploadType === 'pdf' ? 'Upload Script (PDF)' : 'Upload Script (Audio)'}
          </span>
        </div>

        {/* Split panel */}
        <div className="flex gap-6 h-[calc(100vh-240px)]">

          {/* ── LEFT PANEL ── */}
          <div className="w-[50%] flex flex-col gap-4">

            {uploadType === 'pdf' ? (
              /* PDF Upload */
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-800">Upload your script here *</p>
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl h-[165px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                >
                  {pdfUploading ? (
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : pdfFile ? (
                    <>
                      <BsFilePdf size={36} className="text-red-400" />
                      <p className="text-sm text-gray-600 font-medium">{pdfFile.name}</p>
                      {pdfUrl && <p className="text-xs text-green-600">✓ Uploaded</p>}
                    </>
                  ) : (
                    <>
                      <BsUpload size={32} className="text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload PDF</p>
                      <p className="text-xs text-gray-400">PDF files only</p>
                    </>
                  )}
                </div>
                <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfSelect} />
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="self-start flex items-center gap-2 h-[38px] px-4 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  <MdAdd size={16} /> Add PDF
                </button>
              </div>
            ) : (
              /* Audio Upload + Record */
              <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Upload audio file */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Upload your audio file here</p>
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl h-[120px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                  >
                    {audioUploading ? (
                      <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <BsMicFill size={28} className="text-indigo-400" />
                        <p className="text-sm text-gray-500">Click to upload audio</p>
                        <p className="text-xs text-gray-400">MP3, WAV, OGG, M4A</p>
                      </>
                    )}
                  </div>
                  <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                </div>

                {/* Record audio */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Record your audio here</p>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-mono text-gray-600">{formatTime(recordingTime)}</span>
                      <div className="flex items-center gap-2">
                        {!recording ? (
                          <button
                            onClick={startRecording}
                            className="flex items-center gap-1.5 h-[34px] px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
                          >
                            <BsMicFill size={12} /> Record
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={stopRecording}
                              className="flex items-center gap-1.5 h-[34px] px-4 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <MdStop size={14} /> Stop
                            </button>
                            <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              Recording...
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Audio list */}
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {audioFiles.map((audio, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                          <button
                            onClick={() => togglePlay(i)}
                            className="w-7 h-7 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 transition flex-shrink-0"
                          >
                            {playingIndex === i ? <MdPause size={14} /> : <MdPlayArrow size={14} />}
                          </button>
                          <audio ref={el => audioRefs.current[i] = el} src={audio.url} className="hidden" />
                          <span className="text-xs text-gray-700 flex-1 truncate">{audio.name}</span>
                          <button
                            onClick={() => deleteAudio(i)}
                            className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                          >
                            <MdDelete size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="mt-2 flex items-center gap-2 h-[34px] px-4 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    <MdAdd size={14} /> Add more audio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL — Script Text Editor ── */}
          <div className="w-[50%] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">
                {uploadType === 'pdf' ? 'Preview / Edit Script' : 'Transcribed Script'}
              </p>
              {savedMsg && (
                <span className="text-xs text-green-600 font-medium">{savedMsg}</span>
              )}
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Your script text will appear here. You can also type or paste directly..."
              className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-[38px] px-5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <MdSave size={16} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || !scriptText.trim()}
            className="flex items-center gap-2 h-[38px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
          >
            <LuSend size={15} />
            {submitting ? 'Submitting...' : 'Submit Script'}
          </button>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-4 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>
    </div>
  );
};

export default ScriptEditor;
