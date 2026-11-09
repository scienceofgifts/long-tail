import { GoogleGenAI, Type } from '@google/genai';
import {
  AutocompleteSuggestionItem,
  BLANK_OPTIONS,
  BlankFilterOption,
  buildDeterministicBrief,
  DesignAngle,
  EntityCategory,
  generateFallbackEntities,
  OpportunityRow,
  ProductBrief,
  RecommendedBlank,
  SubEntity,
  synthesizeOpportunitiesFromEntities,
} from '../shared/radarEngine';

function createGeminiClient(apiKey?: string): GoogleGenAI | null {
  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithModelFallback(
  ai: GoogleGenAI,
  contents: string,
  systemInstruction: string,
  responseSchema: Record<string, unknown>
): Promise<string> {
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate Gemini models failed');
}

export async function handleExpandEntities(
  body: { niche?: string; blanks?: BlankFilterOption[] },
  apiKey?: string
): Promise<{ entities: SubEntity[]; source: 'gemini' | 'curated_preset' }> {
  const niche = (body.niche || 'Ancient Rome').trim();
  const ai = createGeminiClient(apiKey);

  if (ai) {
    try {
      const systemInstruction = `You are the Lead Merchandising Strategist & Archival Taxonomist for "Science of Gifts", an intellectual e-commerce brand.
Given a broad audience or interest topic, break it down into EXACTLY 30 hyper-specific sub-entities (6 per category) across these 5 exact categories:
1. "Iconic Figures & Pioneers" (e.g., Marcus Aurelius, Joan Didion, Eadweard Muybridge, Santiago Ramón y Cajal)
2. "Famous Artifacts, Texts & Works" (e.g., Meditations, Rosetta Stone, Codex Regius, Tabula Peutingeriana, Photo 51)
3. "Sub-Professions & Micro-Identities" (e.g., APUSH Teacher, 1st AC, Spec Script Writer, Classical Numismatist)
4. "Insider Terms, Maxims & Memes" (e.g., Ea-nasir copper, Chekhov's Gun, Memento Mori, Kuleshov Effect, Carthago Delenda Est)
5. "Specific Eras, Movements & Aesthetics" (e.g., 1652 Coffeehouse, Dark Academia, Dogme 95, Crisis of the Third Century)

Each entity must have a short, concrete "searchSeed" (2 to 4 words, lowercase) that real gift buyers or enthusiasts type into Google before product words like "mug", "shirt", "poster", or "gift".
CRITICAL: Never invent or estimate search volume numbers.`;

      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Specific historical, technical, or cultural sub-entity name.' },
            category: {
              type: Type.STRING,
              description: 'Must be one of the 5 exact category names.',
            },
            rationale: {
              type: Type.STRING,
              description: '1 concise sentence explaining why insiders in this niche love this entity as a gift.',
            },
            searchSeed: {
              type: Type.STRING,
              description: 'Concise 2-4 word lowercase search root used in Google Autocomplete.',
            },
          },
          required: ['name', 'category', 'rationale', 'searchSeed'],
        },
      };

      const rawJson = await generateWithModelFallback(
        ai,
        `Expand the broad niche "${niche}" into 30 hyper-specific sub-entities (6 per bucket) for high-converting gift merchandise.`,
        systemInstruction,
        schema
      );

      const parsed = JSON.parse(rawJson.trim()) as Array<{
        name: string;
        category: string;
        rationale: string;
        searchSeed: string;
      }>;

      if (Array.isArray(parsed) && parsed.length >= 10) {
        const validCategories = Object.values(EntityCategory);
        const entities: SubEntity[] = parsed.slice(0, 30).map((item, idx) => {
          const matchedCat =
            validCategories.find((c) => c.toLowerCase() === item.category?.toLowerCase()) ||
            validCategories[Math.floor(idx / 6) % validCategories.length];

          return {
            id: `ent-${Date.now()}-${idx}`,
            name: item.name,
            category: matchedCat,
            rationale: item.rationale,
            searchSeed: item.searchSeed.toLowerCase().trim(),
            selected: idx < 12,
          };
        });
        return { entities, source: 'gemini' };
      }
    } catch (err) {
      console.warn('Gemini entity expansion fell back to curated preset:', err);
    }
  }

  return {
    entities: generateFallbackEntities(niche),
    source: 'curated_preset',
  };
}

