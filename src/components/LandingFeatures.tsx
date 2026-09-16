import React from 'react';
import { 
  Check, X, Zap, Shield, Sparkles, Sliders, Box, Layers, 
  HelpCircle, ChevronRight, MessageSquare, ArrowUpRight
} from 'lucide-react';

export const LandingFeatures: React.FC = () => {
  return (
    <div className="py-16 border-t border-zinc-800/80 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
            Accelerated Agency Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            Built for Exhibition Designers, Stand Contractors & Marketing Teams
          </h2>
          <p className="text-zinc-400 text-sm mt-3">
            Say goodbye to slow 48-hour 3D rendering queues. Pitch concepts, iterate on the fly, and close booth layout approvals in minutes.
          </p>
        </div>

        {/* 3-Step Interactive Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 font-mono font-bold text-sm flex items-center justify-center mb-4">
                01
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                Configure Booth Geometry
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select from industry-standard shell schemes (3×3m, 6×3m, 8×6m) or define custom widths, depths, and wall heights down to 10cm. Specify wall finishes, brand colors, and flooring styles.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-indigo-400 font-medium flex items-center gap-1">
              <span>Inline · Corner · Peninsula · Island</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center mb-4">
                02
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                Drag & Drop Outline Layout
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Place reception desks, LED video displays, lounge suites, and architectural truss structures onto the 2D floor plan. Real-time ADA clearance verification ensures compliance with exhibition hall fire regulations.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span>Real-Time Power & Circuit Calculator</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 font-mono font-bold text-sm flex items-center justify-center mb-4">
                03
              </span>
              <h3 className="text-base font-bold text-white mb-2">
                Stream 3D Client Reviews
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate a live WebGL 3D preview link with realistic reflections, shadows, and eye-level walkthrough mode. Clients inspect the booth on any phone or desktop and pin revision notes directly.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/80 text-[11px] text-sky-400 font-medium flex items-center gap-1">
              <span>Instant Digital Sign-Off & Export</span>
            </div>
          </div>
        </div>

        {/* Traditional CAD vs ES Dzign Research Comparison Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-16 shadow-xl overflow-hidden">
          <h3 className="text-base font-bold text-white mb-4 text-center">
            How ES Dzign Research Compares to Legacy Exhibition Workflow
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Feature / Metric</th>
                  <th className="py-3 px-4 text-zinc-400">Traditional 3ds Max / CAD</th>
                  <th className="py-3 px-4 text-indigo-400 font-bold bg-indigo-950/20">ES Dzign Research Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">First Pitch Turnaround</td>
                  <td className="py-3 px-4 text-zinc-400">2 to 4 business days</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">Under 5 minutes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Client Review Experience</td>
                  <td className="py-3 px-4 text-zinc-400">Static 2D PDF email attachments</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">Interactive 3D Walk-through Link</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Real-Time Layout Synchronization</td>
                  <td className="py-3 px-4 text-rose-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Re-render required
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">
                    Instant 60 FPS 2D-to-3D Sync
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Electrical & BOM Calculation</td>
                  <td className="py-3 px-4 text-zinc-400">Manual spreadsheet count</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 bg-indigo-950/20">Automated Live Bill of Materials</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {[
              {
                q: 'Can clients open the 3D walkthrough without installing software?',
                a: 'Yes! The 3D preview runs directly in standard mobile and desktop web browsers using lightweight WebGL with no downloads or plugins needed.'
              },
              {
                q: 'What booth types and wall orientations are supported?',
                a: 'We support all standard exhibition geometries: Inline (standard 3-wall shell scheme), Corner (2 walls with dual aisle opening), Peninsula (1 back wall anchor with 3 open corridors), and Island (360° open plaza with overhead truss).'
              },
              {
                q: 'Can I export the floor plan outline for venue organizer approval?',
                a: 'Yes, you can export vector SVG and CAD-compatible outline drawings along with electrical load calculations for hall fire and safety submission.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2 mb-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-zinc-400 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
