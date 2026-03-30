import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, User, LogOut, Zap, ChevronRight, Search, Shield, FileText, Flame } from 'lucide-react';
import NotificationBell from './NotificationBell';
import CommandPalette from './CommandPalette';
import PomodoroTimer from './PomodoroTimer';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/habits', icon: Flame, label: 'Habits' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => logout();

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-64 shrink-0 bg-gray-900/90 backdrop-blur-xl border-r border-gray-800/60 flex flex-col h-full relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

        {/* Logo + bells */}
        <div className="p-4 border-b border-gray-800/60 relative">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center relative overflow-hidden glow-indigo">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-700" />
                <Zap className="w-5 h-5 text-white relative z-10" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TaskFlow</span>
            </motion.div>
            <NotificationBell />
          </div>

          {/* Search button */}
          <button
            onClick={() => setCmdOpen(true)}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all text-sm group"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="text-xs bg-gray-900 border border-gray-700 px-1.5 py-0.5 rounded text-gray-600 group-hover:text-gray-500">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 relative">
          {user?.isAdmin && (
            <NavLink to="/admin" end>
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group mb-1 ${
                    isActive
                      ? 'bg-red-500/20 text-white border border-red-500/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  }`}
                >
                  {isActive && <motion.div layoutId="activeIndicator" className="nav-active-indicator" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />}
                  <Shield className={`w-5 h-5 ${isActive ? 'text-red-400' : 'group-hover:text-red-400'}`} />
                  <span>Admin</span>
                  {isActive && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto"><ChevronRight className="w-4 h-4 text-red-400" /></motion.div>}
                </motion.div>
              )}
            </NavLink>
          )}
          {navItems.map(({ to, icon: Icon, label }, i) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  }`}
                >
                  {isActive && <motion.div layoutId="activeIndicator" className="nav-active-indicator" />}
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-indigo-400' : 'group-hover:text-gray-200'}`} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto">
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pomodoro Timer */}
        <PomodoroTimer />

        {/* User + Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-4 border-t border-gray-800/60 space-y-2 relative">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-indigo-300 font-bold text-sm relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3730a3, #6366f1)' }}>
              {user?.name?.charAt(0).toUpperCase()}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group border border-transparent hover:border-red-500/20">
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            Logout
          </button>
        </motion.div>
      </motion.aside>
    </>
  );
}
