import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const progress = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0;

  // 3D tilt effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  // Circular progress ring
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      ref={cardRef}
      onClick={() => navigate(`/projects/${project._id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ zIndex: 10 }}
      className="card cursor-pointer group relative overflow-hidden"
      style={{
        transition: 'transform 0.15s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Color accent top border */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }}
      />

      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${project.color}15 0%, transparent 60%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base relative overflow-hidden"
          style={{ backgroundColor: project.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <span className="relative z-10">{project.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-200">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Name + desc */}
      <h3 className="font-semibold text-gray-100 mb-1.5 truncate text-base relative">{project.name}</h3>
      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed relative">{project.description}</p>
      )}

      {/* Footer with circular progress */}
      <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between relative">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Progress</p>
          <p className="text-sm font-semibold text-gray-300">
            {project.completedCount}<span className="text-gray-600 font-normal">/{project.taskCount} tasks</span>
          </p>
        </div>
        {/* Circular progress ring */}
        <svg width={size} height={size} className="transform">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={project.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring-circle"
            style={{ filter: `drop-shadow(0 0 4px ${project.color}80)` }}
          />
          <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
            fill="#e2e8f0" fontSize="10" fontWeight="600">
            {progress}%
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