async function fetchGoogleSuggest(query: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=${encodeURIComponent(
    query
  )}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/128.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1]
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 10); // Exact #1 to #10 suggestions in Google's autocomplete dropdown
    }
    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleMineAutocomplete(body: {
  entities?: SubEntity[];
  blanks?: BlankFilterOption[];
  niche?: string;
}): Promise<{
  suggestions: AutocompleteSuggestionItem[];
  totalQueriesProbed: number;
  liveCount: number;
}> {
  const entities = (body.entities || []).filter((e) => e.selected);
  const activeEntities = entities.length > 0 ? entities : (body.entities || []).slice(0, 10);
  const blanks: BlankFilterOption[] =
    body.blanks && body.blanks.length > 0
      ? body.blanks
      : ['Mugs', 'Glassware', 'Apparel', 'Desk Mats', 'Posters', 'Journals/Totes'];

  const modifiers = new Set<string>(['gifts', 'gift']);
  BLANK_OPTIONS.forEach((opt) => {
    if (blanks.includes(opt.id)) {
      opt.modifiers.forEach((m) => modifiers.add(m));
    }
  });
  const modList = Array.from(modifiers).slice(0, 6);

  const probeTasks: {
    entityName: string;
    category: EntityCategory;
    probeQuery: string;
  }[] = [];

  for (const ent of activeEntities.slice(0, 12)) {
    const seed = (ent.searchSeed || ent.name).toLowerCase().trim();
    // Always probe the raw entity seed first so we capture Google's top dropdown completions
    probeTasks.push({
      entityName: ent.name,
      category: ent.category,
      probeQuery: seed,
    });

    if (ent.category === EntityCategory.SUB_PROFESSIONS) {
      probeTasks.push({
        entityName: ent.name,
        category: ent.category,
        probeQuery: `gifts for ${seed}`,
      });
      for (const letter of ['a', 'c', 'm']) {
        probeTasks.push({
          entityName: ent.name,
          category: ent.category,
          probeQuery: `gifts for ${seed} ${letter}`,
        });
      }
    }
    for (const mod of modList.slice(0, 3)) {
      probeTasks.push({
        entityName: ent.name,
        category: ent.category,
        probeQuery: `${seed} ${mod}`,
      });
    }
  }

  // Cap concurrent probes to 28 for responsive batch execution
  const cappedTasks = probeTasks.slice(0, 28);
  const results = await Promise.all(
    cappedTasks.map(async (task) => {
      const found = await fetchGoogleSuggest(task.probeQuery);
      return {
        ...task,
        found,
      };
    })
  );

  const seen = new Set<string>();
  const suggestions: AutocompleteSuggestionItem[] = [];
  let liveCount = 0;

  for (const res of results) {
    if (res.found.length > 0) {
      res.found.forEach((suggestionString, idx) => {
        const clean = suggestionString.toLowerCase().trim();
        const rank = idx + 1; // Exact 1-based position (#1 to #10) in suggestqueries.google.com
        if (!seen.has(clean) && rank >= 1 && rank <= 10) {
          seen.add(clean);
          liveCount++;
          suggestions.push({
            entityName: res.entityName,
            category: res.category,
            query: clean,
            source: 'live_google',
            autocompleteRank: rank,
            seedQuery: res.probeQuery,
          });
        }
      });
    } else {
      const clean = res.probeQuery.toLowerCase().trim();
      if (!seen.has(clean)) {
        seen.add(clean);
        suggestions.push({
          entityName: res.entityName,
          category: res.category,
          query: clean,
          source: 'unverified',
          autocompleteRank: undefined,
          seedQuery: res.probeQuery,
        });
      }
    }
  }

  return {
    suggestions,
    totalQueriesProbed: cappedTasks.length,
    liveCount,
  };
}

