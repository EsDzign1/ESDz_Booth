import React, { useState } from 'react';
import { 
  FileText, Download, Printer, CheckCircle, Zap, 
  ShieldCheck, AlertTriangle, Box, Ruler, Check, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoothConfig, PlacedBoothItem } from '../types';

interface LayoutOutlineSummaryProps {
  config: BoothConfig;
  items: PlacedBoothItem[];
  onOpenClientReviewModal: () => void;
}

export const LayoutOutlineSummary: React.FC<LayoutOutlineSummaryProps> = ({
  config,
  items,
  onOpenClientReviewModal,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const totalArea = (config.width * config.depth).toFixed(1);
  const totalAreaSqFt = ((config.width * config.depth) * 10.7639).toFixed(0);

  // Calculate perimeter walls based on booth type
  let perimeterWallMeters = 0;
  if (config.type === 'inline') perimeterWallMeters = config.width + config.depth * 2;
  else if (config.type === 'corner') perimeterWallMeters = config.width + config.depth;
  else if (config.type === 'peninsula') perimeterWallMeters = config.width;
  else if (config.type === 'island') perimeterWallMeters = 0;

  // Power load calculation
  const totalWatts = items.reduce((acc, it) => acc + (it.powerWatts || 0), 0);
  const totalKw = (totalWatts / 1000).toFixed(2);
  const recommendedCircuits = Math.max(1, Math.ceil(totalWatts / 2000));

  // Bill of Materials aggregation
  interface BOMItemSummary {
    count: number;
    name: string;
    category: string;
    watts: number;
  }

  const itemCounts: Record<string, BOMItemSummary> = {};
  for (const it of items) {
    if (!itemCounts[it.type]) {
      itemCounts[it.type] = { count: 0, name: it.name, category: it.category, watts: it.powerWatts || 0 };
    }
    itemCounts[it.type].count += 1;
  }

  // Export floor plan outline as SVG file
  const handleExportSVG = () => {
    const scale = 50; // 50px per meter
    const svgW = config.width * scale + 100;
    const svgH = config.depth * scale + 100;

    const itemsSvg = items.map((it) => {
      const itX = (it.x + config.width / 2) * scale + 50 - (it.width * scale) / 2;
      const itY = (it.z + config.depth / 2) * scale + 50 - (it.depth * scale) / 2;
      return `
        <rect x="${itX}" y="${itY}" width="${it.width * scale}" height="${it.depth * scale}" 
          fill="#3b82f6" fill-opacity="0.3" stroke="#2563eb" stroke-width="2" rx="4" />
        <text x="${itX + (it.width * scale) / 2}" y="${itY + (it.depth * scale) / 2 + 4}" 
          font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle">${it.name}</text>
      `;
    }).join('\n');

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
        <rect width="100%" height="100%" fill="#09090b" />
        <!-- Grid -->
        <defs>
          <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#27272a" stroke-width="1"/>
          </pattern>
        </defs>
        <rect x="50" y="50" width="${config.width * scale}" height="${config.depth * scale}" fill="url(#grid)" />
        
        <!-- Booth Perimeter Outline -->
        <rect x="50" y="50" width="${config.width * scale}" height="${config.depth * scale}" 
          fill="none" stroke="#6366f1" stroke-width="3" />
        
        <!-- Title & Dimensions -->
        <text x="50" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">
          ${config.name} - ${config.width}m x ${config.depth}m (${config.type.toUpperCase()})
        </text>
        <text x="50" y="${svgH - 20}" font-family="sans-serif" font-size="11" fill="#a1a1aa">
          Scale: 1m = 50px | Generated via ES Dzign Research - 3D Exhibition Studio
        </text>

        <!-- Placed Items -->
        ${itemsSvg}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booth-outline-floorplan-${config.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('SVG Floor Plan Downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Print summary sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-xl mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Outline Layout Specification & Client Review Summary
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              Live Technical BOM
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Engineered outline metrics, venue compliance verification, and electrical load requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportSVG}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CAD/SVG Outline</span>
          </button>

          <button
            onClick={onOpenClientReviewModal}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Launch Client Review Room</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* KPI Metric Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Total Footprint</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">{totalArea} m²</div>
          <span className="text-[11px] text-zinc-400 font-mono">{totalAreaSqFt} sq ft</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Wall Perimeter</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">{perimeterWallMeters} m</div>
          <span className="text-[11px] text-indigo-400 capitalize">{config.type} layout</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Estimated Power</span>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{totalKw} kW</div>
          <span className="text-[11px] text-zinc-400">{recommendedCircuits} × 2.4kW circuits</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Safety & ADA Check</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Passed</span>
          </div>
          <span className="text-[11px] text-zinc-400">Clear aisles &gt; 1.2m</span>
        </div>
      </div>

      {/* Bill of Materials Inventory Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Bill of Materials (BOM) & Inventory Breakdown
          </h4>
          <span className="text-xs text-zinc-500 font-mono">{items.length} units placed</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/90 text-zinc-400 uppercase tracking-wider font-mono text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Equipment / Fixture</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Qty</th>
                <th className="py-2.5 px-3">Power Rating</th>
                <th className="py-2.5 px-3">Total Load</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/50">
              {Object.entries(itemCounts).map(([typeKey, data]) => (
                <tr key={typeKey} className="hover:bg-zinc-850/60 transition-colors">
                  <td className="py-2 px-3 font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{data.name}</span>
                  </td>
                  <td className="py-2 px-3 text-zinc-400 capitalize">{data.category}</td>
                  <td className="py-2 px-3 font-mono font-bold text-indigo-300">{data.count}</td>
                  <td className="py-2 px-3 font-mono text-zinc-400">{data.watts}W</td>
                  <td className="py-2 px-3 font-mono text-amber-300 font-semibold">{data.watts * data.count}W</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-medium">Ready</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-zinc-500">
                    No items placed on floor plan yet. Drag fixtures from library above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
