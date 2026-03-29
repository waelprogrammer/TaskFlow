import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({ projects: [], tasks: [] });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults({ projects: [], tasks: [] }); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, taskStatsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks/stats'),
        ]);
        const q = query.toLowerCase();
        const projects = projRes.data.filter(p =>
          p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        ).slice(0, 4);
        const tasks = (taskStatsRes.data.recentTasks || []).filter(t =>
          t.title.toLowerCase().includes(q)
        ).slice(0, 5);
        setResults({ projects, tasks });
      } catch {} finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (type, item) => {
    if (type === 'project') navigate(`/projects/${item._id}`);
    else navigate(`/projects/${item.project?._id || item.project}`);
    onClose();
  };

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl overflow-hidden border border-gray-700/60"
            style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800/60">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && onClose()}
                placeholder="Search projects and tasks..."
                className="flex-1 bg-transparent text-gray-100 text-sm placeholder-gray-600 outline-none"
              />
              <div className="flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                <kbd className="text-xs text-gray-600 bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded">ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {!query && (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Search for projects and tasks</p>
                </div>
              )}

              {query && !hasResults && !loading && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-600">No results for "<span className="text-gray-400">{query}</span>"</p>
                </div>
              )}

              {results.projects.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 py-1.5">Projects</p>
                  {results.projects.map(p => (
                    <button key={p._id} onClick={() => handleSelect('project', p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-colors text-left group">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: p.color }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 font-medium truncate">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-500 truncate">{p.description}</p>}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div className="p-2 border-t border-gray-800/40">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-3 py-1.5">Tasks</p>
                  {results.tasks.map(t => (
                    <button key={t._id} onClick={() => handleSelect('task', t)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-colors text-left group">
                      <CheckSquare className="w-4 h-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{t.title}</p>
                        <p className="text-xs text-gray-600">{t.project?.name}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                        t.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>{t.priority}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-800/60 flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><kbd className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-xs">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-xs">ESC</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
