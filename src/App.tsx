import React, { useState, useRef } from 'react';
import { 
  Building2, Layers, Box, Sparkles, Share2, Download, 
  RotateCw, RefreshCw, FileText, CheckCircle2, Sliders,
  HelpCircle, ArrowDown, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { HeroLanding } from './components/HeroLanding';
import { BoothSizeSelector } from './components/BoothSizeSelector';
import { FloorPlanEditor } from './components/FloorPlanEditor';
import { ThreeDPreview } from './components/ThreeDPreview';
import { LayoutOutlineSummary } from './components/LayoutOutlineSummary';
import { ClientReviewRoomModal } from './components/ClientReviewRoomModal';
import { LandingFeatures } from './components/LandingFeatures';
import { Footer } from './components/Footer';
import { 
  BoothConfig, PlacedBoothItem, ClientFeedback, 
  BoothSizePreset, INITIAL_BOOTH_CONFIG, BOOTH_PRESETS, 
  INITIAL_FEEDBACK, BoothType 
} from './types';

export default function App() {
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Booth Configuration
  const [config, setConfig] = useState<BoothConfig>(INITIAL_BOOTH_CONFIG);

  // Initial placed items based on default corner-6x3 preset
  const [items, setItems] = useState<PlacedBoothItem[]>(() => {
    const defaultPreset = BOOTH_PRESETS.find((p) => p.id === 'corner-6x3') || BOOTH_PRESETS[0];
    return defaultPreset.defaultItems.map((item, idx) => ({
      ...item,
      id: `initial-item-${idx}-${Date.now()}`,
    }));
  });

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<ClientFeedback[]>(INITIAL_FEEDBACK);
  const [isClientReviewOpen, setIsClientReviewOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | '3d-only' | 'plan-only'>('split');

  // Scroll to workspace action
  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Select Preset Handler
  const handleSelectPreset = (preset: BoothSizePreset) => {
    setConfig({
      ...config,
      name: `${preset.name} Exhibition Setup`,
      type: preset.type,
      width: preset.width,
      depth: preset.depth,
    });

    // Populate with preset curated items
    const newItems: PlacedBoothItem[] = preset.defaultItems.map((item, idx) => ({
      ...item,
      id: `preset-item-${idx}-${Date.now()}`,
    }));
    setItems(newItems);
    setSelectedItemId(null);
  };

  // Custom Dimensions Update
  const handleApplyCustomDimensions = (width: number, depth: number, type: BoothType) => {
    // Keep items within boundaries
    const halfW = width / 2;
    const halfD = depth / 2;
    const clampedItems = items.map((it) => ({
      ...it,
      x: Math.max(-halfW + it.width / 2, Math.min(halfW - it.width / 2, it.x)),
      z: Math.max(-halfD + it.depth / 2, Math.min(halfD - it.depth / 2, it.z)),
    }));
    setItems(clampedItems);
  };

  // Add Client Feedback
  const handleAddFeedback = (text: string, author: string, role: any, targetItem?: string) => {
    const newFeedback: ClientFeedback = {
      id: `fb-${Date.now()}`,
      author,
      role: role || 'Client',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      time: 'Just now',
      message: text,
      status: 'pending',
      targetItemName: targetItem,
    };
    setFeedbacks([newFeedback, ...feedbacks]);
  };

  // Approve Layout
  const handleApproveLayout = () => {
    setIsApproved(true);
    const approvedFeedback: ClientFeedback = {
      id: `fb-${Date.now()}`,
      author: 'Client Verification',
      role: 'Client',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      time: 'Just now',
      message: '✅ Booth layout and technical outline officially approved for stand construction.',
      status: 'approved',
    };
    setFeedbacks([approvedFeedback, ...feedbacks]);
  };

  // Reset to clean booth
  const handleClearLayout = () => {
    if (window.confirm('Clear all placed fixtures and start with empty floor plan?')) {
      setItems([]);
      setSelectedItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onOpenClientReviewModal={() => setIsClientReviewOpen(true)}
        onScrollToWorkspace={scrollToWorkspace}
        isApproved={isApproved}
      />

      {/* Hero Section */}
      <HeroLanding
        onStartQuickTask={scrollToWorkspace}
        onOpenClientReviewModal={() => setIsClientReviewOpen(true)}
      />

      {/* Main Interactive Quick Task Design Workspace */}
      <main 
        ref={workspaceRef} 
        id="quick-task-workspace"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Workspace Headline & Status Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ES Dzign Research: Exhibition Booth Studio
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select booth size, drag-and-drop floor plan fixtures, and stream real-time 3D previews to clients.
            </p>
          </div>

          {/* View Mode Splitter */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Split View (2D + 3D)
              </button>
              <button
                onClick={() => setViewMode('3d-only')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === '3d-only' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3D Preview Only
              </button>
              <button
                onClick={() => setViewMode('plan-only')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'plan-only' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Floor Plan Only
              </button>
            </div>

            <button
              onClick={handleClearLayout}
              title="Reset layout items"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: Booth Size & Geometry Selection */}
        <BoothSizeSelector
          currentConfig={config}
          onSelectPreset={handleSelectPreset}
          onUpdateConfig={setConfig}
          onApplyCustomDimensions={handleApplyCustomDimensions}
        />

        {/* Step 2 & 3: 2D Drag-and-Drop Floor Plan & Real-Time 3D Preview */}
        <div className="space-y-6">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* 2D Floor Plan Editor (6 cols on XL) */}
              <div className="xl:col-span-6">
                <FloorPlanEditor
                  config={config}
                  items={items}
                  selectedItemId={selectedItemId}
                  onSelectItem={setSelectedItemId}
                  onUpdateItems={setItems}
                />
              </div>

              {/* 3D Real-Time Preview (6 cols on XL) */}
              <div className="xl:col-span-6 sticky top-20">
                <ThreeDPreview
                  config={config}
                  items={items}
                  selectedItemId={selectedItemId}
                  onSelectItem={setSelectedItemId}
                  feedbacks={feedbacks}
                  onAddFeedback={handleAddFeedback}
                />
              </div>
            </div>
          )}

          {viewMode === '3d-only' && (
            <div className="w-full">
              <ThreeDPreview
                config={config}
                items={items}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                className="h-[680px]"
              />
            </div>
          )}

          {viewMode === 'plan-only' && (
            <div className="w-full">
              <FloorPlanEditor
                config={config}
                items={items}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                onUpdateItems={setItems}
              />
            </div>
          )}
        </div>

        {/* Step 4: Outline Layout Floor Plan Summary & Technical BOM */}
        <LayoutOutlineSummary
          config={config}
          items={items}
          onOpenClientReviewModal={() => setIsClientReviewOpen(true)}
        />
      </main>

      {/* Product Features & Agency Workflow Showcase */}
      <LandingFeatures />

      {/* Footer */}
      <Footer />

      {/* Client Review Room Modal */}
      <ClientReviewRoomModal
        isOpen={isClientReviewOpen}
        onClose={() => setIsClientReviewOpen(false)}
        config={config}
        items={items}
        feedbacks={feedbacks}
        onAddFeedback={handleAddFeedback}
        onApproveLayout={handleApproveLayout}
        isApproved={isApproved}
      />
    </div>
  );
}
