import React from 'react';
import { ESDzignLogo } from './ESDzignLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-10 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ESDzignLogo size="sm" variant="compact" showTagline={false} />
          <span className="text-zinc-600 hidden sm:inline">·</span>
          <span className="hidden sm:inline">Exhibition Booth Layout & Client 3D Review Studio</span>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-zinc-400">
          <span>WebGL 2.0 Accelerated</span>
          <span>Scale Metric CAD Support</span>
          <span>IEC 60364-7-711 Venue Electrical Standards</span>
        </div>
      </div>
    </footer>
  );
};
