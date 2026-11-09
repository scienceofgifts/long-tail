import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  FileText,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  CATEGORY_ORDER,
  OpportunityRow,
  RecommendedBlank,
} from '../shared/radarEngine';

interface OpportunityTableProps {
  opportunities: OpportunityRow[];
  isLoading: boolean;
  probedStats: { totalProbed: number; liveCount: number } | null;
  onSelectOpportunity: (row: OpportunityRow) => void;
  onOpenGkpDrawer: () => void;
  onOpenGkpMatcherTab: () => void;
}

const ALL_RECOMMENDED_BLANKS: RecommendedBlank[] = [
  'Mug',
  'Rocks/Pint Glass',
  'Heavyweight Hoodie/Tee',
  'Desk Mat',
  'Museum Poster',
  'Hardcover Journal',
  'Tote Bag',
];

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  isLoading,
  probedStats,
  onSelectOpportunity,
  onOpenGkpDrawer,
  onOpenGkpMatcherTab,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [blankFilter, setBlankFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [onlyLiveVerified, setOnlyLiveVerified] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const filteredRows = useMemo(() => {
    return opportunities
      .filter((row) => {
        if (blankFilter !== 'ALL' && row.recommendedBlank !== blankFilter) {
          return false;
        }
        if (categoryFilter !== 'ALL' && row.category !== categoryFilter) {
          return false;
        }
        if (onlyLiveVerified && row.autocompleteSource !== 'live_google') {
          return false;
        }
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          return (
            row.query.toLowerCase().includes(q) ||
            row.parentEntity.toLowerCase().includes(q) ||
            row.suggestedSeoTitle.toLowerCase().includes(q) ||
            row.designAngle.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) =>
        sortDesc
          ? b.buyerIntentScore - a.buyerIntentScore
          : a.buyerIntentScore - b.buyerIntentScore
      );
  }, [opportunities, blankFilter, categoryFilter, onlyLiveVerified, searchFilter, sortDesc]);

  return (
    <section
      id="opportunity-table"
      className="border border-slate-800/90 bg-slate-900/40 rounded-lg p-6 space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400/90 tracking-wider uppercase">
            <span>Steps 02 &amp; 03</span>
            <span aria-hidden="true">·</span>
            <span>Live Autocomplete Verification &amp; Buyer Intent Scoring</span>
            {probedStats && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-emerald-400">
                  {probedStats.liveCount} Live Google Suggestions Captured ({probedStats.totalProbed} Seeds Probed)
                </span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-semibold text-slate-100 tracking-tight">
            Long-Tail Gift Opportunity Ledger
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Zero AI-hallucinated search volumes. Queries verified directly from{' '}
            <code className="text-amber-300 font-mono text-xs">suggestqueries.google.com</code> show
            their exact dropdown position (<code className="text-emerald-300 font-mono text-xs">#1 – #10</code>).
            Exact monthly search volumes populate strictly when matched against your Google Keyword
            Planner CSV export.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenGkpDrawer}
            className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            GKP Seed Batches &amp; CSV Matcher
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by query, entity, or SEO hook..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={blankFilter}
            onChange={(e) => setBlankFilter(e.target.value)}
            aria-label="Filter by Recommended Blank"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All Blank Types ({opportunities.length})</option>
            {ALL_RECOMMENDED_BLANKS.map((blank) => (
              <option key={blank} value={blank}>
                {blank}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by Entity Category"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-500/70"
          >
            <option value="ALL">All 5 Taxonomic Buckets</option>
            {CATEGORY_ORDER.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOnlyLiveVerified((prev) => !prev)}
            className={`w-full px-3 py-2 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyLiveVerified
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {onlyLiveVerified ? '🟢 Live Google Only' : 'All Sources'}
          </button>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto border border-slate-800/90 rounded-md bg-slate-950/70">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/70">
              <th className="py-3 px-4">Discovered Long-Tail Query &amp; Autocomplete Rank</th>
              <th className="py-3 px-4">Parent Entity / Sub-Niche</th>
              <th className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => setSortDesc((prev) => !prev)}
                  className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <span>Buyer Intent</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">Monthly Searches</th>
              <th className="py-3 px-4 text-right">3-Month Trend</th>
              <th className="py-3 px-4 text-right">Competition Index</th>
              <th className="py-3 px-4">Recommended Blank</th>
              <th className="py-3 px-4">Suggested SEO Product Title</th>
              <th className="py-3 px-4 text-right">Brief &amp; Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-800 rounded w-48" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-800 rounded w-36" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-5 bg-slate-800 rounded w-16 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-800 rounded w-28 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-800 rounded w-28 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-800 rounded w-28 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-800 rounded w-24" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-800 rounded w-56" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-7 bg-slate-800 rounded w-40 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 px-6 text-center text-slate-400">
                  <p className="text-base font-editorial text-slate-200 mb-1">
                    No long-tail queries match the current filter criteria.
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Try resetting the filter or clicking &ldquo;2. Mine Live Google Autocomplete &amp; Score Long-Tail Demand&rdquo; above.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilter('');
                      setBlankFilter('ALL');
                      setCategoryFilter('ALL');
                      setOnlyLiveVerified(false);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    Reset Table Filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isHighEmerald = row.buyerIntentScore >= 85;
                const isLiveGoogle =
                  row.autocompleteSource === 'live_google' &&
                  typeof row.autocompleteRank === 'number';

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectOpportunity(row)}
                    className="hover:bg-slate-900/90 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Exact Long-Tail Query + Google Autocomplete Rank Badge */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-mono text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                        &ldquo;{row.query}&rdquo;
                      </div>
                      <div className="mt-1.5">
                        {isLiveGoogle ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 tabular-nums">
                            <span>
                              🟢 Live Google Autocomplete (#{row.autocompleteRank})
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-700/80">
                            <span>⚪ Unverified (Check in GKP)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 2: Parent Entity / Sub-Niche */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="text-xs font-medium text-slate-200">
                        {row.parentEntity}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {row.category} · {row.designAngle}
                      </div>
                    </td>

                    {/* Column 3: Buyer Intent Score (85-100 Emerald, 70-84 Amber) */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold tabular-nums border whitespace-nowrap ${
                          isHighEmerald
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <span>{row.buyerIntentScore}/100</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[10px] uppercase">
                          {isHighEmerald ? 'Prime' : 'Strong'}
                        </span>
                      </span>
                    </td>

                    {/* Column 4: Monthly Searches (ONLY populated after GKP CSV upload) */}
                    <td
                      className="py-3.5 px-4 align-middle text-right font-mono text-xs tabular-nums"
                      onClick={(e) => {
                        if (!row.monthlyVolume) {
                          e.stopPropagation();
                          onOpenGkpMatcherTab();
                        }
                      }}
                    >
                      {row.monthlyVolume ? (
                        <span className="text-slate-100 font-semibold">
                          {row.monthlyVolume}
                        </span>
                      ) : (
                        <span className="text-slate-500 hover:text-amber-300 transition-colors whitespace-nowrap">
                          — (Upload GKP CSV)
                        </span>
                      )}
                    </td>

                    {/* Column 5: 3-Month Trend (ONLY populated after GKP CSV upload) */}
                    <td
                      className="py-3.5 px-4 align-middle text-right font-mono text-xs tabular-nums"
                      onClick={(e) => {
                        if (!row.threeMonthTrend) {
                          e.stopPropagation();
                          onOpenGkpMatcherTab();
                        }
                      }}
                    >
                      {row.threeMonthTrend ? (
                        <span
                          className={
                            row.threeMonthTrend.includes('900') ||
                            row.threeMonthTrend.includes('∞') ||
                            row.threeMonthTrend.startsWith('+')
                              ? 'text-emerald-400 font-semibold'
                              : 'text-slate-300'
                          }
                        >
                          {row.threeMonthTrend}
                        </span>
                      ) : (
                        <span className="text-slate-500 hover:text-amber-300 transition-colors whitespace-nowrap">
                          — (Upload GKP CSV)
                        </span>
                      )}
                    </td>

                    {/* Column 6: Competition Index (ONLY populated after GKP CSV upload) */}
                    <td
                      className="py-3.5 px-4 align-middle text-right font-mono text-xs tabular-nums"
                      onClick={(e) => {
                        if (typeof row.competitionIndex !== 'number') {
                          e.stopPropagation();
                          onOpenGkpMatcherTab();
                        }
                      }}
                    >
                      {typeof row.competitionIndex === 'number' ? (
                        <span
                          className={
                            row.competitionIndex < 70
                              ? 'text-amber-300 font-semibold'
                              : 'text-slate-400'
                          }
                        >
                          {row.competitionIndex}
                          {row.competition ? ` (${row.competition})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 hover:text-amber-300 transition-colors whitespace-nowrap">
                          — (Upload GKP CSV)
                        </span>
                      )}
                    </td>

                    {/* Column 7: Recommended Blank */}
                    <td className="py-3.5 px-4 align-middle">
                      <span className="text-xs font-mono text-slate-200 whitespace-nowrap">
                        {row.recommendedBlank}
                      </span>
                    </td>

                    {/* Column 8: Suggested SEO Product Title */}
                    <td className="py-3.5 px-4 align-middle max-w-xs">
                      <div className="text-xs text-slate-100 font-medium leading-snug">
                        {row.suggestedSeoTitle}
                      </div>
                    </td>

                    {/* Column 9: Action Button */}
                    <td
                      className="py-3.5 px-4 align-middle text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity(row);
                      }}
                    >
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Generate Design Brief &amp; 3-Layer Copy
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
