import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Shield, Trash2, KeyRound, Users, FolderKanban,
  ListTodo, Crown, X, Eye, EyeOff,
} from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState(null); // user object
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} and ALL their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/users/${resetModal._id}/reset-password`, { newPassword });
      toast.success(`Password reset for ${resetModal.name}`);
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/toggle-admin`);
      setUsers(prev => prev.map(u =>
        u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u
      ));
      toast.success(`${user.name} updated`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">Manage all registered users</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Total Tasks', value: users.reduce((s, u) => s + u.taskCount, 0), icon: ListTodo, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Projects', value: users.reduce((s, u) => s + u.projectCount, 0), icon: FolderKanban, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{label}</span>
              <div className={`${bg} p-2 rounded-xl`}><Icon className={`w-4 h-4 ${color}`} /></div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-gray-800/60">
            <h2 className="text-sm font-semibold text-gray-300">{users.length} registered users</h2>
          </div>
          <div className="divide-y divide-gray-800/50">
            {users.map((user, i) => (
              <motion.div key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-200 truncate">{user.name}</p>
                    {user.isAdmin && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-semibold">
                        <Crown className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3 h-3" /> {user.taskCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="w-3 h-3" /> {user.projectCount}
                  </span>
                  <span>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                    className={`p-2 rounded-xl transition-all text-xs ${
                      user.isAdmin
                        ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                        : 'text-gray-600 hover:text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setResetModal(user); setNewPassword(''); setShowPass(false); }}
                    title="Reset password"
                    className="p-2 text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    title="Delete user"
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reset password modal */}
      <AnimatePresence>
        {resetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setResetModal(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-sm card-glass"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Reset Password</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{resetModal.name} · {resetModal.email}</p>
                </div>
                <button onClick={() => setResetModal(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setResetModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <LoadingSpinner size="sm" /> : 'Reset Password'}
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
