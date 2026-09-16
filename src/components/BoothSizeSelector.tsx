import React, { useState } from 'react';
import { 
  Maximize, Sliders, Check, Sparkles, Building2, 
  Grid, Compass, Palette, Type, ChevronDown, ChevronUp,
  ArrowRight, Layers, Flame
} from 'lucide-react';
import { BoothConfig, BoothSizePreset, BOOTH_PRESETS, BoothType, FlooringType } from '../types';

interface BoothSizeSelectorProps {
  currentConfig: BoothConfig;
  onSelectPreset: (preset: BoothSizePreset) => void;
  onUpdateConfig: (newConfig: BoothConfig) => void;
  onApplyCustomDimensions: (width: number, depth: number, type: BoothType) => void;
}

export const BoothSizeSelector: React.FC<BoothSizeSelectorProps> = ({
  currentConfig,
  onSelectPreset,
  onUpdateConfig,
  onApplyCustomDimensions,
}) => {
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentConfig.width);
  const [customDepth, setCustomDepth] = useState(currentConfig.depth);
  const [customType, setCustomType] = useState<BoothType>(currentConfig.type);
  const [customWallHeight, setCustomWallHeight] = useState(currentConfig.wallHeight);
  const [customFlooring, setCustomFlooring] = useState<FlooringType>(currentConfig.flooring);
  const [customBrandColor, setCustomBrandColor] = useState(currentConfig.brandColor);
  const [customBrandName, setCustomBrandName] = useState(currentConfig.brandName);
  const [customTagline, setCustomTagline] = useState(currentConfig.tagline);
  const [unitMode, setUnitMode] = useState<'m' | 'ft'>('m');

  // Convert m to ft for display
  const toFt = (m: number) => (m * 3.28084).toFixed(1);

  // Apply custom config
  const handleApplyCustom = () => {
    onUpdateConfig({
      ...currentConfig,
      width: customWidth,
      depth: customDepth,
      type: customType,
      wallHeight: customWallHeight,
      flooring: customFlooring,
      brandColor: customBrandColor,
      brandName: customBrandName,
      tagline: customTagline,
    });
    onApplyCustomDimensions(customWidth, customDepth, customType);
  };

  const flooringOptions: { id: FlooringType; label: string; previewColor: string }[] = [
    { id: 'wood_oak', label: 'Scandinavian Oak', previewColor: '#c29b6a' },
    { id: 'wood_dark', label: 'Dark Walnut', previewColor: '#523d2e' },
    { id: 'carpet_grey', label: 'Charcoal Carpet', previewColor: '#374151' },
    { id: 'carpet_navy', label: 'Royal Navy Carpet', previewColor: '#1e3a8a' },
    { id: 'concrete_polished', label: 'Polished Concrete', previewColor: '#94a3b8' },
    { id: 'marble_white', label: 'Carrara Marble', previewColor: '#f8fafc' },
  ];

  const brandColorPalette = [
    '#2563eb', // Royal Blue
    '#059669', // Emerald
    '#7c3aed', // Violet
    '#dc2626', // Crimson
    '#d97706', // Amber
    '#0891b2', // Cyan
    '#18181b', // Matte Obsidian
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-xl mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Booth Size & Geometry Selection
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Step 1: Configuration
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Choose a standard exhibition format or configure custom architectural dimensions and branding.
          </p>
        </div>

        {/* Unit & Toggle Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Unit Switcher */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setUnitMode('m')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                unitMode === 'm' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Metric (Meters)
            </button>
            <button
              onClick={() => setUnitMode('ft')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                unitMode === 'ft' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Imperial (Feet)
            </button>
          </div>

          {/* Toggle Customizer Button */}
          <button
            onClick={() => setIsCustomExpanded(!isCustomExpanded)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
              isCustomExpanded
                ? 'bg-zinc-800 border-indigo-500 text-indigo-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customized Options</span>
            {isCustomExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Preset Cards: Standard Booth Formats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {BOOTH_PRESETS.map((preset) => {
          const isSelected =
            currentConfig.width === preset.width &&
            currentConfig.depth === preset.depth &&
            currentConfig.type === preset.type;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 to-zinc-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/10'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {preset.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </div>

                {/* Booth Wireframe Mini-Diagram */}
                <div className="h-16 w-full bg-zinc-900/90 rounded-lg border border-zinc-800/80 mb-3 flex items-center justify-center p-2 relative overflow-hidden">
                  {/* Visual outline based on type */}
                  <div
                    className="relative border-2 rounded transition-all"
                    style={{
                      width: `${Math.min(preset.width * 12, 80)}px`,
                      height: `${Math.min(preset.depth * 12, 52)}px`,
                      borderColor: isSelected ? '#6366f1' : '#52525b',
                      backgroundColor: isSelected ? '#6366f120' : '#27272a40',
                    }}
                  >
                    {/* Top wall indicator */}
                    {preset.type !== 'island' && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t" />
                    )}
                    {/* Side walls */}
                    {(preset.type === 'inline' || preset.type === 'corner') && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-500" />
                    )}
                    {preset.type === 'inline' && (
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-indigo-500" />
                    )}
                  </div>

                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-zinc-500">
                    {unitMode === 'm'
                      ? `${preset.width}m × ${preset.depth}m`
                      : `${toFt(preset.width)}' × ${toFt(preset.depth)}'`}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {preset.name}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Popular for:</span>
                <span className="text-zinc-300 font-medium">{preset.popularFor}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customized Options Drawer */}
      {isCustomExpanded && (
        <div className="mt-6 p-5 bg-zinc-950 border border-indigo-500/30 rounded-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Customized Size & Architecture Specifications</h4>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Calculated Area: <strong>{(customWidth * customDepth).toFixed(1)} m²</strong> ({((customWidth * customDepth) * 10.7639).toFixed(0)} sq ft)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Dimensions: Width & Depth */}
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                1. Footprint Dimensions
              </h5>

              {/* Width Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Booth Width</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {customWidth}m ({toFt(customWidth)} ft)
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="14.0"
                  step="0.5"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-0.5">
                  <span>2.0m</span>
                  <span>6.0m</span>
                  <span>10.0m</span>
                  <span>14.0m</span>
                </div>
              </div>

              {/* Depth Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Booth Depth</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {customDepth}m ({toFt(customDepth)} ft)
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="12.0"
                  step="0.5"
                  value={customDepth}
                  onChange={(e) => setCustomDepth(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-0.5">
                  <span>2.0m</span>
                  <span>6.0m</span>
                  <span>9.0m</span>
                  <span>12.0m</span>
                </div>
              </div>

              {/* Wall Height */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Rear Wall Height</span>
                  <span className="font-mono text-indigo-400 font-bold">{customWallHeight}m</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[2.5, 3.0, 3.5, 4.0].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setCustomWallHeight(h)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        customWallHeight === h
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {h}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Typology & Structural Configuration */}
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                2. Booth Typology & Walls
              </h5>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'inline' as BoothType, label: 'Inline (3 Walls)', desc: 'Front aisle only' },
                  { type: 'corner' as BoothType, label: 'Corner (2 Walls)', desc: '2 open aisles' },
                  { type: 'peninsula' as BoothType, label: 'Peninsula (1 Wall)', desc: '3 open aisles' },
                  { type: 'island' as BoothType, label: 'Island (0 Walls)', desc: '360° open plaza' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setCustomType(item.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      customType === item.type
                        ? 'bg-indigo-950/60 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Flooring Selection */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Deck Flooring Finish</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {flooringOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCustomFlooring(f.id)}
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 text-[11px] transition-colors ${
                        customFlooring === f.id
                          ? 'border-indigo-500 bg-zinc-850 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: f.previewColor }}
                      />
                      <span className="truncate">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Branding Identity & Rigging Options */}
            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                3. Brand Identity & Header
              </h5>

              {/* Brand Name Input */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  placeholder="e.g. ACME INNOVATION"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Exhibition Campaign Tagline</label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  placeholder="e.g. Next-Gen Connected Intelligence"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Brand Color Pick */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Primary Architectural Color</label>
                <div className="flex items-center gap-2">
                  {brandColorPalette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomBrandColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        customBrandColor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={customBrandColor}
                    onChange={(e) => setCustomBrandColor(e.target.value)}
                    className="w-6 h-6 rounded-full bg-transparent cursor-pointer border border-zinc-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsCustomExpanded(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleApplyCustom();
                setIsCustomExpanded(false);
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Apply Customized Specifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
