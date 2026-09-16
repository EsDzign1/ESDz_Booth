import React from 'react';
import esLogo from '../assets/images/es_dzign_logo_1789547436350.jpg';

interface ESDzignLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'compact' | 'full' | 'badge-only';
  className?: string;
  showTagline?: boolean;
}

export const ESDzignLogo: React.FC<ESDzignLogoProps> = ({
  size = 'md',
  variant = 'compact',
  className = '',
  showTagline = true,
}) => {
  // Dimensions map
  const badgeSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const badgePxMap = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  if (variant === 'badge-only') {
    return (
      <div className={`relative rounded-full overflow-hidden bg-white border border-zinc-200/80 shadow-sm flex items-center justify-center ${badgeSizeMap[size]} ${className}`}>
        <img
          src={esLogo}
          alt="ES Dzign Research"
          className="w-full h-full object-contain p-0.5"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to SVG if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Circular Badge */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border border-zinc-300 shadow-xl overflow-hidden p-1.5 flex items-center justify-center">
          <img
            src={esLogo}
            alt="ES Dzign Research"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text Details */}
        <div className="mt-3">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ES Dzign Research
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-wide mt-0.5">
            interior <span className="text-zinc-600">•</span> architecture <span className="text-zinc-600">•</span> design
          </p>
        </div>
      </div>
    );
  }

  // Default: compact horizontal brand lockup
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular Badge with User's Uploaded Brand Emblem */}
      <div className={`relative rounded-full bg-white border border-zinc-700/50 shadow-md shadow-black/40 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5 ${badgeSizeMap[size]}`}>
        <img
          src={esLogo}
          alt="ES Dzign Research Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Title and Domain Specialization */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight whitespace-nowrap">
            ES <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-emerald-300">Dzign Research</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-semibold uppercase">
            3D Studio
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] sm:text-[11px] text-zinc-400 tracking-tight whitespace-nowrap">
            interior <span className="text-zinc-600">•</span> architecture <span className="text-zinc-600">•</span> design
          </p>
        )}
      </div>
    </div>
  );
};
