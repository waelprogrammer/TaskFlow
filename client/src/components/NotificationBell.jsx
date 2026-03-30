import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const bellRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/tasks/stats');
        const now = new Date();
        const notifs = [];

        // Overdue tasks
        (data.recentTasks || []).forEach(task => {
          if (task.dueDate && task.status !== 'done' && new Date(task.dueDate) < now) {
            notifs.push({
              id: task._id,
              type: 'overdue',
              title: 'Task Overdue',
              message: task.title,
              projectId: task.project?._id,
              time: 'Overdue',
            });
          }
        });

        // Motivational if all done
        if (data.total > 0 && data.completed === data.total) {
          notifs.push({ id: 'all-done', type: 'success', title: 'Amazing work!', message: 'You completed all your tasks!', time: 'Now' });
        }

        setNotifications(notifs);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.length;

  const handleToggle = () => {
    if (!open && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const panelWidth = 320;
      const left = Math.min(rect.left, window.innerWidth - panelWidth - 8);
      setPanelPos({ top: rect.bottom + 8, left: Math.max(8, left) });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button ref={bellRef} onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-gray-200 hover:bg-gray-800/60 rounded-xl transition-all">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className="fixed z-[9999] w-80 rounded-2xl border border-gray-700/60 overflow-hidden"
              style={{ top: panelPos.top, left: panelPos.left, background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
                <h3 className="font-semibold text-sm text-white">Notifications</h3>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map(n => (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => { if (n.projectId) navigate(`/projects/${n.projectId}`); setOpen(false); }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800/60 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === 'overdue' ? 'bg-red-500/15' : 'bg-emerald-500/15'
                        }`}>
                          {n.type === 'overdue' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200">{n.title}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                        </div>
                        <span className="text-xs text-gray-600 shrink-0 mt-0.5">{n.time}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
