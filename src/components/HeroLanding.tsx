import React from 'react';
import { 
  ArrowRight, Sparkles, CheckCircle2, Box, Eye, Layers, 
  Clock, ShieldCheck, Zap, Laptop, Users
} from 'lucide-react';
import { ESDzignLogo } from './ESDzignLogo';

interface HeroLandingProps {
  onStartQuickTask: () => void;
  onOpenClientReviewModal: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartQuickTask,
  onOpenClientReviewModal,
}) => {
  return (
    <div className="relative pt-6 pb-12 overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-blue-500/10 to-emerald-500/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Studio Emblem & Feature Pill */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-xl backdrop-blur-md">
            <ESDzignLogo size="sm" variant="badge-only" />
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-white tracking-tight">ES Dzign Research</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300 text-[11px]">interior • architecture • design</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-300 shadow-xl backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">Next-Gen Exhibition CAD & 3D Workflow</span>
            <span className="text-zinc-600">|</span>
            <span className="text-indigo-400 flex items-center gap-1 font-medium">
              Real-Time Client Sign-Off
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mt-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Design Exhibition Booths & Stream{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
              Real-Time 3D Previews
            </span>{' '}
            for Client Review
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Configure standard or custom booth sizes, drag-and-drop furniture and LED video walls onto scale floor plans, and generate interactive WebGL 3D walk-throughs for instant client sign-off.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartQuickTask}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 group cursor-pointer"
          >
            <span>Launch Quick Design Task</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenClientReviewModal}
            className="px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Open Client Review Room Demo</span>
          </button>
        </div>

        {/* Feature Benefit Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">60-Second Setup</span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Instant 3×3m, 6×3m, 6×6m presets or custom metric dimensions with realistic walls.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Drag & Drop Outline</span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Precision 0.25m snap grid with counters, LED video walls, lounge zones, and rigging.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Box className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">WebGL 3D Engine</span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Smooth turntable orbit, visitor eye-level walk-through, and day/night hall lighting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Client Sign-Off</span>
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Live feedback pins, revision history, and one-click CAD / SVG specification export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
