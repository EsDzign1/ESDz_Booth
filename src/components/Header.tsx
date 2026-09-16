import React from 'react';
import { Sparkles, Share2, Layers, Download, CheckCircle2 } from 'lucide-react';
import { ESDzignLogo } from './ESDzignLogo';

interface HeaderProps {
  onOpenClientReviewModal: () => void;
  onScrollToWorkspace: () => void;
  isApproved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenClientReviewModal,
  onScrollToWorkspace,
  isApproved,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center cursor-pointer select-none" onClick={onScrollToWorkspace}>
          <ESDzignLogo size="md" variant="compact" />
        </div>

        {/* Center Live Engine Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300 font-medium">WebGL 3D Engine:</span>
          <span className="text-emerald-400 font-mono font-semibold">Active · 60 FPS</span>
          {isApproved && (
            <span className="ml-2 pl-2 border-l border-zinc-700 text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Client Approved
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onScrollToWorkspace}
            className="hidden sm:flex px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Design Workspace</span>
          </button>

          <button
            onClick={onOpenClientReviewModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Client 3D Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
