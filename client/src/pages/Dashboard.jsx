import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo, ArrowRight,
  TrendingUp, Sparkles, Plus, FolderPlus, Target,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SkeletonStats } from '../components/LoadingSpinner';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Your future is created by what you do today.", author: "Robert Kiyosaki" },
  { text: "Productivity is never an accident.", author: "Paul J. Meyer" },
  { text: "Take care of the minutes and the hours will take care of themselves.", author: "Lord Chesterfield" },
];

const statusConfig = {
  todo: { label: 'To Do', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  inprogress: { label: 'In Progress', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

const priorityConfig = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-400">{payload[0].value} completed</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    api.get('/tasks/stats').then(({ data }) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats?.total ?? 0, icon: ListTodo, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.2)' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'rgba(245,158,11,0.2)' },
    { label: 'Overdue', value: stats?.overdue ?? 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'rgba(239,68,68,0.2)' },
  ];

  const completionRate = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-indigo-500/20"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(15,23,42,0.8) 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name?.split(' ')[0]}</span>!
              </h1>
            </div>
            <p className="text-gray-500 text-sm ml-7 mb-4">
              {stats?.overdue > 0
                ? `⚠️ You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} that need attention.`
                : stats?.inProgress > 0
                ? `You have ${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress. Keep it up!`
                : "Everything's on track. Have a productive day!"}
            </p>
            {/* Quote */}
            <div className="ml-7 flex items-start gap-2">
              <div className="w-0.5 bg-indigo-500/50 rounded-full self-stretch min-h-[2rem]" />
              <div>
                <p className="text-sm text-gray-400 italic">"{quote.text}"</p>
                <p className="text-xs text-gray-600 mt-0.5">— {quote.author}</p>
              </div>
            </div>
          </div>

          {/* Completion ring */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-20 h-20">
              <svg width="80" height="80" className="transform -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - completionRate / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease', filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">completion</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-5 ml-7 flex-wrap">
          <button onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-all">
            <FolderPlus className="w-3.5 h-3.5" /> New Project
          </button>
          <button onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-lg transition-all">
            <Target className="w-3.5 h-3.5" /> View Tasks
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? <SkeletonStats /> : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, border, glow }) => (
            <motion.div key={label} variants={item}
              className={`stat-card card border ${border} overflow-hidden cursor-default`}
              whileHover={{ boxShadow: `0 0 30px ${glow}`, y: -4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <div className={`${bg} p-2 rounded-xl`}><Icon className={`w-4 h-4 ${color}`} /></div>
              </div>
              <CountUp end={value} duration={1.5} delay={0.2} className={`text-3xl font-bold ${color}`} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-300">Completions — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats?.last7Days ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2}
                fill="url(#grad)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5, fill: '#818cf8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">Recent Tasks</h2>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!stats?.recentTasks?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-gray-800/60 rounded-2xl flex items-center justify-center mb-3">
                <ListTodo className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No tasks yet</p>
              <p className="text-xs text-gray-700 mt-1">Create a project to get started</p>
              <button onClick={() => navigate('/projects')}
                className="mt-4 btn-primary text-xs flex items-center gap-1.5 py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentTasks.map((task, i) => (
                <motion.div key={task._id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/70 rounded-xl transition-colors cursor-default">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.project?.color || '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate font-medium">{task.title}</p>
                    <p className="text-xs text-gray-600 truncate">{task.project?.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[task.status]?.bg} ${statusConfig[task.status]?.color}`}>
                    {statusConfig[task.status]?.label}
                  </span>
                  <span className={priorityConfig[task.priority]}>{task.priority}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
