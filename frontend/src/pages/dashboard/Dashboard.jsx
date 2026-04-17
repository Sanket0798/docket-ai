import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdMoreVert, MdDelete } from 'react-icons/md';
import { HiOutlineUpload } from 'react-icons/hi';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setShowModal(false);
    setShowProcessing(true);
    try {
      await api.post('/workspaces', form);
      // await Promise.all([
      //   api.post('/workspaces', form),
      //   new Promise(r => setTimeout(r, 2000)), // min 2s so user sees the popup
      // ]);
      setForm({ name: '', description: '' });
      // Show success popup
      setShowProcessing(false);
      setShowSuccess(true);
      // Auto-close success after 2s and refresh
      setTimeout(() => {
        setShowSuccess(false);
        fetchWorkspaces();
      }, 2000);
    } catch (err) {
      console.error(err);
      setShowProcessing(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workspace?')) return;
    try {
      await api.delete(`/workspaces/${id}`);
      setWorkspaces(workspaces.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
    setMenuOpen(null);
  };

  const handleOpen = (ws) => {
    navigate(`/workspace/${ws.id}`, { state: { workspaceName: ws.name } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Workspace grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center my-[147px]">
            <img src="/assets/icons/Empty-cuate.svg" alt="No workspaces" className="mb-6" />
            <p className="font-regular text-3xl text-[#1B1B1D] mb-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>No Workspace Yet</p>
            <p className="font-normal text-[19px] text-[#787889] mb-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>Create your videos in new workspace</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 h-[38px] px-5 bg-brand-color text-white text-[15px] leading-[18px] font-medium rounded-[6px] hover:opacity-90 transition cursor-pointer"
            >
              Create workspace
              <img src="assets/icons/plus.svg" alt="" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-[28px] font-bold text-gray-900">My Workspaces</h1>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 h-[38px] px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <MdAdd size={18} />
                Create Workspace
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="relative border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition group"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <HiOutlineUpload size={20} className="text-indigo-600" />
                    </div>
                    {/* 3-dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === ws.id ? null : ws.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <MdMoreVert size={18} />
                      </button>
                      {menuOpen === ws.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[130px]">
                          <button
                            onClick={() => handleDelete(ws.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <MdDelete size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & meta */}
                  <p className="font-semibold text-gray-900 text-sm truncate mb-1">{ws.name}</p>
                  {ws.description && (
                    <p className="text-xs text-gray-400 truncate mb-3">{ws.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-4">
                    {ws.project_count || 0} project{ws.project_count !== 1 ? 's' : ''}
                  </p>

                  {/* Open button */}
                  <button
                    onClick={() => handleOpen(ws)}
                    className="w-full h-[30px] border border-indigo-200 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50 transition"
                  >
                    Open
                  </button>
                </div>
              ))}

              {/* Add new card */}
              <button
                onClick={() => setShowModal(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition min-h-[140px]"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MdAdd size={22} className="text-gray-400" />
                </div>
                <span className="text-sm text-gray-400 font-medium">New Workspace</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#F8F8F8] py-10 text-center font-normal text-base text-[#1E1F1E]">
        © 2026 Docket Factory. All Rights Reserved
      </footer>

      {/* Create Workspace Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-[6px] w-full max-w-[594px] h-[414px] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-[#333333]/20 border-b">
              <h2 className="font-medium text-[22px] leading-[24px] text-[#333333]" style={{ fontFamily: 'Geist, sans-serif' }}>Create Workspace</h2>
              <button
                onClick={() => setShowModal(false)}
              // className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-xl"
              >
                <img src="assets/icons/cancel-outline.svg" alt="" className='cursor-pointer' />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 space-y-4">
              <div>
                <label className="block font-normal text-xs text-[#333333] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                  Workspace Name <span className="text-[#FF2B2F]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. My Brand Videos"
                  required
                  style={{ fontFamily: 'Geist, sans-serif' }}
                  className="w-full h-[40px] px-4 border border-[#EFEFEF]/80 rounded-[6px] font-normal text-[15px] leading-6 placeholder-[#333333]/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block font-normal text-xs text-[#333333] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this workspace for?"
                  rows={3}
                  style={{ fontFamily: 'Geist, sans-serif' }}
                  className="w-full px-4 py-3 h-[125px] border border-[#EFEFEF]/80 rounded-[6px] font-normal text-[15px] leading-6 placeholder-[#333333]/40 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer"
                >
                  <img src="assets/icons/delete-workspace.svg" alt="" />
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-[38px] w-[121px] justify-center bg-brand-color disabled:opacity-60 text-white font-medium text-[15px] leading-[18px] rounded-[6px] transition flex items-center gap-2 cursor-pointer"
                >
                  {creating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create
                      <img src="assets/icons/arrow-right.svg" alt="" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}

      {/* Processing popup */}
      {showProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[6px] shadow-xl px-10 py-6 flex flex-col items-center gap-4 min-w-[594px]">
            <img
              src="/assets/icons/ultimate_loading.svg"
              alt="Loading"
              className="animate-spin"
            />
            <hr className="w-full border-t border-[#EFEFEF]/60 mb-2" />
            <p className="font-light text-[32px] text-[#484848]">Please wait while we process</p>
            <p className="text-lg font-light text-[#484848]">Do not refresh the page.....</p>
          </div>
        </div>
      )}

      {/* Success popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[18px] h-[340px] shadow-xl px-10 py-8 flex flex-col items-center justify-center gap-6 min-w-[1128px]">
            <div className='rounded-full w-[75px] h-[75px]'>
              <img
                src="/assets/icons/check_circle.svg"
                alt="Success"
              />
            </div>
            <div className="text-center space-y-4">
              <p className="font-medium text-[32px] leading-[24px] text-[#333333]">Workspace created successfully</p>
              <p className="font-light text-lg leading-[24px] px-10 text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod <br /> tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
