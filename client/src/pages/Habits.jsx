import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Flame, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLORS = [
  { name: 'indigo', ring: 'ring-indigo-500', bg: 'bg-indigo-500', light: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/40' },
  { name: 'violet', ring: 'ring-violet-500', bg: 'bg-violet-500', light: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/40' },
  { name: 'emerald', ring: 'ring-emerald-500', bg: 'bg-emerald-500', light: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  { name: 'amber', ring: 'ring-amber-500', bg: 'bg-amber-500', light: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' },
  { name: 'rose', ring: 'ring-rose-500', bg: 'bg-rose-500', light: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40' },
  { name: 'sky', ring: 'ring-sky-500', bg: 'bg-sky-500', light: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/40' },
];
const getColor = (name) => COLORS.find(c => c.name === name) || COLORS[0];

const EMOJIS = ['⭐', '💪', '📚', '🏃', '💧', '🧘', '🎯', '✍️', '🛏️', '🥗', '☕', '🎵', '🌿', '🔥', '💡', '🏋️'];

const getToday = () => new Date().toISOString().split('T')[0];

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const getStreak = (completedDates) => {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const today = getToday();
  let current = today;
  for (const date of sorted) {
    if (date === current) {
      streak++;
      const d = new Date(current);
      d.setDate(d.getDate() - 1);
      current = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  return streak;
};

function AddHabitModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', emoji: '⭐', color: 'indigo' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-gray-900 border border-gray-700/60 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">New Habit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Habit Name</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Read 30 minutes" autoFocus />
          </div>
          <div>
            <label className="label mb-2 block">Pick an Emoji</label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setForm({ ...form, emoji: em })}
                  className={`text-xl p-1.5 rounded-xl transition-all ${form.emoji === em ? 'bg-indigo-600/30 ring-2 ring-indigo-500 scale-110' : 'hover:bg-gray-800'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c.name} type="button" onClick={() => setForm({ ...form, color: c.name })}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all ${form.color === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 transition-all text-sm">Cancel</button>
            <button type="submit" className="flex-1 btn-primary py-2.5 text-sm">Create Habit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const today = getToday();
  const last7 = getLast7Days();

  useEffect(() => {
    api.get('/habits').then(({ data }) => setHabits(data)).catch(() => toast.error('Failed to load habits')).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (form) => {
    try {
      const { data } = await api.post('/habits', form);
      setHabits(prev => [...prev, data]);
      setShowModal(false);
      toast.success('Habit created!');
    } catch { toast.error('Failed to create habit'); }
  };

  const handleToggle = async (habit) => {
    try {
      const { data } = await api.put(`/habits/${habit._id}/toggle`);
      setHabits(prev => prev.map(h => h._id === data._id ? data : h));
    } catch { toast.error('Failed to update habit'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete habit'); }
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Habits</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daily habit tracker</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New Habit
        </motion.button>
      </div>

      {/* Today's progress bar */}
      {totalHabits > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Today's Progress</span>
            <span className="text-sm font-bold text-white">{completedToday}/{totalHabits}</span>
          </div>
          <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalHabits ? (completedToday / totalHabits) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
          {completedToday === totalHabits && totalHabits > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 mt-2 font-medium">
              🎉 All habits done for today!
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Habits list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-800/40 animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔥</div>
          <p className="text-gray-400 font-medium">No habits yet</p>
          <p className="text-gray-600 text-sm mt-1">Build your daily routine by adding habits</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((habit, i) => {
              const c = getColor(habit.color);
              const doneToday = habit.completedDates.includes(today);
              const streak = getStreak(habit.completedDates);

              return (
                <motion.div key={habit._id} layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${doneToday ? `${c.light} ${c.border}` : 'bg-gray-800/30 border-gray-700/40'}`}>
                  <div className="flex items-center gap-4">
                    {/* Check button */}
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleToggle(habit)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
                        doneToday ? `${c.bg} shadow-lg` : 'bg-gray-700/60 hover:bg-gray-700'
                      }`}>
                      {doneToday ? <Check className="w-5 h-5 text-white" /> : habit.emoji}
                    </motion.button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${doneToday ? 'text-white' : 'text-gray-300'}`}>{habit.title}</p>
                        {streak > 0 && (
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.light} ${c.text}`}>
                            <Flame className="w-3 h-3" />{streak}
                          </span>
                        )}
                      </div>
                      {/* Last 7 days dots */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {last7.map(day => (
                          <div key={day} title={day}
                            className={`w-4 h-4 rounded-full transition-all ${
                              habit.completedDates.includes(day)
                                ? `${c.bg} ${day === today ? 'ring-2 ring-white/30' : ''}`
                                : 'bg-gray-700/60'
                            }`} />
                        ))}
                        <span className="text-[10px] text-gray-600 ml-1">7 days</span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => handleDelete(habit._id)}
                      className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddHabitModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      </AnimatePresence>
    </div>
  );
}
