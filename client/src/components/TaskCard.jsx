import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Calendar, AlertCircle, GripVertical } from 'lucide-react';

const priorityConfig = {
  low: { badge: 'badge-low', label: 'Low', dot: 'bg-emerald-400' },
  medium: { badge: 'badge-medium', label: 'Medium', dot: 'bg-amber-400' },
  high: { badge: 'badge-high', label: 'High', dot: 'bg-red-400' },
};

export default function TaskCard({ task, onEdit, onDelete, dragHandleProps }) {
  const [deleting, setDeleting] = useState(false);
  const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-xl p-4 border transition-all duration-200 hover:border-gray-600/60 hover:-translate-y-0.5 ${
        isOverdue
          ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
          : 'bg-gray-800/50 border-gray-700/40 hover:bg-gray-800/70'
      }`}
      style={{ boxShadow: isOverdue ? '0 0 15px rgba(239,68,68,0.1)' : 'none' }}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing transition-opacity">
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}

      {/* Priority dot indicator */}
      <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority]?.dot} opacity-60`} />

      {/* Header */}
      <div className="flex items-start gap-2 mb-2.5 pr-4">
        <h4 className={`text-sm font-medium leading-snug flex-1 ${isOverdue ? 'text-red-300' : 'text-gray-100'}`}>
          {task.title}
        </h4>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className={priorityConfig[task.priority]?.badge}>{priorityConfig[task.priority]?.label}</span>
        <div className="flex items-center gap-2">
          {formattedDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
              {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formattedDate}
            </span>
          )}
          {/* Action buttons - visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button onClick={() => onEdit(task)}
              className="p-1.5 text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-150">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
