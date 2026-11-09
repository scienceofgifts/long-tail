import React, { useState } from 'react';
import { Check, Plus, Radar, Sparkles, Square, CheckSquare } from 'lucide-react';
import {
  CATEGORY_ORDER,
  EntityCategory,
  SubEntity,
} from '../shared/radarEngine';

interface EntityMatrixPanelProps {
  niche: string;
  entities: SubEntity[];
  isMining: boolean;
  onToggleEntity: (id: string) => void;
  onSelectCategory: (category: EntityCategory, select: boolean) => void;
  onSelectAll: (select: boolean) => void;
  onAddCustomEntity: (name: string, category: EntityCategory, searchSeed: string) => void;
  onMineAutocomplete: () => void;
}

export const EntityMatrixPanel: React.FC<EntityMatrixPanelProps> = ({
  niche,
  entities,
  isMining,
  onToggleEntity,
  onSelectCategory,
  onSelectAll,
  onAddCustomEntity,
  onMineAutocomplete,
}) => {
  const [customName, setCustomName] = useState('');
  const [customSeed, setCustomSeed] = useState('');
  const [customCategory, setCustomCategory] = useState<EntityCategory>(
    EntityCategory.ICONIC_FIGURES
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedCount = entities.filter((e) => e.selected).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const seed =
      customSeed.trim().toLowerCase() ||
      customName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '');
    onAddCustomEntity(customName.trim(), customCategory, seed);
    setCustomName('');
    setCustomSeed('');
    setShowAddForm(false);
  };

  return (
    <section
      id="entity-matrix"
      className="border border-slate-800/90 bg-slate-900/40 rounded-lg p-6 space-y-6"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 tracking-wider uppercase">
            <span>Step 01</span>
            <span aria-hidden="true">·</span>
            <span>Taxonomic Decomposition</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{entities.length} Sub-Entities Mapped</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-semibold text-slate-100 tracking-tight">
            Interactive Sub-Entity Matrix: <span className="italic text-amber-300">{niche}</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Traditional keyword tools fail on broad terms. Select the insider figures, artifacts,
            micro-identities, and shibboleths below to probe live Google Autocomplete with product
            modifiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Add Custom Entity
          </button>
          <button
            type="button"
            onClick={() => onSelectAll(true)}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Select All ({entities.length})
          </button>
          <button
            type="button"
            onClick={() => onSelectAll(false)}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Optional Add Custom Entity Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-md grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Sub-Entity Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Complaint Tablet to Ea-nasir"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Autocomplete Search Seed
            </label>
            <input
              type="text"
              value={customSeed}
              onChange={(e) => setCustomSeed(e.target.value)}
              placeholder="e.g., ea nasir copper"
              className="w-full px-3 py-2 text-sm font-mono bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Taxonomic Bucket
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as EntityCategory)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Insert into Matrix
            </button>
          </div>
        </form>
      )}

      {/* 5 Category Columns / Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {CATEGORY_ORDER.map((category, bucketIdx) => {
          const bucketEntities = entities.filter((e) => e.category === category);
          const allSelectedInBucket =
            bucketEntities.length > 0 && bucketEntities.every((e) => e.selected);

          return (
            <div
              key={category}
              className="border border-slate-800/90 bg-slate-950/60 rounded-md p-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Bucket Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800/80">
                  <div>
                    <span className="text-[11px] font-mono text-amber-400/90 uppercase tracking-wider block">
                      0{bucketIdx + 1} · Bucket
                    </span>
                    <h3 className="text-base font-editorial font-semibold text-slate-100 leading-snug mt-0.5">
                      {category}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(category, !allSelectedInBucket)}
                    className="text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 mt-0.5 cursor-pointer"
                  >
                    {allSelectedInBucket ? 'None' : 'All'}
                  </button>
                </div>

                {/* Entity List */}
                <div className="space-y-2">
                  {bucketEntities.map((entity) => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => onToggleEntity(entity.id)}
                      className={`w-full text-left p-2.5 rounded border transition-colors cursor-pointer ${
                        entity.selected
                          ? 'bg-amber-500/10 border-amber-500/50 text-slate-100'
                          : 'bg-slate-900/40 border-slate-800/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold leading-snug text-slate-100">
                          {entity.name}
                        </span>
                        <span className="shrink-0 mt-0.5">
                          {entity.selected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {entity.rationale}
                      </p>
                      <div className="mt-1.5 text-[10px] font-mono text-amber-300/80 truncate">
                        seed: &ldquo;{entity.searchSeed}&rdquo;
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Selected</span>
                <span className="tabular-nums text-slate-300">
                  {bucketEntities.filter((e) => e.selected).length}/{bucketEntities.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 2 Primary Action Bar */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="font-mono text-amber-300 font-semibold tabular-nums">
            {selectedCount} sub-entities armed
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Pairs each seed with gift &amp; blank modifiers (`mug`, `shirt`, `poster`, `glass`,
            `desk mat`, `gifts for [persona] a..z`)
          </span>
        </div>

        <button
          type="button"
          onClick={onMineAutocomplete}
          disabled={isMining || selectedCount === 0}
          className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
        >
          {isMining ? (
            <>
              <Radar className="w-4 h-4 animate-spin" />
              Mining Live Google Autocomplete &amp; Scoring...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              2. Mine Live Google Autocomplete &amp; Score Long-Tail Demand
            </>
          )}
        </button>
      </div>
    </section>
  );
};
