import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, Trash2, Edit3, X, Check, Tag, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLORS = [
  { name: 'indigo', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', dot: 'bg-indigo-500', text: 'text-indigo-400' },
  { name: 'violet', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-500', text: 'text-violet-400' },
  { name: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  { name: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', text: 'text-amber-400' },
  { name: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500', text: 'text-rose-400' },
  { name: 'sky', bg: 'bg-sky-500/10', border: 'border-sky-500/30', dot: 'bg-sky-500', text: 'text-sky-400' },
];

const getColor = (name) => COLORS.find(c => c.name === name) || COLORS[0];

function NoteModal({ note, onClose, onSave }) {
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    color: note?.color || 'indigo',
    tags: note?.tags?.join(', ') || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{note ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Note title..." autoFocus />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea className="input min-h-[140px] resize-none" value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write anything... supports plain text" />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="work, ideas, personal" />
          </div>
          <div>
            <label className="label mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c.name} type="button" onClick={() => setForm({ ...form, color: c.name })}
                  className={`w-7 h-7 rounded-full ${c.dot} transition-all ${form.color === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary py-2.5 text-sm">
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | noteObj
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async (form) => {
    try {
      if (modal === 'create') {
        const { data } = await api.post('/notes', form);
        setNotes(prev => [data, ...prev]);
        toast.success('Note created');
      } else {
        const { data } = await api.put(`/notes/${modal._id}`, form);
        setNotes(prev => prev.map(n => n._id === data._id ? data : n));
        toast.success('Note updated');
      }
      setModal(null);
    } catch { toast.error('Failed to save note'); }
  };

  const handlePin = async (note) => {
    try {
      const { data } = await api.put(`/notes/${note._id}`, { pinned: !note.pinned });
      setNotes(prev => prev.map(n => n._id === data._id ? data : n).sort((a, b) => b.pinned - a.pinned));
    } catch { toast.error('Failed to update note'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setModal('create')}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New Note
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input pl-10 w-full max-w-sm" placeholder="Search notes..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-800/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-400 font-medium">{search ? 'No notes match your search' : 'No notes yet'}</p>
          {!search && <p className="text-gray-600 text-sm mt-1">Click "New Note" to create your first one</p>}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(note => {
              const c = getColor(note.color);
              return (
                <motion.div key={note._id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative rounded-2xl border p-4 flex flex-col gap-3 group ${c.bg} ${c.border}`}>
                  {note.pinned && (
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${c.dot}`} />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">{note.title}</h3>
                  </div>
                  {note.content && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-4 flex-1">{note.content}</p>
                  )}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map(tag => (
                        <span key={tag} className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-800/60 ${c.text}`}>
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-700/40">
                    <span className="text-[10px] text-gray-600">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePin(note)}
                        className={`p-1.5 rounded-lg transition-colors ${note.pinned ? `${c.text} bg-gray-800/60` : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800/60'}`}
                        title={note.pinned ? 'Unpin' : 'Pin'}>
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setModal(note)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-gray-800/60 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(note._id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800/60 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {modal && <NoteModal note={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}
