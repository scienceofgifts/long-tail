import React, { useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  Palette,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import {
  buildDeterministicBrief,
  OpportunityRow,
  ProductBrief,
} from '../shared/radarEngine';

interface ProductBriefModalProps {
  opportunity: OpportunityRow | null;
  brief: ProductBrief | null;
  isGenerating: boolean;
  onClose: () => void;
  onRegenerateWithAi: (opp: OpportunityRow) => void;
}

export const ProductBriefModal: React.FC<ProductBriefModalProps> = ({
  opportunity,
  brief,
  isGenerating,
  onClose,
  onRegenerateWithAi,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!opportunity) return null;

  const activeBrief = brief || buildDeterministicBrief(opportunity);

  const copyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fullFourthwallCopy = `${activeBrief.fourthwallTitle}\nSlug: /products/${activeBrief.urlSlug}\n\n${activeBrief.layer1LoreHook}\n\n${activeBrief.layer2VisualBreakdown}\n\n• ${activeBrief.layer3Bullets[0]}\n• ${activeBrief.layer3Bullets[1]}\n• ${activeBrief.layer3Bullets[2]}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-lg shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
              <span>Instant Fourthwall Brief</span>
              <span aria-hidden="true">·</span>
              <span>Query: &ldquo;{opportunity.query}&rdquo;</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Intent {opportunity.buyerIntentScore}/100</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-editorial font-semibold text-slate-100">
              {activeBrief.fourthwallTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onRegenerateWithAi(opportunity)}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing via Gemini...' : 'Refresh Brief via Gemini'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[78vh] overflow-y-auto">
          {/* Left Column (7 cols): SEO Title, URL Slug & 3-Layer Copy */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & URL Slug */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Optimized Fourthwall Title &amp; URL Slug
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'title',
                      `${activeBrief.fourthwallTitle}\n/products/${activeBrief.urlSlug}`
                    )
                  }
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'title' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Title &amp; Slug
                    </>
                  )}
                </button>
              </div>
              <div className="text-base font-semibold text-slate-100">
                {activeBrief.fourthwallTitle}
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800/80 truncate">
                /products/{activeBrief.urlSlug}
              </div>
            </div>

            {/* 3-Layer Product Description */}
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-lg font-editorial font-semibold text-slate-100">
                    3-Layer Conversion Description
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => copyText('fullCopy', fullFourthwallCopy)}
                  className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === 'fullCopy' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied All 3 Layers
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Complete Listing
                    </>
                  )}
                </button>
              </div>

              {/* Layer 1: 2-Sentence Bold Lore Hook */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  Layer 01 · 2-Sentence Insider Lore Hook
                </div>
                <p className="text-sm font-semibold text-slate-100 leading-relaxed bg-slate-950/80 p-3.5 rounded border border-slate-800/80">
                  {activeBrief.layer1LoreHook}
                </p>
              </div>

              {/* Layer 2: Insider Visual Breakdown */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  Layer 02 · Archival Visual &amp; Plate Breakdown
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded border border-slate-800/80">
                  {activeBrief.layer2VisualBreakdown}
                </p>
              </div>

              {/* Layer 3: 3 Scannable Gift/Quality Bullets */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                  Layer 03 · 3 Scannable Gift &amp; Blank Spec Bullets
                </div>
                <ul className="space-y-2 bg-slate-950/80 p-3.5 rounded border border-slate-800/80 text-xs text-slate-200">
                  {activeBrief.layer3Bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="font-mono text-amber-400 font-bold">0{i + 1}.</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): #000000 Copperplate Etching Prompt + Specimen Preview */}
          <div className="lg:col-span-5 space-y-5">
            {/* Solid #000000 Archival Plate Specimen Preview */}
            <div className="p-5 bg-black border border-slate-800 rounded-md flex flex-col items-center text-center space-y-3">
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-400/80 uppercase tracking-widest border-b border-slate-900 pb-2">
                <span>FIG. I · ARCHIVAL PLATE</span>
                <span>BG: #000000 SOLID</span>
              </div>

              {/* Vector Copperplate Emblem Preview */}
              <div className="py-4 px-3 border border-amber-500/30 rounded-xs w-full bg-black flex flex-col items-center justify-center space-y-2">
                <svg
                  viewBox="0 0 220 120"
                  className="w-44 h-24 text-amber-300/90"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="6"
                    y="6"
                    width="208"
                    height="108"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <rect x="12" y="12" width="196" height="96" strokeWidth="1.2" />
                  <circle cx="110" cy="54" r="28" strokeWidth="1.2" />
                  <circle cx="110" cy="54" r="22" strokeWidth="0.75" strokeDasharray="2 2" />
                  <path d="M88 54 H132 M110 32 V76" strokeWidth="0.9" />
                  <path d="M70 92 H150" strokeWidth="1" />
                </svg>
                <div className="font-editorial text-sm tracking-widest uppercase text-[#F5F0E6] font-semibold px-2">
                  {opportunity.parentEntity}
                </div>
                <div className="font-mono text-[10px] text-amber-400/90 uppercase tracking-widest">
                  {activeBrief.designAngle} · {activeBrief.recommendedBlank}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Zero muddy gradients · Isolated 2D copperplate linework
              </div>
            </div>

            {/* Layout-Engineered Image Generation Prompt */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-300">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>#000000 Copperplate Etching Prompt</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText('prompt', activeBrief.imagePrompt)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'prompt' ? (
                    <>
                      <Check className="w-3 h-3" /> Copied Prompt
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-black border border-slate-800 rounded font-mono text-xs text-slate-200 leading-relaxed select-all">
                {activeBrief.imagePrompt}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span className="inline-flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Angle: <strong className="text-slate-200">{activeBrief.designAngle}</strong>
                </span>
                <span>
                  Blank: <strong className="text-slate-200">{activeBrief.recommendedBlank}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Science of Gifts · Fourthwall Merchandising Specification
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
};
