import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  GkpParsedRow,
  OpportunityRow,
  SubEntity,
} from '../shared/radarEngine';

interface GkpSidebarDrawerProps {
  isOpen: boolean;
  initialTab?: 'batches' | 'matcher';
  onClose: () => void;
  entities: SubEntity[];
  opportunities: OpportunityRow[];
  onApplyGkpMatches: (parsedRows: GkpParsedRow[]) => void;
}

export const GkpSidebarDrawer: React.FC<GkpSidebarDrawerProps> = ({
  isOpen,
  initialTab = 'batches',
  onClose,
  entities,
  opportunities,
  onApplyGkpMatches,
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'matcher'>(initialTab);
  const [copiedBatchIdx, setCopiedBatchIdx] = useState<number | null>(null);
  const [csvInput, setCsvInput] = useState<string>('');
  const [parsedMatches, setParsedMatches] = useState<GkpParsedRow[]>([]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Build ready-to-copy batches of 10 comma-separated seed keywords
  const seedBatches = useMemo(() => {
    const rawSeeds: string[] = [];
    const seen = new Set<string>();

    // Prioritize top opportunity queries first, then selected entity seeds
    opportunities.forEach((opp) => {
      const clean = opp.query.toLowerCase().trim();
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        rawSeeds.push(clean);
      }
    });

    entities.forEach((ent) => {
      const seedGift = `${ent.searchSeed} gift`.toLowerCase().trim();
      const seedMug = `${ent.searchSeed} mug`.toLowerCase().trim();
      if (!seen.has(seedGift)) {
        seen.add(seedGift);
        rawSeeds.push(seedGift);
      }
      if (!seen.has(seedMug)) {
        seen.add(seedMug);
        rawSeeds.push(seedMug);
      }
    });

    const batches: string[][] = [];
    for (let i = 0; i < rawSeeds.length; i += 10) {
      batches.push(rawSeeds.slice(i, i + 10));
    }
    return batches.slice(0, 6);
  }, [entities, opportunities]);

  const handleCopyBatch = (batch: string[], idx: number) => {
    const text = batch.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedBatchIdx(idx);
    setTimeout(() => setCopiedBatchIdx(null), 2000);
  };

  const handleParseAndSync = (rawText: string) => {
    setCsvInput(rawText);
    const rows = parseGkpCsvText(rawText);
    setParsedMatches(rows);
    if (rows.length > 0) {
      onApplyGkpMatches(rows);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      handleParseAndSync(content);
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Google Keyword Planner Bridge
            </div>
            <h2 className="text-2xl font-editorial font-semibold text-slate-100 mt-0.5">
              10-Seed Batch Exporter &amp; CSV Volume Matcher
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800/80 bg-slate-900/30 flex items-center gap-2 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            10-Seed Copy Batches ({seedBatches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matcher')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'matcher'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Upload / Paste Volume Matcher
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'batches' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Keyword Planner strictly limits discovery inputs to{' '}
                <span className="text-slate-200 font-semibold">10 comma-separated seeds</span> per
                run. Copy each pre-clustered batch below, paste into Google Keyword Planner, and
                upload the resulting CSV export in the Volume Matcher tab.
              </p>

              <div className="space-y-3">
                {seedBatches.map((batch, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/70 border border-slate-800 rounded-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-amber-300 font-semibold">
                        Batch #{idx + 1} · {batch.length} High-Intent Seeds
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyBatch(batch, idx)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {copiedBatchIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied Batch #{idx + 1}!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Batch #{idx + 1} ({batch.length} Seeds)
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800/90 rounded font-mono text-xs text-slate-200 leading-relaxed select-all">
                      {batch.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Upload or paste your real Google Keyword Planner CSV export. Only real CSV rows
                  populate the <span className="text-slate-200 font-mono">Monthly Searches</span>,{' '}
                  <span className="text-slate-200 font-mono">3-Month Trend</span>, and{' '}
                  <span className="text-slate-200 font-mono">Competition Index</span> columns.
                </p>

                <label className="px-3.5 py-2 text-xs font-medium text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload GKP .CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-400">
                    Paste Google Keyword Planner CSV Export
                  </label>
                  {csvInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCsvInput('');
                        setParsedMatches([]);
                      }}
                      className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Clear CSV
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => handleParseAndSync(e.target.value)}
                  placeholder={`Keyword,Currency,Avg. monthly searches,Three month change,YoY change,Competition,Competition (indexed value)\ncarthago delenda est mug,USD,1900,+900%,+900%,Low,28`}
                  className="w-full p-3 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Parsed Winner Breakdown Table */}
              {parsedMatches.length === 0 ? (
                <div className="p-8 border border-slate-800/80 rounded-md bg-slate-900/30 text-center space-y-2">
                  <div className="text-sm font-editorial text-slate-200">
                    No Google Keyword Planner CSV Uploaded Yet
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Copy a 10-seed batch from Tab 1, run it in Google Keyword Planner, and upload or
                    paste your exported CSV here to populate real search volumes, 3-month trends,
                    and competition indices.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-900/40">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                      Parsed GKP Rows ({parsedMatches.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyGkpMatches(parsedMatches)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Sync Volumes to Main Table
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/60">
                          <th className="py-2.5 px-3">Keyword</th>
                          <th className="py-2.5 px-3 text-right">Monthly Searches</th>
                          <th className="py-2.5 px-3 text-right">3-Month Trend</th>
                          <th className="py-2.5 px-3 text-right">YoY Change</th>
                          <th className="py-2.5 px-3 text-right">Comp. Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                        {parsedMatches.map((row, i) => {
                          const isGrandWinner = row.isSurging && row.isLowCompWinner;
                          return (
                            <tr
                              key={i}
                              className={
                                isGrandWinner ? 'bg-emerald-950/30' : 'hover:bg-slate-900/60'
                              }
                            >
                              <td className="py-2.5 px-3 text-slate-100 font-medium">
                                {row.keyword}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-200">
                                {row.monthlySearches}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-semibold ${
                                  row.threeMonthChange.includes('900') ||
                                  row.threeMonthChange.includes('∞')
                                    ? 'text-emerald-400'
                                    : 'text-slate-300'
                                }`}
                              >
                                {row.threeMonthChange}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-semibold ${
                                  row.isSurging ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                {row.yoyChange}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right ${
                                  row.isLowCompWinner ? 'text-amber-300' : 'text-slate-400'
                                }`}
                              >
                                {row.competitionIndex} ({row.competition})
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Thresholds: Surging (+900% / ∞) · Low-to-Med Competition (Index &lt; 70)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export function parseGkpCsvText(raw: string): GkpParsedRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: GkpParsedRow[] = [];

  for (const line of lines) {
    const cols = line.split(/,|\t/).map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;
    const firstLower = cols[0].toLowerCase();
    if (
      firstLower === 'keyword' ||
      firstLower.includes('keyword status') ||
      firstLower.includes('plan historical') ||
      firstLower.includes('allelaide')
    ) {
      continue;
    }

    const keyword = cols[0];
    const monthlySearches = cols[2] || '—';
    const threeMonthChange = cols[3] || '—';
    const yoyChange = cols[4] || '—';
    const competition = cols[5] || '—';
    const compIdxNum = parseInt(cols[6] || '', 10);
    const competitionIndex = Number.isNaN(compIdxNum) ? 0 : compIdxNum;

    const isSurging =
      threeMonthChange.includes('900') ||
      threeMonthChange.includes('∞') ||
      yoyChange.includes('900') ||
      yoyChange.includes('∞') ||
      yoyChange.toLowerCase().includes('inf');
    const isLowCompWinner = !Number.isNaN(compIdxNum) && compIdxNum < 70;

    results.push({
      keyword,
      monthlySearches,
      threeMonthChange,
      yoyChange,
      competition,
      competitionIndex,
      isSurging,
      isLowCompWinner,
    });
  }

  return results;
}
