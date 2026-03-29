import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { Plus, X, ChevronLeft, Filter, Search, Download } from 'lucide-react';
import api from '../api/axios';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COLUMNS = [
  {
    key: 'todo',
    label: 'To Do',
    color: 'text-gray-300',
    headerBg: 'bg-gray-800/50',
    border: 'border-gray-700/50',
    dot: 'bg-gray-500',
  },
  {
    key: 'inprogress',
    label: 'In Progress',
    color: 'text-indigo-300',
    headerBg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  {
    key: 'done',
    label: 'Done',
    color: 'text-emerald-300',
    headerBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
];

const defaultTaskForm = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  status: 'todo',
};

// Sortable task wrapper for dnd-kit
function SortableTask({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(defaultTaskForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ priority: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get(`/projects/${id}/tasks`)])
      .then(([projRes, tasksRes]) => {
        setProject(projRes.data.find((p) => p._id === id));
        setTasks(tasksRes.data);
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.description?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [tasks, filters, search]);

  const openCreate = (status = 'todo') => {
    setEditingTask(null);
    setForm({ ...defaultTaskForm, status });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status,
    });
    setShowModal(true);
  };

  const exportCSV = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created'];
    const rows = tasks.map(t => [
      `"${t.title}"`,
      `"${t.description || ''}"`,
      t.status,
      t.priority,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'tasks'}-tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported!');
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981'],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, dueDate: form.dueDate || null };
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data : t)));
        if (data.status === 'done' && editingTask.status !== 'done') fireConfetti();
        toast.success('Task updated');
      } else {
        const { data } = await api.post(`/projects/${id}/tasks`, payload);
        setTasks((prev) => [data, ...prev]);
        toast.success('Task created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Drag start
  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id));
  };

  // Drag end — move task to different column
  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setActiveTask(null);
      if (!over || active.id === over.id) return;

      // Dropped onto a column key
      const targetCol = COLUMNS.find((c) => c.key === over.id);
      if (targetCol) {
        const task = tasks.find((t) => t._id === active.id);
        if (!task || task.status === targetCol.key) return;
        const oldStatus = task.status;
        // Optimistic update
        setTasks((prev) =>
          prev.map((t) => (t._id === active.id ? { ...t, status: targetCol.key } : t))
        );
        try {
          await api.put(`/tasks/${active.id}`, { status: targetCol.key });
          if (targetCol.key === 'done' && oldStatus !== 'done') fireConfetti();
        } catch {
          // Revert on error
          setTasks((prev) =>
            prev.map((t) => (t._id === active.id ? { ...t, status: oldStatus } : t))
          );
          toast.error('Failed to move task');
        }
      }
    },
    [tasks]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasActiveFilters = filters.priority || filters.status || search;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 flex-wrap"
        >
          <Link
            to="/projects"
            className="p-2 text-gray-500 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-all shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {project && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold relative overflow-hidden shrink-0"
                style={{
                  backgroundColor: project.color,
                  boxShadow: `0 0 20px ${project.color}50`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <span className="relative z-10">{project.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{project?.name}</h1>
              {project?.description && (
                <p className="text-sm text-gray-500 truncate">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm w-40 focus:w-52 transition-all duration-300"
                placeholder="Search tasks..."
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-1.5 text-sm py-2 ${
                showFilters || hasActiveFilters
                  ? 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10'
                  : ''
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {(filters.priority || filters.status) && (
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              )}
            </button>

            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm py-2" title="Export CSV">
              <Download className="w-4 h-4" />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openCreate()}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              <Plus className="w-4 h-4" /> Add Task
            </motion.button>
          </div>
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="flex gap-3 p-4 card-glass items-end flex-wrap">
                <div>
                  <label className="label text-xs">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="input text-sm py-1.5"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="input text-sm py-1.5"
                  >
                    <option value="">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                {(filters.priority || filters.status) && (
                  <button
                    onClick={() => setFilters({ priority: '', status: '' })}
                    className="btn-secondary text-sm py-1.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col, colIndex) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.08 }}
                className={`kanban-col rounded-2xl border ${col.border} p-4 min-h-72`}
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}
              >
                {/* Column header — also acts as drop target */}
                <div
                  className={`flex items-center justify-between mb-4 p-2.5 rounded-xl ${col.headerBg}`}
                  id={col.key}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h2 className={`font-semibold text-sm ${col.color}`}>{col.label}</h2>
                    <span className="bg-gray-800/80 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreate(col.key)}
                    className="p-1 text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Tasks */}
                <SortableContext
                  items={colTasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {colTasks.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-gray-800/60"
                        >
                          <p className="text-xs text-gray-700 font-medium">No tasks here</p>
                          <p className="text-xs text-gray-800 mt-0.5">Drag tasks or click +</p>
                        </motion.div>
                      ) : (
                        colTasks.map((task) => (
                          <SortableTask
                            key={task._id}
                            task={task}
                            onEdit={openEdit}
                            onDelete={handleDeleteTask}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </motion.div>
            );
          })}
        </div>

        {/* Drag overlay ghost card */}
        <DragOverlay dropAnimation={{ duration: 200 }}>
          {activeTask && (
            <div className="rotate-1 scale-105 opacity-90 pointer-events-none">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>

        {/* Task Modal */}
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
                className="w-full max-w-md card-glass"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    {editingTask ? 'Edit Task' : 'New Task'}
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
                    <label className="label">Title</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="input"
                      placeholder="Task title"
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
                      placeholder="Task details..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Priority</label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="input"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="input"
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      Due Date <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="input"
                    />
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
                      ) : editingTask ? (
                        'Save Changes'
                      ) : (
                        'Create Task'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}
