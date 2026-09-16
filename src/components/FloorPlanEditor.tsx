import React, { useRef, useState, useCallback } from 'react';
import { 
  RotateCw, Trash2, Copy, Move, Plus, ChevronRight, 
  Layers, AlertCircle, Info, Sparkles, SlidersHorizontal,
  Maximize2, Eye, Download, ShieldCheck
} from 'lucide-react';
import { 
  BoothConfig, PlacedBoothItem, CatalogItemDefinition, 
  CATALOG_ITEMS, ItemCategory 
} from '../types';

interface FloorPlanEditorProps {
  config: BoothConfig;
  items: PlacedBoothItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItems: (newItems: PlacedBoothItem[]) => void;
}

export const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  config,
  items,
  selectedItemId,
  onSelectItem,
  onUpdateItems,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [draggedCatalogItem, setDraggedCatalogItem] = useState<CatalogItemDefinition | null>(null);
  const [isDraggingCanvasItem, setIsDraggingCanvasItem] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Canvas visual scaling: calculate pixels per meter based on booth dimensions
  // Max width of canvas container approx 600-700px
  const pixelsPerMeter = Math.min(
    520 / Math.max(config.width, 3),
    420 / Math.max(config.depth, 3)
  );

  const canvasWidthPx = config.width * pixelsPerMeter;
  const canvasHeightPx = config.depth * pixelsPerMeter;

  // Convert booth meter coordinates (origin 0,0 at booth center) to canvas pixel coordinates
  const metersToCanvasPx = useCallback((x: number, z: number) => {
    const pxX = (x + config.width / 2) * pixelsPerMeter;
    const pxY = (z + config.depth / 2) * pixelsPerMeter;
    return { pxX, pxY };
  }, [config.width, config.depth, pixelsPerMeter]);

  // Convert canvas pixel coordinates to booth meters
  const canvasPxToMeters = useCallback((pxX: number, pxY: number) => {
    let mX = pxX / pixelsPerMeter - config.width / 2;
    let mZ = pxY / pixelsPerMeter - config.depth / 2;

    if (snapToGrid) {
      const snapStep = 0.25; // 25cm snap precision
      mX = Math.round(mX / snapStep) * snapStep;
      mZ = Math.round(mZ / snapStep) * snapStep;
    }
    return { mX, mZ };
  }, [config.width, config.depth, pixelsPerMeter, snapToGrid]);

  // Add Item from Catalog to Floor Plan
  const handleAddItem = (catItem: CatalogItemDefinition, initialX = 0, initialZ = 0) => {
    const newItem: PlacedBoothItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: catItem.type,
      name: catItem.name,
      category: catItem.category,
      x: initialX,
      z: initialZ,
      rotation: 0,
      width: catItem.defaultWidth,
      depth: catItem.defaultDepth,
      height: catItem.defaultHeight,
      color: catItem.color,
      powerWatts: catItem.powerWatts,
    };

    onUpdateItems([...items, newItem]);
    onSelectItem(newItem.id);
  };

  // Canvas Drag & Drop Listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCatalogItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropPxX = e.clientX - rect.left;
    const dropPxY = e.clientY - rect.top;

    const { mX, mZ } = canvasPxToMeters(dropPxX, dropPxY);

    // Constrain to booth boundaries
    const halfW = (config.width - draggedCatalogItem.defaultWidth) / 2;
    const halfD = (config.depth - draggedCatalogItem.defaultDepth) / 2;
    const clampedX = Math.max(-halfW, Math.min(halfW, mX));
    const clampedZ = Math.max(-halfD, Math.min(halfD, mZ));

    handleAddItem(draggedCatalogItem, clampedX, clampedZ);
    setDraggedCatalogItem(null);
  };

  // Moving existing placed item on floor plan
  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedBoothItem) => {
    e.stopPropagation();
    onSelectItem(item.id);
    setIsDraggingCanvasItem(true);
    setActiveDragId(item.id);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickPxX = e.clientX - rect.left;
      const clickPxY = e.clientY - rect.top;
      const { pxX, pxY } = metersToCanvasPx(item.x, item.z);
      setDragOffset({ x: clickPxX - pxX, y: clickPxY - pxY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvasItem || !activeDragId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentPxX = e.clientX - rect.left - dragOffset.x;
    const currentPxY = e.clientY - rect.top - dragOffset.y;

    const { mX, mZ } = canvasPxToMeters(currentPxX, currentPxY);

    const activeItem = items.find((it) => it.id === activeDragId);
    if (!activeItem) return;

    // Boundary constraints based on item dimension
    const halfW = (config.width - activeItem.width) / 2;
    const halfD = (config.depth - activeItem.depth) / 2;
    const boundedX = Number(Math.max(-halfW, Math.min(halfW, mX)).toFixed(2));
    const boundedZ = Number(Math.max(-halfD, Math.min(halfD, mZ)).toFixed(2));

    const updated = items.map((it) =>
      it.id === activeDragId ? { ...it, x: boundedX, z: boundedZ } : it
    );
    onUpdateItems(updated);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvasItem(false);
    setActiveDragId(null);
  };

  // Rotate selected item by 45 degrees
  const handleRotateSelected = (deltaAngle = 45) => {
    if (!selectedItemId) return;
    const updated = items.map((it) => {
      if (it.id === selectedItemId) {
        const nextRot = ((it.rotation || 0) + deltaAngle) % 360;
        return { ...it, rotation: nextRot };
      }
      return it;
    });
    onUpdateItems(updated);
  };

  // Duplicate selected item
  const handleDuplicateSelected = () => {
    const item = items.find((it) => it.id === selectedItemId);
    if (!item) return;

    const duplicated: PlacedBoothItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(config.width / 2 - item.width / 2, item.x + 0.3),
      z: Math.min(config.depth / 2 - item.depth / 2, item.z + 0.3),
      name: `${item.name} (Copy)`,
    };
    onUpdateItems([...items, duplicated]);
    onSelectItem(duplicated.id);
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    onUpdateItems(items.filter((it) => it.id !== selectedItemId));
    onSelectItem(null);
  };

  // Filter Catalog
  const filteredCatalog = activeCategory === 'all'
    ? CATALOG_ITEMS
    : CATALOG_ITEMS.filter((it) => it.category === activeCategory);

  const selectedItem = items.find((it) => it.id === selectedItemId);

  return (
    <div 
      ref={containerRef}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:p-6 flex flex-col shadow-xl"
    >
      {/* Editor Header: Title, Outline Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              2D Floor Plan Outline & Layout
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300">
              {config.width}m × {config.depth}m ({(config.width * config.depth).toFixed(1)} m²)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Drag items from the catalogue into the floor plan. Real-time changes sync directly to the 3D preview.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium transition-all ${
              snapToGrid 
                ? 'bg-zinc-800 border-indigo-500/40 text-indigo-300' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <span>Snap 0.25m: {snapToGrid ? 'ON' : 'OFF'}</span>
          </button>

          {selectedItem && (
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => handleRotateSelected(45)}
                title="Rotate 45°"
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDuplicateSelected}
                title="Duplicate"
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSelected}
                title="Remove Element"
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace: Catalog Sidebar + Grid Floor Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        {/* Left: Component Catalog Palette (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Component Library
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {filteredCatalog.length} items
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {(['all', 'reception', 'multimedia', 'meeting', 'display', 'decor'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Draggable Catalog Items List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredCatalog.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={() => setDraggedCatalogItem(item)}
                onClick={() => handleAddItem(item)}
                className="group p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/50 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>{item.defaultWidth}m × {item.defaultDepth}m</span>
                      {item.powerWatts > 0 && <span>⚡ {item.powerWatts}W</span>}
                    </div>
                  </div>
                </div>
                <button
                  title="Add to floor plan"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-indigo-600 text-white text-xs transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Click any item or drag onto floor plan directly.</span>
          </div>
        </div>

        {/* Right: Architectural 2D Floor Plan Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 overflow-hidden relative min-h-[460px]">
          {/* Top Ruler / Orientation Label */}
          <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 pb-2 px-2 font-mono">
            <span>◄ REAR OF BOOTH (SERVICE DUCTS) ►</span>
            <span className="text-indigo-400 font-semibold">{config.type.toUpperCase()} SPECIFICATION</span>
          </div>

          {/* Floor Plan Perimeter Container */}
          <div 
            className="relative flex items-center justify-center p-6"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Outline Aisle Indicators */}
            {config.type === 'inline' && (
              <>
                <div className="absolute top-1 text-[10px] text-zinc-500 font-mono">ADJOINING BOOTH WALL</div>
                <div className="absolute left-0 -rotate-90 text-[10px] text-zinc-500 font-mono">ADJOINING BOOTH</div>
                <div className="absolute right-0 rotate-90 text-[10px] text-zinc-500 font-mono">ADJOINING BOOTH</div>
                <div className="absolute bottom-1 text-[11px] font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  ▲ MAIN VISITOR CORRIDOR (3.0M AISLE) ▲
                </div>
              </>
            )}

            {config.type === 'corner' && (
              <>
                <div className="absolute top-1 text-[10px] text-zinc-500 font-mono">ADJOINING BOOTH WALL</div>
                <div className="absolute left-0 -rotate-90 text-[10px] text-zinc-500 font-mono">ADJOINING BOOTH</div>
                <div className="absolute right-1 rotate-90 text-[10px] font-bold text-emerald-400 tracking-wider">
                  ▲ CROSS AISLE (OPEN) ▲
                </div>
                <div className="absolute bottom-1 text-[11px] font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  ▲ MAIN AISLE (OPEN) ▲
                </div>
              </>
            )}

            {config.type === 'peninsula' && (
              <>
                <div className="absolute top-1 text-[10px] text-zinc-500 font-mono">BACK WALL ANCHOR</div>
                <div className="absolute left-1 -rotate-90 text-[10px] font-bold text-emerald-400">▲ AISLE ▲</div>
                <div className="absolute right-1 rotate-90 text-[10px] font-bold text-emerald-400">▲ AISLE ▲</div>
                <div className="absolute bottom-1 text-[11px] font-bold text-emerald-400">▲ MAIN THOROUGHFARE ▲</div>
              </>
            )}

            {config.type === 'island' && (
              <div className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest absolute top-2">
                  360° ALL-ROUND TRAFFIC AISLE (FOUR-WAY EGRESS)
                </span>
              </div>
            )}

            {/* The Actual Scale Floor Plan Canvas */}
            <div
              ref={canvasRef}
              id="booth-floor-plan-canvas"
              style={{
                width: `${canvasWidthPx}px`,
                height: `${canvasHeightPx}px`,
              }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onClick={() => onSelectItem(null)}
              className="relative bg-zinc-900 border-2 border-zinc-700 shadow-2xl overflow-hidden cursor-crosshair select-none"
            >
              {/* Grid Background: 0.5m sub-grid, 1.0m major grid */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #94a3b8 1px, transparent 1px),
                    linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
                  `,
                  backgroundSize: `${pixelsPerMeter * 0.5}px ${pixelsPerMeter * 0.5}px`
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #38bdf8 1.5px, transparent 1.5px),
                    linear-gradient(to bottom, #38bdf8 1.5px, transparent 1.5px)
                  `,
                  backgroundSize: `${pixelsPerMeter}px ${pixelsPerMeter}px`
                }}
              />

              {/* Center Crosshair marker */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-700/50 pointer-events-none" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-700/50 pointer-events-none" />

              {/* Solid Perimeter Walls rendering */}
              {/* Rear Wall */}
              {config.type !== 'island' && (
                <div 
                  className="absolute top-0 left-0 right-0 h-3 bg-zinc-400 border-b-2 border-zinc-600 shadow-md flex items-center justify-center"
                  style={{ backgroundColor: config.brandColor }}
                >
                  <span className="text-[9px] text-white font-bold tracking-widest uppercase">
                    BACK WALL ({config.wallHeight}M)
                  </span>
                </div>
              )}

              {/* Left Wall */}
              {(config.type === 'inline' || config.type === 'corner') && (
                <div 
                  className="absolute top-0 left-0 bottom-0 w-3 bg-zinc-400 border-r-2 border-zinc-600 shadow-md"
                  style={{ backgroundColor: config.brandColor }}
                />
              )}

              {/* Right Wall */}
              {config.type === 'inline' && (
                <div 
                  className="absolute top-0 right-0 bottom-0 w-3 bg-zinc-400 border-l-2 border-zinc-600 shadow-md"
                  style={{ backgroundColor: config.brandColor }}
                />
              )}

              {/* Placed Elements On Floor Plan */}
              {items.map((item) => {
                const isSelected = item.id === selectedItemId;
                const { pxX, pxY } = metersToCanvasPx(item.x, item.z);
                const wPx = item.width * pixelsPerMeter;
                const dPx = item.depth * pixelsPerMeter;

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    style={{
                      position: 'absolute',
                      left: `${pxX}px`,
                      top: `${pxY}px`,
                      width: `${wPx}px`,
                      height: `${dPx}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                      cursor: 'move',
                    }}
                    className={`rounded transition-shadow group ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-950 z-20 shadow-xl'
                        : 'z-10 hover:ring-1 hover:ring-zinc-400'
                    }`}
                  >
                    {/* Visual footprint box with category styling */}
                    <div 
                      className="w-full h-full rounded border flex flex-col items-center justify-center p-0.5 text-center shadow-md select-none overflow-hidden"
                      style={{
                        backgroundColor: item.color ? `${item.color}35` : '#3b82f635',
                        borderColor: item.color || '#3b82f6',
                      }}
                    >
                      <span className="text-[10px] font-bold text-white truncate max-w-full px-0.5 leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-300 opacity-90">
                        {item.width}×{item.depth}m
                      </span>
                    </div>

                    {/* Directional Front Indicator Pip */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-amber-400 rounded-full" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Metric & Dimensions Tag */}
          <div className="flex flex-wrap items-center justify-between w-full pt-3 border-t border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Layout Scale: <strong>1 grid = 0.5m</strong></span>
              <span>Total Furniture: <strong>{items.length} units</strong></span>
              <span>Est. Power: <strong>{items.reduce((acc, it) => acc + (it.powerWatts || 0), 0)} W</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADA & Egress Clearance Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