export async function handleScoreAndBrief(
  body: {
    mode?: 'score' | 'brief';
    niche?: string;
    entities?: SubEntity[];
    suggestions?: AutocompleteSuggestionItem[];
    blanks?: BlankFilterOption[];
    opportunity?: OpportunityRow;
  },
  apiKey?: string
): Promise<{ opportunities?: OpportunityRow[]; brief?: ProductBrief; source: 'gemini' | 'deterministic' }> {
  const ai = createGeminiClient(apiKey);

  // Mode B: Single-row deep Product Brief generation
  if (body.mode === 'brief' && body.opportunity) {
    const opp = body.opportunity;
    if (ai) {
      try {
        const systemInstruction = `You are the Creative Director and Senior Copywriter for "Science of Gifts", an archival & scholarly merchandise brand on Fourthwall.
Generate a complete, conversion-engineered product brief for the given long-tail search query and parent entity.
Follow these strict rules:
1. "fourthwallTitle": Must use the "Editorial Hook – Exact Keyword Anchor" formula.
2. "urlSlug": Clean lowercase hyphenated slug matching the title.
3. "imagePrompt": A layout-engineered image generation prompt specifically formatted for a flat 2D copperplate etching / museum plate on a solid pure #000000 black background with zero muddy gradients, zero 3D mockups, and crisp antique ivory (#F5F0E6) and warm gold (#D97706) vector linework.
4. "layer1LoreHook": Exactly 2 bold, intellectually engaging sentences unpacking the insider historical/scientific/cultural lore behind the entity.
5. "layer2VisualBreakdown": 1 rich paragraph detailing the specific archival engraving elements, typography, and museum plate composition.
6. "layer3Bullets": Array of 3 crisp, scannable gift & material quality bullets tailored to the recommended blank.
CRITICAL: Never invent or mention search volume numbers.`;

        const schema = {
          type: Type.OBJECT,
          properties: {
            fourthwallTitle: { type: Type.STRING },
            urlSlug: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            layer1LoreHook: { type: Type.STRING },
            layer2VisualBreakdown: { type: Type.STRING },
            layer3Bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'fourthwallTitle',
            'urlSlug',
            'imagePrompt',
            'layer1LoreHook',
            'layer2VisualBreakdown',
            'layer3Bullets',
          ],
        };

        const rawJson = await generateWithModelFallback(
          ai,
          `Create a 3-layer product brief and #000000 copperplate etching prompt for:
Long-Tail Query: "${opp.query}"
Parent Entity: "${opp.parentEntity}"
Category: "${opp.category}"
Recommended Blank: "${opp.recommendedBlank}"
Design Angle: "${opp.designAngle}"
Suggested SEO Title: "${opp.suggestedSeoTitle}"`,
          systemInstruction,
          schema
        );

        const parsed = JSON.parse(rawJson.trim()) as {
          fourthwallTitle: string;
          urlSlug: string;
          imagePrompt: string;
          layer1LoreHook: string;
          layer2VisualBreakdown: string;
          layer3Bullets: string[];
        };

        const bullets: [string, string, string] = [
          parsed.layer3Bullets?.[0] || 'Museum-grade archival print fidelity on dark surfaces.',
          parsed.layer3Bullets?.[1] || 'Engineered for everyday durability and tactile comfort.',
          parsed.layer3Bullets?.[2] || `Unmistakable insider gift for ${opp.parentEntity} enthusiasts.`,
        ];

        return {
          brief: {
            fourthwallTitle: parsed.fourthwallTitle || opp.suggestedSeoTitle,
            urlSlug: parsed.urlSlug,
            imagePrompt: parsed.imagePrompt,
            layer1LoreHook: parsed.layer1LoreHook,
            layer2VisualBreakdown: parsed.layer2VisualBreakdown,
            layer3Bullets: bullets,
            designAngle: opp.designAngle,
            recommendedBlank: opp.recommendedBlank,
          },
          source: 'gemini',
        };
      } catch (err) {
        console.warn('Gemini single brief fell back to deterministic builder:', err);
      }
    }

    return {
      brief: buildDeterministicBrief(opp),
      source: 'deterministic',
    };
  }

  // Mode A: Filter, Cluster & Score Autocomplete Strings (ZERO search volume estimation)
  const entities = body.entities || [];
  const suggestions = body.suggestions || [];
  const blanks: BlankFilterOption[] = body.blanks || [
    'Mugs',
    'Glassware',
    'Apparel',
    'Desk Mats',
    'Posters',
    'Journals/Totes',
  ];

  // Build lookup map of exact live Google Autocomplete strings -> rank & source
  const suggestionLookup = new Map<string, AutocompleteSuggestionItem>();
  for (const s of suggestions) {
    const key = s.query.toLowerCase().trim();
    const existing = suggestionLookup.get(key);
    if (!existing || (s.source === 'live_google' && existing.source !== 'live_google')) {
      suggestionLookup.set(key, s);
    }
  }

  if (ai && suggestions.length > 0) {
    try {
      const systemInstruction = `You are the Head of Search Intelligence for "Science of Gifts".
You receive real Google Autocomplete suggestions paired with sub-entities.
Your job:
1. Strip out non-buyer informational queries (biography dates, homework/essay help, Wikipedia lookups, unrelated streetwear brands, or generic noise).
2. Select the highest-converting long-tail merchandise & gift queries (return 10 to 15 top opportunities). Prefer keeping the exact "query" strings from the input list whenever they have commercial or gift potential so their live Google Autocomplete rank is preserved.
3. Rank each valid query by:
   - "buyerIntentScore" (integer 70 to 99, reflecting commercial gift/product intent)
   - "giftability" ("Exceptional", "Very High", or "High")
   - "recommendedBlank" (MUST be one of: "Mug", "Rocks/Pint Glass", "Heavyweight Hoodie/Tee", "Desk Mat", "Museum Poster", "Hardcover Journal", "Tote Bag")
   - "designAngle" (MUST be one of: "Archival Woodcut", "Patent Blueprint", "Faux-Institution Crest", "Deadpan Identity Satire")
   - "suggestedSeoTitle" (MUST follow the "Editorial Hook – Exact Keyword Anchor" formula, e.g., "Cato the Elder Senate Closer – Carthago Delenda Est Mug")
CRITICAL RULE: NEVER guess, estimate, or output monthly search volume numbers, trends, or competition indices.`;

      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING },
            parentEntity: { type: Type.STRING },
            category: { type: Type.STRING },
            buyerIntentScore: { type: Type.INTEGER },
            giftability: { type: Type.STRING },
            recommendedBlank: { type: Type.STRING },
            designAngle: { type: Type.STRING },
            suggestedSeoTitle: { type: Type.STRING },
          },
          required: [
            'query',
            'parentEntity',
            'category',
            'buyerIntentScore',
            'giftability',
            'recommendedBlank',
            'designAngle',
            'suggestedSeoTitle',
          ],
        },
      };

      const promptPayload = JSON.stringify(
        suggestions.slice(0, 50).map((s) => ({
          query: s.query,
          entityName: s.entityName,
          category: s.category,
          source: s.source,
          autocompleteRank: s.autocompleteRank ?? null,
        }))
      );

      const rawJson = await generateWithModelFallback(
        ai,
        `Filter, cluster, and score these discovered autocomplete strings for niche "${
          body.niche || 'Scholarly Gifts'
        }" (Target blanks: ${blanks.join(', ')}):\n${promptPayload}`,
        systemInstruction,
        schema
      );

      const parsed = JSON.parse(rawJson.trim()) as Array<{
        query: string;
        parentEntity: string;
        category: string;
        buyerIntentScore: number;
        giftability: string;
        recommendedBlank: string;
        designAngle: string;
        suggestedSeoTitle: string;
      }>;

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validCategories = Object.values(EntityCategory);
        const validBlanks: RecommendedBlank[] = [
          'Mug',
          'Rocks/Pint Glass',
          'Heavyweight Hoodie/Tee',
          'Desk Mat',
          'Museum Poster',
          'Hardcover Journal',
          'Tote Bag',
        ];
        const validAngles: DesignAngle[] = [
          'Archival Woodcut',
          'Patent Blueprint',
          'Faux-Institution Crest',
          'Deadpan Identity Satire',
        ];

        const opportunities: OpportunityRow[] = parsed
          .sort((a, b) => (b.buyerIntentScore || 80) - (a.buyerIntentScore || 80))
          .map((item, idx) => {
            const cleanQ = item.query.toLowerCase().trim();
            const matchedOrigin = suggestionLookup.get(cleanQ);

            const cat =
              validCategories.find((c) => c.toLowerCase() === item.category?.toLowerCase()) ||
              matchedOrigin?.category ||
              EntityCategory.INSIDER_TERMS;
            const blank =
              validBlanks.find((b) => b.toLowerCase() === item.recommendedBlank?.toLowerCase()) ||
              'Mug';
            const angle =
              validAngles.find((a) => a.toLowerCase() === item.designAngle?.toLowerCase()) ||
              'Archival Woodcut';
            const giftability: OpportunityRow['giftability'] =
              item.giftability === 'Exceptional' || item.giftability === 'Very High'
                ? item.giftability
                : 'High';

            const isLiveVerified =
              matchedOrigin?.source === 'live_google' &&
              typeof matchedOrigin.autocompleteRank === 'number';

            return {
              id: `opp-${Date.now()}-${idx}`,
              query: cleanQ,
              parentEntity: item.parentEntity || matchedOrigin?.entityName || 'Insider Entity',
              category: cat,
              buyerIntentScore: Math.min(99, Math.max(70, item.buyerIntentScore || 85)),
              giftability,
              recommendedBlank: blank,
              designAngle: angle,
              suggestedSeoTitle: item.suggestedSeoTitle,
              autocompleteSource: isLiveVerified ? 'live_google' : 'unverified',
              autocompleteRank: isLiveVerified ? matchedOrigin?.autocompleteRank : undefined,
            };
          });

        return { opportunities, source: 'gemini' };
      }
    } catch (err) {
      console.warn('Gemini scoring fell back to deterministic synthesizer:', err);
    }
  }

  return {
    opportunities: synthesizeOpportunitiesFromEntities(entities, suggestions, blanks),
    source: 'deterministic',
  };
}
