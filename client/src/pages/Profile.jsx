import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Key, Save, Shield, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    const payload = { name: form.name };
    if (form.password) payload.password = form.password;
    try {
      const { data } = await api.put('/auth/profile', payload);
      updateUser({ _id: data._id, name: data.name, email: data.email });
      localStorage.setItem('token', data.token);
      toast.success('Profile updated!');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Key },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </motion.div>

      {/* Profile hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-glass relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <span className="relative z-10">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2.5">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <Shield className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1 p-1 bg-gray-900/60 rounded-xl border border-gray-800/60"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="label flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input opacity-40 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-700 mt-1.5">Email address cannot be changed.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-400 leading-relaxed">
                    Leave password fields empty to keep your current password unchanged.
                  </p>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                    placeholder="Min. 6 characters"
                    minLength={form.password ? 6 : undefined}
                  />
                  {/* Password strength */}
                  {form.password && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            form.password.length >= i * 3
                              ? i <= 1
                                ? 'bg-red-500'
                                : i <= 2
                                ? 'bg-amber-500'
                                : i <= 3
                                ? 'bg-yellow-400'
                                : 'bg-emerald-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="input"
                    placeholder="Repeat new password"
                  />
                  {form.password && form.confirmPassword && (
                    <p
                      className={`text-xs mt-1.5 font-medium ${
                        form.password === form.confirmPassword
                          ? 'text-emerald-500'
                          : 'text-red-400'
                      }`}
                    >
                      {form.password === form.confirmPassword
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 w-full justify-center py-3"
          >
            {saving ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
