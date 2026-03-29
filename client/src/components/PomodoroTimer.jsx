import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Coffee, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const MODES = {
  focus:  { label: 'Focus',       duration: 25 * 60, color: '#6366f1' },
  short:  { label: 'Short Break', duration: 5  * 60, color: '#10b981' },
  long:   { label: 'Long Break',  duration: 15 * 60, color: '#f59e0b' },
};

// Inline sidebar widget — no fixed/floating positioning
export default function PomodoroTimer() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode]         = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const currentMode  = MODES[mode];
  const progress     = timeLeft / currentMode.duration;
  const minutes      = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds      = (timeLeft % 60).toString().padStart(2, '0');

  // Ring dimensions
  const size         = 100;
  const strokeWidth  = 4;
  const radius       = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus') {
              setSessions(s => s + 1);
              toast.success('Focus session complete! Take a break 🎉', { duration: 5000 });
            } else {
              toast.success('Break over! Ready to focus? 💪', { duration: 5000 });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setTimeLeft(currentMode.duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="mx-4 mb-2 rounded-xl border border-gray-800/60 overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.6)' }}>

      {/* Collapsed row — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/40 transition-colors"
      >
        {/* Mini ring */}
        <div className="relative w-7 h-7 shrink-0">
          <svg width="28" height="28" className="-rotate-90">
            <circle cx="14" cy="14" r="11" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="14" cy="14" r="11" fill="none"
              stroke={currentMode.color} strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 11}
              strokeDashoffset={2 * Math.PI * 11 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 3px ${currentMode.color})` }}
            />
          </svg>
          {running && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: currentMode.color }} />
            </span>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="text-xs font-semibold text-gray-300 font-mono leading-none">{minutes}:{seconds}</p>
          <p className="text-[10px] mt-0.5" style={{ color: currentMode.color }}>{currentMode.label}</p>
        </div>

        {sessions > 0 && (
          <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">
            {sessions}🍅
          </span>
        )}

        {/* Play/Pause inline */}
        <button
          onClick={e => { e.stopPropagation(); setRunning(r => !r); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={{ background: currentMode.color + '25', color: currentMode.color }}
        >
          {running
            ? <Pause className="w-3 h-3" />
            : <Play  className="w-3 h-3 ml-px" />}
        </button>

        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
          : <ChevronUp   className="w-3.5 h-3.5 text-gray-600" />}
      </button>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800/60 p-3 space-y-3">
              {/* Mode tabs */}
              <div className="flex gap-1">
                {Object.entries(MODES).map(([key, m]) => (
                  <button key={key} onClick={() => switchMode(key)}
                    className="flex-1 text-[10px] py-1.5 rounded-lg font-medium transition-all"
                    style={mode === key
                      ? { backgroundColor: m.color + '25', color: m.color, border: `1px solid ${m.color}40` }
                      : { color: '#6b7280' }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Ring */}
              <div className="flex justify-center">
                <div className="relative">
                  <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
                    <circle cx={size/2} cy={size/2} r={radius} fill="none"
                      stroke={currentMode.color} strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 5px ${currentMode.color})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white font-mono">{minutes}:{seconds}</span>
                    <span className="text-[10px] mt-0.5" style={{ color: currentMode.color }}>{currentMode.label}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={reset}
                  className="p-2 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setRunning(r => !r)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}bb)`, boxShadow: `0 0 16px ${currentMode.color}50` }}>
                  {running
                    ? <Pause className="w-4 h-4 text-white" />
                    : <Play  className="w-4 h-4 text-white ml-0.5" />}
                </button>
                <button onClick={() => switchMode(mode === 'focus' ? 'short' : 'focus')}
                  className="p-2 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-all">
                  <Coffee className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
