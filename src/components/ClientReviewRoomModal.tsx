import React, { useState } from 'react';
import { 
  X, CheckCircle, Copy, Check, MessageSquare, Send, 
  ExternalLink, Sparkles, User, Clock, ArrowRight, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ESDzignLogo } from './ESDzignLogo';
import { BoothConfig, ClientFeedback, PlacedBoothItem } from '../types';

interface ClientReviewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BoothConfig;
  items: PlacedBoothItem[];
  feedbacks: ClientFeedback[];
  onAddFeedback: (text: string, author: string, role: any, targetItem?: string) => void;
  onApproveLayout: () => void;
  isApproved: boolean;
}

export const ClientReviewRoomModal: React.FC<ClientReviewRoomModalProps> = ({
  isOpen,
  onClose,
  config,
  items,
  feedbacks,
  onAddFeedback,
  onApproveLayout,
  isApproved,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [clientName, setClientName] = useState('Sarah Jenkins (Exhibitor Lead)');
  const [selectedTarget, setSelectedTarget] = useState('Entire Booth Concept');

  if (!isOpen) return null;

  const simulatedShareUrl = `https://esdzign.studio/review/${config.id}?token=es_review_${Math.random().toString(36).substring(2, 8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(simulatedShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddFeedback(commentText.trim(), clientName, 'Client', selectedTarget);
    setCommentText('');
  };

  const handleApprove = () => {
    onApproveLayout();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <ESDzignLogo size="sm" variant="badge-only" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Client Real-Time 3D Review Room
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                  ES Dzign Research
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Share this secure live link with your client for real-time 3D inspection and approval.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Strip */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 w-full bg-zinc-900 border border-zinc-700/60 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 truncate">
            {simulatedShareUrl}
          </div>
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copied to Clipboard' : 'Copy Client Link'}</span>
          </button>
        </div>

        {/* Modal Body: Approval Status + Feedback Thread */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Approval Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isApproved 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
              : 'bg-zinc-950 border-zinc-800 text-zinc-300'
          }`}>
            <div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle className={`w-5 h-5 ${isApproved ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{isApproved ? 'Layout Officially Approved by Client!' : 'Awaiting Client Sign-Off'}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isApproved 
                  ? 'All booth parameters, clearance lines, and equipment load have been approved for build.'
                  : 'Client can approve directly from this link to greenlight CAD production.'}
              </p>
            </div>

            <button
              onClick={handleApprove}
              disabled={isApproved}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shrink-0 ${
                isApproved 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isApproved ? '✓ Sign-Off Complete' : 'Sign-Off & Approve Layout'}
            </button>
          </div>

          {/* Feedback Notes Thread */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Live Client Feedback Stream
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">{feedbacks.length} notes recorded</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <img src={fb.avatar} alt={fb.author} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-semibold text-zinc-200">{fb.author}</span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded font-mono">
                        {fb.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{fb.time}</span>
                  </div>
                  {fb.targetItemName && (
                    <div className="text-[10px] text-zinc-400 mb-1">
                      Target: <span className="text-emerald-400 font-semibold">{fb.targetItemName}</span>
                    </div>
                  )}
                  <p className="text-zinc-300 leading-relaxed text-xs">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave a Client Note */}
          <form onSubmit={handleSendComment} className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium text-zinc-300">Add Real-Time Revision Note</span>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="Entire Booth Concept">Entire Booth Concept</option>
                {items.map((it) => (
                  <option key={it.id} value={it.name}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. Can we change the LED wall background graphic to our 2026 hero visual?"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Close Room
          </button>
        </div>
      </div>
    </div>
  );
};
