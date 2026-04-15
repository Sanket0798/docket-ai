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
    try {
      await api.post('/workspaces', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
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

      <main className="flex-1 px-[60px] py-8">
        {/* Header row */}
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

        {/* Workspace grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
            <img src="/assets/icons/Empty-cuate.svg" alt="No workspaces" className="mb-6" />
            <p className="text-gray-800 text-lg font-medium">No Workspace Yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Create your videos in new workspace</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 h-[38px] px-5 bg-button-color text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
            >
              Create workspace +
            </button>
          </div>
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Docket Factory. All Rights Reserved
      </footer>

      {/* Create Workspace Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[540px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Create Workspace</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. My Brand Videos"
                  required
                  className="w-full h-[42px] px-4 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this workspace for?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-[38px] px-5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-[38px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
                >
                  {creating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Create'}
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
    </div>
  );
};

export default Dashboard;
