import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, X, FolderOpen } from 'lucide-react';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#06b6d4',
  '#f97316', '#84cc16',
];

const defaultForm = { name: '', description: '', color: '#6366f1' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, color: p.color });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/projects/${editing._id}`, form);
        setProjects((prev) => prev.map((p) => (p._id === editing._id ? { ...p, ...data } : p)));
        toast.success('Project updated');
      } else {
        const { data } = await api.post('/projects', form);
        setProjects((prev) => [data, ...prev]);
        toast.success('Project created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Project
        </motion.button>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-5 border border-indigo-500/20">
            <FolderOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-gray-300 text-lg mb-1">No projects yet</h3>
          <p className="text-gray-600 text-sm mb-6">Create your first project to start organizing tasks</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Project
          </motion.button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md card-glass overflow-hidden"
            >
              {/* Colored top bar */}
              <div
                className="h-1 w-full rounded-t-2xl mb-5"
                style={{ background: `linear-gradient(90deg, ${form.color}, ${form.color}50)` }}
              />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">
                  {editing ? 'Edit Project' : 'New Project'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Project Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="My awesome project"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">
                    Description <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input resize-none"
                    rows={3}
                    placeholder="What is this project about?"
                  />
                </div>
                <div>
                  <label className="label">Color Tag</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((c) => (
                      <motion.button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 rounded-xl transition-all duration-200 ${
                          form.color === c
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                            : ''
                        }`}
                        style={{
                          backgroundColor: c,
                          boxShadow: form.color === c ? `0 0 14px ${c}90` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" />
                    ) : editing ? (
                      'Save Changes'
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
