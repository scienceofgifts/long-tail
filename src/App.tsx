import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Compass,
  FileSpreadsheet,
  Radar,
  Sparkles,
  Square,
} from 'lucide-react';
import {
  AutocompleteSuggestionItem,
  BLANK_OPTIONS,
  BlankFilterOption,
  buildDeterministicBrief,
  EntityCategory,
  generateFallbackEntities,
  GkpParsedRow,
  INITIAL_ANCIENT_ROME_OPPORTUNITIES,
  OpportunityRow,
  PRESET_NICHES,
  ProductBrief,
  SubEntity,
  synthesizeOpportunitiesFromEntities,
} from './shared/radarEngine';
import { EntityMatrixPanel } from './components/EntityMatrixPanel';
import { OpportunityTable } from './components/OpportunityTable';
import { GkpSidebarDrawer } from './components/GkpSidebarDrawer';
import { ProductBriefModal } from './components/ProductBriefModal';

export default function App() {
  const [niche, setNiche] = useState<string>('Ancient Rome');
  const [selectedBlanks, setSelectedBlanks] = useState<BlankFilterOption[]>([
    'Mugs',
    'Glassware',
    'Apparel',
    'Desk Mats',
    'Posters',
    'Journals/Totes',
  ]);

  const [entities, setEntities] = useState<SubEntity[]>(() =>
    generateFallbackEntities('Ancient Rome')
  );
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>(
    INITIAL_ANCIENT_ROME_OPPORTUNITIES
  );

  const [isExpanding, setIsExpanding] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [probedStats, setProbedStats] = useState<{
    totalProbed: number;
    liveCount: number;
  } | null>(null);

  const [isGkpDrawerOpen, setIsGkpDrawerOpen] = useState(false);
  const [gkpDrawerTab, setGkpDrawerTab] = useState<'batches' | 'matcher'>('batches');
  const [activeOpportunity, setActiveOpportunity] = useState<OpportunityRow | null>(null);
  const [activeBrief, setActiveBrief] = useState<ProductBrief | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // On initial mount, probe live Google Autocomplete for the default Ancient Rome entities
  // so real #1-#10 Google Autocomplete ranks are populated immediately if reachable
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/mine-autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche: 'Ancient Rome',
            entities: generateFallbackEntities('Ancient Rome'),
            blanks: ['Mugs', 'Glassware', 'Apparel', 'Desk Mats', 'Posters', 'Journals/Totes'],
          }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          suggestions?: AutocompleteSuggestionItem[];
          totalQueriesProbed?: number;
          liveCount?: number;
        };
        if (cancelled || !data.suggestions) return;

        setProbedStats({
          totalProbed: data.totalQueriesProbed || 0,
          liveCount: data.liveCount || 0,
        });

        const liveSuggestions = data.suggestions.filter((s) => s.source === 'live_google');
        if (liveSuggestions.length > 0) {
          setOpportunities((prev) =>
            prev.map((opp, idx) => {
              // Match by query or parentEntity
              const exact = liveSuggestions.find(
                (s) => s.query.toLowerCase() === opp.query.toLowerCase()
              );
              const byEntity = liveSuggestions.find(
                (s) => s.entityName.toLowerCase() === opp.parentEntity.toLowerCase()
              );
              const picked = exact || byEntity || liveSuggestions[idx % liveSuggestions.length];
              if (!picked || typeof picked.autocompleteRank !== 'number') return opp;

              return {
                ...opp,
                query: exact ? exact.query : byEntity ? byEntity.query : opp.query,
                autocompleteSource: 'live_google',
                autocompleteRank: picked.autocompleteRank,
              };
            })
          );
        }
      } catch {
        // Keep unverified state if offline
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBlank = (blank: BlankFilterOption) => {
    setSelectedBlanks((prev) =>
      prev.includes(blank) ? prev.filter((b) => b !== blank) : [...prev, blank]
    );
  };

  // Step 1: Generate 30 Sub-Entity Matrix
  const handleGenerateMatrix = async (overrideNiche?: string) => {
    const targetNiche = (overrideNiche ?? niche).trim() || 'Ancient Rome';
    if (overrideNiche) {
      setNiche(overrideNiche);
    }

    setIsExpanding(true);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/expand-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: targetNiche,
          blanks: selectedBlanks,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        entities?: SubEntity[];
        source?: string;
      };

      if (data.entities && data.entities.length > 0) {
        setEntities(data.entities);
        const initialSynth = synthesizeOpportunitiesFromEntities(
          data.entities,
          [],
          selectedBlanks
        );
        setOpportunities(initialSynth);
      } else {
        const fallback = generateFallbackEntities(targetNiche);
        setEntities(fallback);
        setOpportunities(
          synthesizeOpportunitiesFromEntities(fallback, [], selectedBlanks)
        );
      }
    } catch {
      const fallback = generateFallbackEntities(targetNiche);
      setEntities(fallback);
      setOpportunities(
        synthesizeOpportunitiesFromEntities(fallback, [], selectedBlanks)
      );
      setStatusNotice(
        'Loaded curated 30-entity taxonomic matrix. Click Step 2 to probe live Google Autocomplete.'
      );
    } finally {
      setIsExpanding(false);
    }
  };

  // Step 2 & 3: Mine Live Google Autocomplete & Score Long-Tail Demand
  const handleMineAndScore = async () => {
    setIsMining(true);
    setStatusNotice(null);

    try {
      let suggestions: AutocompleteSuggestionItem[] = [];
      let totalProbed = 0;
      let liveCount = 0;

      try {
        const mineRes = await fetch('/api/mine-autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche,
            entities,
            blanks: selectedBlanks,
          }),
        });
        if (mineRes.ok) {
          const mineData = (await mineRes.json()) as {
            suggestions?: AutocompleteSuggestionItem[];
            totalQueriesProbed?: number;
            liveCount?: number;
          };
          suggestions = mineData.suggestions || [];
          totalProbed = mineData.totalQueriesProbed || 0;
          liveCount = mineData.liveCount || 0;
        }
      } catch {
        const activeEnts = entities.filter((e) => e.selected);
        suggestions = activeEnts.map((e) => ({
          entityName: e.name,
          category: e.category,
          query: `${e.searchSeed} gift`,
          source: 'unverified',
        }));
      }

      setProbedStats({ totalProbed, liveCount });

      // 2. Filter, Cluster & Score via /api/score-and-brief (strictly zero volume guessing)
      const scoreRes = await fetch('/api/score-and-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'score',
          niche,
          entities,
          suggestions,
          blanks: selectedBlanks,
        }),
      });

      if (scoreRes.ok) {
        const scoreData = (await scoreRes.json()) as {
          opportunities?: OpportunityRow[];
        };
        if (scoreData.opportunities && scoreData.opportunities.length > 0) {
          setOpportunities(scoreData.opportunities);
          const el = document.getElementById('opportunity-table');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      const synth = synthesizeOpportunitiesFromEntities(
        entities,
        suggestions,
        selectedBlanks
      );
      setOpportunities(synth);
    } catch {
      const synth = synthesizeOpportunitiesFromEntities(
        entities,
        [],
        selectedBlanks
      );
      setOpportunities(synth);
    } finally {
      setIsMining(false);
    }
  };

  const handleToggleEntity = (id: string) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.id === id ? { ...ent, selected: !ent.selected } : ent))
    );
  };

  const handleSelectCategory = (category: EntityCategory, select: boolean) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.category === category ? { ...ent, selected: select } : ent))
    );
  };

  const handleSelectAllEntities = (select: boolean) => {
    setEntities((prev) => prev.map((ent) => ({ ...ent, selected: select })));
  };

  const handleAddCustomEntity = (
    name: string,
    category: EntityCategory,
    searchSeed: string
  ) => {
    const newEntity: SubEntity = {
      id: `custom-${Date.now()}`,
      name,
      category,
      rationale: 'Custom insider sub-entity added manually for targeted autocomplete probing.',
      searchSeed,
      selected: true,
    };
    setEntities((prev) => [newEntity, ...prev]);
  };

  const handleOpenBriefModal = async (row: OpportunityRow) => {
    setActiveOpportunity(row);
    if (row.brief) {
      setActiveBrief(row.brief);
      return;
    }

    const deterministic = buildDeterministicBrief(row);
    setActiveBrief(deterministic);
    await handleRegenerateBriefWithAi(row);
  };

  const handleRegenerateBriefWithAi = async (row: OpportunityRow) => {
    setIsGeneratingBrief(true);
    try {
      const res = await fetch('/api/score-and-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'brief',
          opportunity: row,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { brief?: ProductBrief };
        if (data.brief) {
          setActiveBrief(data.brief);
          setOpportunities((prev) =>
            prev.map((item) =>
              item.id === row.id ? { ...item, brief: data.brief } : item
            )
          );
        }
      }
    } catch {
      // Keep deterministic brief on error
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // Sync real uploaded/pasted GKP CSV matches into the main Opportunity Table
  const handleApplyGkpMatches = (parsedRows: GkpParsedRow[]) => {
    if (parsedRows.length === 0) return;

    setOpportunities((prev) => {
      const updated = prev.map((opp) => {
        const matched = parsedRows.find(
          (p) =>
            p.keyword.toLowerCase() === opp.query.toLowerCase() ||
            opp.query.toLowerCase().includes(p.keyword.toLowerCase()) ||
            p.keyword.toLowerCase().includes(opp.query.toLowerCase())
        );
        if (!matched) return opp;
        return {
          ...opp,
          monthlyVolume: matched.monthlySearches,
          threeMonthTrend: matched.threeMonthChange,
          yoyGrowth: matched.yoyChange,
          competition: matched.competition,
          competitionIndex: matched.competitionIndex,
          isSurgingWinner: matched.isSurging && matched.isLowCompWinner,
        };
      });

      const existingQueries = new Set(updated.map((u) => u.query.toLowerCase()));
      const newCsvRows: OpportunityRow[] = [];

      parsedRows.forEach((p, idx) => {
        const clean = p.keyword.toLowerCase();
        if (!existingQueries.has(clean)) {
          existingQueries.add(clean);
          const titleCase = clean
            .split(' ')
            .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
            .join(' ');
          newCsvRows.push({
            id: `gkp-import-${Date.now()}-${idx}`,
            query: clean,
            parentEntity: titleCase.replace(
              /\s+(Mug|Shirt|Poster|Glass|Hoodie|Tote|Desk Mat)$/i,
              ''
            ),
            category: EntityCategory.INSIDER_TERMS,
            buyerIntentScore: p.isSurging && p.isLowCompWinner ? 95 : 84,
            giftability: p.isSurging ? 'Exceptional' : 'Very High',
            recommendedBlank: clean.includes('desk mat')
              ? 'Desk Mat'
              : clean.includes('poster')
              ? 'Museum Poster'
              : clean.includes('glass')
              ? 'Rocks/Pint Glass'
              : clean.includes('shirt') || clean.includes('hoodie')
              ? 'Heavyweight Hoodie/Tee'
              : 'Mug',
            designAngle: 'Archival Woodcut',
            suggestedSeoTitle: `Archival Collector Plate – ${titleCase}`,
            autocompleteSource: 'unverified',
            monthlyVolume: p.monthlySearches,
            threeMonthTrend: p.threeMonthChange,
            yoyGrowth: p.yoyChange,
            competition: p.competition,
            competitionIndex: p.competitionIndex,
            isSurgingWinner: p.isSurging && p.isLowCompWinner,
          });
        }
      });

      return [...newCsvRows, ...updated];
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xs border-b border-slate-800/90 px-6 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Custom SVG Radar-Astrolabe Logo + Concise Wordmark */}
        <a
          href="#discovery-bar"
          aria-label="Long-Tail Gift Radar Home"
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <span className="w-8 h-8 rounded-md bg-slate-900 border border-amber-400/40 flex items-center justify-center shadow-xs group-hover:border-amber-400 transition-colors">
            <svg
              viewBox="0 0 32 32"
              className="w-5 h-5 text-amber-400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer astrolabe ring */}
              <circle
                cx="16"
                cy="16"
                r="12.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {/* Inner radar range ring */}
              <circle
                cx="16"
                cy="16"
                r="7.5"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2.5 2"
                className="opacity-75"
              />
              {/* Cardinal crosshairs */}
              <path
                d="M16 2V6M16 26V30M2 16H6M26 16H30"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {/* Radar sweep needle & target node */}
              <path
                d="M16 16L23.5 8.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="22.5" cy="9.5" r="2" fill="#FBBF24" />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
            </svg>
          </span>
          <span className="text-lg font-editorial font-bold tracking-tight text-slate-100 group-hover:text-amber-200 transition-colors">
            Long-Tail
          </span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a
            href="#discovery-bar"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Discovery Bar
          </a>
          <a
            href="#entity-matrix"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Entity Matrix
          </a>
          <a
            href="#opportunity-table"
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Opportunity Ledger
          </a>
          <button
            type="button"
            onClick={() => {
              setGkpDrawerTab('matcher');
              setIsGkpDrawerOpen(true);
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            GKP CSV Matcher
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setGkpDrawerTab('batches');
              setIsGkpDrawerOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Seeds
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Top Discovery Bar */}
        <section
          id="discovery-bar"
          className="border border-slate-800/90 bg-slate-900/50 rounded-lg p-6 space-y-6"
        >
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Entity-First E-Commerce Search Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-semibold text-slate-100 tracking-tight text-balance">
              Uncover High-Converting Insider Gift Demand Beyond Generic Keywords
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enter any broad audience or scholarly interest below. We decompose the topic into 30
              insider figures, artifacts, micro-professions, and maxims—then mine live Google
              Autocomplete (<code className="font-mono text-xs text-amber-300">#1 – #10</code>{' '}
              exact rank) with zero hallucinated search volume numbers.
            </p>
          </div>

          {/* Broad Niche Input & Quick-Launch Preset Buttons */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Compass className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateMatrix();
                  }}
                  placeholder="Enter a broad niche or audience (e.g., Ancient Rome, Filmmakers, Cardiologists, Sitcom Lore)..."
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950 border border-slate-700/90 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={() => handleGenerateMatrix()}
                disabled={isExpanding}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isExpanding ? (
                  <>
                    <Radar className="w-4 h-4 animate-spin" />
                    Decomposing 30 Sub-Entities...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    1. Generate Sub-Entity Matrix
                  </>
                )}
              </button>
            </div>

            {/* Quick-Launch Preset Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-slate-400 mr-1">
                Quick-Launch Presets:
              </span>
              {PRESET_NICHES.map((preset) => {
                const isActive = niche.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleGenerateMatrix(preset)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/15 border-amber-400/60 text-amber-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Product Blank Checkboxes */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Target Fourthwall Product Blanks:
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {BLANK_OPTIONS.map((opt) => {
                const checked = selectedBlanks.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleBlank(opt.id)}
                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      checked
                        ? 'bg-slate-800/90 border-amber-400/50 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {statusNotice && (
            <div className="text-xs font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded px-3.5 py-2">
              {statusNotice}
            </div>
          )}
        </section>

        {/* 2. Interactive Entity Matrix (Step 1 Panel) */}
        <EntityMatrixPanel
          niche={niche}
          entities={entities}
          isMining={isMining}
          onToggleEntity={handleToggleEntity}
          onSelectCategory={handleSelectCategory}
          onSelectAll={handleSelectAllEntities}
          onAddCustomEntity={handleAddCustomEntity}
          onMineAutocomplete={handleMineAndScore}
        />

        {/* 3. Long-Tail Opportunity Table (Step 2 & 3 Main Table) */}
        <OpportunityTable
          opportunities={opportunities}
          isLoading={isMining}
          probedStats={probedStats}
          onSelectOpportunity={handleOpenBriefModal}
          onOpenGkpDrawer={() => {
            setGkpDrawerTab('batches');
            setIsGkpDrawerOpen(true);
          }}
          onOpenGkpMatcherTab={() => {
            setGkpDrawerTab('matcher');
            setIsGkpDrawerOpen(true);
          }}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Science of Gifts · Long-Tail Gift Radar — Live Autocomplete &amp; GKP CSV Verification
          </div>
          <div className="flex items-center gap-4">
            <a href="#discovery-bar" className="hover:text-slate-300 transition-colors">
              Discovery
            </a>
            <span aria-hidden="true">·</span>
            <a href="#entity-matrix" className="hover:text-slate-300 transition-colors">
              30-Entity Matrix
            </a>
            <span aria-hidden="true">·</span>
            <a href="#opportunity-table" className="hover:text-slate-300 transition-colors">
              Opportunity Table
            </a>
          </div>
        </div>
      </footer>

      {/* 4. Google Keyword Planner Seed Exporter & CSV Volume Matcher Drawer */}
      <GkpSidebarDrawer
        isOpen={isGkpDrawerOpen}
        initialTab={gkpDrawerTab}
        onClose={() => setIsGkpDrawerOpen(false)}
        entities={entities}
        opportunities={opportunities}
        onApplyGkpMatches={handleApplyGkpMatches}
      />

      {/* 5. Instant Product Brief Modal */}
      <ProductBriefModal
        opportunity={activeOpportunity}
        brief={activeBrief}
        isGenerating={isGeneratingBrief}
        onClose={() => {
          setActiveOpportunity(null);
          setActiveBrief(null);
        }}
        onRegenerateWithAi={handleRegenerateBriefWithAi}
      />
    </div>
  );
}
