import {
  ADDITIONAL_PRESET_MATRICES,
  EntityCategory,
  SubEntity,
} from './nichePresets';

export { EntityCategory };
export type { SubEntity };

export type BlankFilterOption =
  | 'Mugs'
  | 'Glassware'
  | 'Apparel'
  | 'Desk Mats'
  | 'Posters'
  | 'Journals/Totes';

export type RecommendedBlank =
  | 'Mug'
  | 'Rocks/Pint Glass'
  | 'Heavyweight Hoodie/Tee'
  | 'Desk Mat'
  | 'Museum Poster'
  | 'Hardcover Journal'
  | 'Tote Bag';

export type DesignAngle =
  | 'Archival Woodcut'
  | 'Patent Blueprint'
  | 'Faux-Institution Crest'
  | 'Deadpan Identity Satire';

export interface ProductBrief {
  fourthwallTitle: string;
  urlSlug: string;
  imagePrompt: string;
  layer1LoreHook: string;
  layer2VisualBreakdown: string;
  layer3Bullets: [string, string, string];
  designAngle: DesignAngle;
  recommendedBlank: RecommendedBlank;
}

export interface AutocompleteSuggestionItem {
  entityName: string;
  category: EntityCategory;
  query: string;
  source: 'live_google' | 'unverified';
  autocompleteRank?: number; // Exact #1 to #10 index from suggestqueries.google.com
  seedQuery?: string;
}

export interface OpportunityRow {
  id: string;
  query: string;
  parentEntity: string;
  category: EntityCategory;
  buyerIntentScore: number; // 1-100
  giftability: 'High' | 'Very High' | 'Exceptional';
  recommendedBlank: RecommendedBlank;
  designAngle: DesignAngle;
  suggestedSeoTitle: string; // "Editorial Hook – Exact Keyword Anchor"
  autocompleteSource: 'live_google' | 'unverified';
  autocompleteRank?: number; // #1 to #10 from suggestqueries.google.com
  // Populated ONLY after user uploads/pastes a Google Keyword Planner CSV:
  monthlyVolume?: string;
  threeMonthTrend?: string;
  yoyGrowth?: string;
  competition?: string;
  competitionIndex?: number;
  isSurgingWinner?: boolean;
  brief?: ProductBrief;
}

export interface GkpParsedRow {
  keyword: string;
  monthlySearches: string;
  threeMonthChange: string;
  yoyChange: string;
  competition: string;
  competitionIndex: number;
  isSurging: boolean;
  isLowCompWinner: boolean;
}

export const PRESET_NICHES = [
  'Ancient Rome',
  'History Teachers',
  'Poets & Literature',
  'Filmmakers & Editors',
  'WWII Buffs',
  'Science & Medicine',
] as const;

export const BLANK_OPTIONS: {
  id: BlankFilterOption;
  label: BlankFilterOption;
  modifiers: string[];
  mappedBlanks: RecommendedBlank[];
}[] = [
  {
    id: 'Mugs',
    label: 'Mugs',
    modifiers: ['mug', 'coffee mug', 'gifts'],
    mappedBlanks: ['Mug'],
  },
  {
    id: 'Glassware',
    label: 'Glassware',
    modifiers: ['glass', 'pint glass', 'whiskey glass'],
    mappedBlanks: ['Rocks/Pint Glass'],
  },
  {
    id: 'Apparel',
    label: 'Apparel',
    modifiers: ['shirt', 'hoodie', 'sweater'],
    mappedBlanks: ['Heavyweight Hoodie/Tee'],
  },
  {
    id: 'Desk Mats',
    label: 'Desk Mats',
    modifiers: ['desk mat', 'mousepad', 'desk accessory'],
    mappedBlanks: ['Desk Mat'],
  },
  {
    id: 'Posters',
    label: 'Posters',
    modifiers: ['poster', 'art print', 'wall art'],
    mappedBlanks: ['Museum Poster'],
  },
  {
    id: 'Journals/Totes',
    label: 'Journals/Totes',
    modifiers: ['tote', 'tote bag', 'journal'],
    mappedBlanks: ['Hardcover Journal', 'Tote Bag'],
  },
];

export const CATEGORY_ORDER: EntityCategory[] = [
  EntityCategory.ICONIC_FIGURES,
  EntityCategory.ARTIFACTS_TEXTS,
  EntityCategory.SUB_PROFESSIONS,
  EntityCategory.INSIDER_TERMS,
  EntityCategory.ERAS_MOVEMENTS,
];

export const PRESET_MATRICES: Record<string, Omit<SubEntity, 'id' | 'selected'>[]> = {
  'Ancient Rome': [
    // Iconic Figures & Pioneers (6)
    { name: 'Marcus Aurelius', category: EntityCategory.ICONIC_FIGURES, rationale: 'Stoic philosopher-emperor with massive modern gift demand', searchSeed: 'marcus aurelius' },
    { name: 'Lucius Quinctius Cincinnatus', category: EntityCategory.ICONIC_FIGURES, rationale: 'Civic virtue archetype prized by classical history readers', searchSeed: 'cincinnatus' },
    { name: 'Aurelian Restitutor Orbis', category: EntityCategory.ICONIC_FIGURES, rationale: 'Cult-favorite Crisis of the Third Century emperor', searchSeed: 'emperor aurelian' },
    { name: 'Scipio Africanus', category: EntityCategory.ICONIC_FIGURES, rationale: 'Punic Wars military strategist admired by tacticians', searchSeed: 'scipio africanus' },
    { name: 'Agrippa Postumus & Marcus Agrippa', category: EntityCategory.ICONIC_FIGURES, rationale: 'Architect of the Pantheon and Augustus right hand', searchSeed: 'marcus agrippa' },
    { name: 'Hypatia of Alexandria', category: EntityCategory.ICONIC_FIGURES, rationale: 'Late Roman Neoplatonist astronomer and mathematician', searchSeed: 'hypatia alexandria' },
    // Famous Artifacts, Texts & Works (6)
    { name: 'Meditations Book IV', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Foundational Stoic notebook quoted on desk artifacts', searchSeed: 'meditations marcus aurelius' },
    { name: 'Tabula Peutingeriana', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Illustrated itinerarium Roman road map ideal for desk mats', searchSeed: 'tabula peutingeriana' },
    { name: 'Ides of March Denarius (EID MAR)', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Brutus silver coin with daggers and pileus cap', searchSeed: 'ides of march coin' },
    { name: 'Cave Canem Pompeii Mosaic', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Iconic Pompeii house floor warning ("Beware of the Dog")', searchSeed: 'cave canem mosaic' },
    { name: 'Fasti Capitolini Marble Inscription', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Consular chronicle engraving aesthetic', searchSeed: 'roman inscription art' },
    { name: 'Vitruvius De Architectura', category: EntityCategory.ARTIFACTS_TEXTS, rationale: 'Classical architectural treatise with geometric plate diagrams', searchSeed: 'vitruvius architecture' },
    // Sub-Professions & Micro-Identities (6)
    { name: 'High School Latin Magister', category: EntityCategory.SUB_PROFESSIONS, rationale: 'Dedicated educators buying classroom mugs and totes', searchSeed: 'latin teacher' },
    { name: 'Classical Numismatist', category: EntityCategory.SUB_PROFESSIONS, rationale: 'Ancient coin collectors who love metallurgical prints', searchSeed: 'ancient coin collector' },
    { name: 'Roman Epigraphy Researcher', category: EntityCategory.SUB_PROFESSIONS, rationale: 'Scholars decoding stone inscriptions and abbreviations', searchSeed: 'classics professor' },
    { name: 'AP European & Ancient History Teacher', category: EntityCategory.SUB_PROFESSIONS, rationale: 'High-volume gift recipient every December and May', searchSeed: 'history teacher' },
    { name: 'Legio X Equestris Reenactor', category: EntityCategory.SUB_PROFESSIONS, rationale: 'Devoted Roman military history enthusiasts', searchSeed: 'roman legion' },
    { name: 'Podcast Historian (History of Rome)', category: EntityCategory.SUB_PROFESSIONS, rationale: 'Deep-dive commuters obsessed with Mike Duncan era lore', searchSeed: 'roman history buff' },
    // Insider Terms, Maxims & Memes (6)
    { name: 'Carthago Delenda Est', category: EntityCategory.INSIDER_TERMS, rationale: 'Cato the Elder Senate closer with high deadpan humor', searchSeed: 'carthago delenda est' },
    { name: 'Memento Mori', category: EntityCategory.INSIDER_TERMS, rationale: 'Triumphal whisper reminder with perennial gift velocity', searchSeed: 'memento mori' },
    { name: 'Quinctilius Varus Give Me Back My Legions', category: EntityCategory.INSIDER_TERMS, rationale: 'Augustus Teutoburg Forest lament known by every Rome nerd', searchSeed: 'varus give me back my legions' },
    { name: 'SPQR Senatus Populusque Romanus', category: EntityCategory.INSIDER_TERMS, rationale: 'Civic standard emblem for institutional crests', searchSeed: 'spqr' },
    { name: 'Amor Fati', category: EntityCategory.INSIDER_TERMS, rationale: 'Stoic love of fate maxim for minimalist glassware', searchSeed: 'amor fati' },
    { name: 'Bread and Circuses (Panem et Circenses)', category: EntityCategory.INSIDER_TERMS, rationale: 'Juvenal Satire X phrase with sharp modern resonance', searchSeed: 'panem et circenses' },
    // Specific Eras, Movements & Aesthetics (6)
    { name: 'Crisis of the Third Century (235–284 AD)', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Hyper-specific chaotic era beloved by niche history forums', searchSeed: 'crisis of the third century' },
    { name: 'Late Roman Republic Optimates vs Populares', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Political faction drama of the 1st Century BC', searchSeed: 'roman republic' },
    { name: 'Pompeian Fourth Style Fresco', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Architectural illusionistic wall painting aesthetic', searchSeed: 'pompeii art' },
    { name: 'Pax Romana Golden Age', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Antonine dynasty stability and Mediterranean trade networks', searchSeed: 'pax romana' },
    { name: 'Rubicon Crossing (49 BC)', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Alea iacta est decisive historical inflection point', searchSeed: 'crossing the rubicon' },
    { name: 'Byzantine Justinian Reconquest', category: EntityCategory.ERAS_MOVEMENTS, rationale: 'Belisarius & Eastern Roman continuation lore', searchSeed: 'byzantine empire' },
  ],
};

export function generateFallbackEntities(niche: string): SubEntity[] {
  const allPresets: Record<string, Omit<SubEntity, 'id' | 'selected'>[]> = {
    ...PRESET_MATRICES,
    ...ADDITIONAL_PRESET_MATRICES,
  };
  const matchedKey = Object.keys(allPresets).find(
    (k) => k.toLowerCase() === niche.trim().toLowerCase()
  );

  if (matchedKey) {
    return allPresets[matchedKey].map((item, idx) => ({
      ...item,
      id: `ent-${idx + 1}`,
      selected: idx < 12,
    }));
  }

  const clean = niche.trim() || 'Classical History';
  const fallbackTemplate: Omit<SubEntity, 'id' | 'selected'>[] = [
    { name: `${clean} Founding Pioneer`, category: EntityCategory.ICONIC_FIGURES, rationale: `Canonical figure revered by ${clean} insiders`, searchSeed: `${clean.toLowerCase()} pioneer` },
    { name: `Patron Saint of ${clean}`, category: EntityCategory.ICONIC_FIGURES, rationale: `Historical practitioner with cult following`, searchSeed: `famous ${clean.toLowerCase()}` },
    { name: `19th-Century ${clean} Monograph`, category: EntityCategory.ICONIC_FIGURES, rationale: `Archival illustrator and early theorist`, searchSeed: `${clean.toLowerCase()} founder` },
    { name: `Early Vanguard of ${clean}`, category: EntityCategory.ICONIC_FIGURES, rationale: `Recognizable name for dedicated enthusiasts`, searchSeed: `${clean.toLowerCase()} icon` },
    { name: `The Forgotten Architect of ${clean}`, category: EntityCategory.ICONIC_FIGURES, rationale: `Deep-cut biography subject with loyal fanbase`, searchSeed: `${clean.toLowerCase()} history` },
    { name: `Classical Chronicler of ${clean}`, category: EntityCategory.ICONIC_FIGURES, rationale: `Primary source author cited in university seminars`, searchSeed: `${clean.toLowerCase()} author` },

    { name: `First Edition ${clean} Compendium`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Foundational text with public-domain diagrams`, searchSeed: `${clean.toLowerCase()} book` },
    { name: `1894 Patent Blueprint for ${clean}`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Technical cross-section ideal for desk mats & prints`, searchSeed: `${clean.toLowerCase()} patent` },
    { name: `Archival Field Notebook of ${clean}`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Hand-annotated diagram aesthetic`, searchSeed: `${clean.toLowerCase()} journal` },
    { name: `Standard Reference Chart of ${clean}`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Taxonomic wall chart for studio or office`, searchSeed: `${clean.toLowerCase()} poster` },
    { name: `Antique Brass Instrument of ${clean}`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Tactile historical tool for woodcut illustration`, searchSeed: `${clean.toLowerCase()} tool` },
    { name: `The Canonical ${clean} Manuscript`, category: EntityCategory.ARTIFACTS_TEXTS, rationale: `Illuminated folio or copperplate plate`, searchSeed: `${clean.toLowerCase()} manuscript` },

    { name: `Senior ${clean} Archivist`, category: EntityCategory.SUB_PROFESSIONS, rationale: `Micro-identity proud of specialized expertise`, searchSeed: `${clean.toLowerCase()} specialist` },
    { name: `AP & University ${clean} Instructor`, category: EntityCategory.SUB_PROFESSIONS, rationale: `High end-of-semester gift purchasing intent`, searchSeed: `${clean.toLowerCase()} teacher` },
    { name: `Night-Shift ${clean} Practitioner`, category: EntityCategory.SUB_PROFESSIONS, rationale: `Self-deprecating occupational humor audience`, searchSeed: `${clean.toLowerCase()} professional` },
    { name: `Obsessive ${clean} Collector`, category: EntityCategory.SUB_PROFESSIONS, rationale: `Spends heavily on niche study room decor`, searchSeed: `${clean.toLowerCase()} lover` },
    { name: `Graduate Seminar ${clean} Fellow`, category: EntityCategory.SUB_PROFESSIONS, rationale: `Tote bag and coffee mug daily power user`, searchSeed: `${clean.toLowerCase()} student` },
    { name: `Retired ${clean} Department Chair`, category: EntityCategory.SUB_PROFESSIONS, rationale: `Executive gift buyer segment`, searchSeed: `${clean.toLowerCase()} professor` },

    { name: `Insider Maxim of ${clean}`, category: EntityCategory.INSIDER_TERMS, rationale: `Shibboleth phrase only true practitioners recognize`, searchSeed: `${clean.toLowerCase()} quote` },
    { name: `Deadpan ${clean} Law #1`, category: EntityCategory.INSIDER_TERMS, rationale: `Dry occupational wit that converts on mugs`, searchSeed: `funny ${clean.toLowerCase()}` },
    { name: `Archival Latin Motto of ${clean}`, category: EntityCategory.INSIDER_TERMS, rationale: `Faux-university crest motto material`, searchSeed: `${clean.toLowerCase()} motto` },
    { name: `Classic ${clean} Inside Joke`, category: EntityCategory.INSIDER_TERMS, rationale: `Viral community lore with zero mainstream clutter`, searchSeed: `${clean.toLowerCase()} meme` },
    { name: `Technical Jargon of ${clean}`, category: EntityCategory.INSIDER_TERMS, rationale: `Glossary term that signals immediate peer status`, searchSeed: `${clean.toLowerCase()} slang` },
    { name: `Historical Grievance of ${clean}`, category: EntityCategory.INSIDER_TERMS, rationale: `Specific historical feud that sparks conversation`, searchSeed: `${clean.toLowerCase()} lore` },

    { name: `Golden Age of ${clean} (c. 1880)`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `Nostalgic copperplate engraving era`, searchSeed: `vintage ${clean.toLowerCase()}` },
    { name: `Dark Academia ${clean} Society`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `Faux-institution society dept crest`, searchSeed: `${clean.toLowerCase()} club` },
    { name: `Early Modern ${clean} Guild`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `Woodcut trade guild emblem aesthetic`, searchSeed: `${clean.toLowerCase()} society` },
    { name: `Mid-Century ${clean} Laboratory`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `Technical manual typography aesthetic`, searchSeed: `${clean.toLowerCase()} aesthetic` },
    { name: `Classical School of ${clean}`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `Museum exhibition catalog aesthetic`, searchSeed: `classical ${clean.toLowerCase()}` },
    { name: `Neo-Archival ${clean} Revival`, category: EntityCategory.ERAS_MOVEMENTS, rationale: `High-contrast monochrome print movement`, searchSeed: `${clean.toLowerCase()} art` },
  ];

  return fallbackTemplate.map((item, idx) => ({
    ...item,
    id: `ent-${idx + 1}`,
    selected: idx < 12,
  }));
}

export function synthesizeOpportunitiesFromEntities(
  entities: SubEntity[],
  rawSuggestions: AutocompleteSuggestionItem[],
  selectedBlanks: BlankFilterOption[]
): OpportunityRow[] {
  const blankCycle: { blank: RecommendedBlank; suffix: string; angle: DesignAngle }[] = [
    { blank: 'Mug', suffix: 'mug', angle: 'Faux-Institution Crest' },
    { blank: 'Desk Mat', suffix: 'desk mat', angle: 'Patent Blueprint' },
    { blank: 'Heavyweight Hoodie/Tee', suffix: 'shirt', angle: 'Archival Woodcut' },
    { blank: 'Museum Poster', suffix: 'poster', angle: 'Archival Woodcut' },
    { blank: 'Rocks/Pint Glass', suffix: 'whiskey glass', angle: 'Faux-Institution Crest' },
    { blank: 'Tote Bag', suffix: 'tote bag', angle: 'Deadpan Identity Satire' },
    { blank: 'Hardcover Journal', suffix: 'journal', angle: 'Archival Woodcut' },
  ];

  const allowedBlanks = new Set<RecommendedBlank>();
  BLANK_OPTIONS.forEach((opt) => {
    if (selectedBlanks.includes(opt.id)) {
      opt.mappedBlanks.forEach((b) => allowedBlanks.add(b));
    }
  });
  const activePool =
    allowedBlanks.size > 0
      ? blankCycle.filter((b) => allowedBlanks.has(b.blank))
      : blankCycle;

  // If we have live suggestions from Google Autocomplete, prioritize those first
  const liveItems = rawSuggestions.filter((r) => r.source === 'live_google');
  if (liveItems.length > 0) {
    return liveItems.slice(0, 15).map((item, idx) => {
      const picked = activePool[idx % activePool.length];
      const q = item.query.toLowerCase();
      const inferredBlank: RecommendedBlank = q.includes('mug')
        ? 'Mug'
        : q.includes('desk mat') || q.includes('mousepad')
        ? 'Desk Mat'
        : q.includes('poster') || q.includes('print') || q.includes('art')
        ? 'Museum Poster'
        : q.includes('glass')
        ? 'Rocks/Pint Glass'
        : q.includes('tote')
        ? 'Tote Bag'
        : q.includes('journal')
        ? 'Hardcover Journal'
        : q.includes('shirt') || q.includes('hoodie') || q.includes('tee')
        ? 'Heavyweight Hoodie/Tee'
        : picked.blank;

      const score = Math.max(72, 96 - idx * 2);
      const giftability: OpportunityRow['giftability'] =
        score >= 90 ? 'Exceptional' : score >= 82 ? 'Very High' : 'High';

      const titleCaseQuery = item.query
        .split(' ')
        .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
        .join(' ');

      return {
        id: `opp-live-${Date.now()}-${idx}`,
        query: item.query,
        parentEntity: item.entityName,
        category: item.category,
        buyerIntentScore: score,
        giftability,
        recommendedBlank: inferredBlank,
        designAngle: picked.angle,
        suggestedSeoTitle: `${item.entityName} Archival Edition – ${titleCaseQuery}`,
        autocompleteSource: 'live_google',
        autocompleteRank: item.autocompleteRank,
      };
    });
  }

  const sourceEntities = entities.filter((e) => e.selected);
  const poolEntities = sourceEntities.length > 0 ? sourceEntities : entities.slice(0, 12);

  return poolEntities.slice(0, 12).map((ent, idx) => {
    const picked = activePool[idx % activePool.length];
    const matchedRaw = rawSuggestions.find(
      (r) => r.entityName.toLowerCase() === ent.name.toLowerCase()
    );
    const seedClean = ent.searchSeed || ent.name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const query = matchedRaw?.query || `${seedClean} ${picked.suffix}`;
    const score = Math.max(72, 95 - idx * 2);
    const giftability: OpportunityRow['giftability'] =
      score >= 90 ? 'Exceptional' : score >= 82 ? 'Very High' : 'High';

    const titleCaseQuery = query
      .split(' ')
      .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
      .join(' ');

    return {
      id: `opp-synth-${Date.now()}-${idx}`,
      query,
      parentEntity: ent.name,
      category: ent.category,
      buyerIntentScore: score,
      giftability,
      recommendedBlank: picked.blank,
      designAngle: picked.angle,
      suggestedSeoTitle: `${ent.name} Archival Edition – ${titleCaseQuery}`,
      autocompleteSource: matchedRaw?.source || 'unverified',
      autocompleteRank: matchedRaw?.autocompleteRank,
    };
  });
}

/**
 * Initial Ancient Rome opportunities with ZERO mocked search volumes.
 * Monthly Searches, 3-Month Trend, and Competition Index remain undefined until a GKP CSV is uploaded.
 */
export const INITIAL_ANCIENT_ROME_OPPORTUNITIES: OpportunityRow[] = [
  {
    id: 'opp-1',
    query: 'carthago delenda est mug',
    parentEntity: 'Carthago Delenda Est',
    category: EntityCategory.INSIDER_TERMS,
    buyerIntentScore: 96,
    giftability: 'Exceptional',
    recommendedBlank: 'Mug',
    designAngle: 'Faux-Institution Crest',
    suggestedSeoTitle: 'Cato the Elder Senate Closer – Carthago Delenda Est Mug',
    autocompleteSource: 'unverified',
    brief: {
      fourthwallTitle: 'Cato the Elder Senate Closer – Carthago Delenda Est Ceramic Mug',
      urlSlug: 'cato-the-elder-senate-closer-carthago-delenda-est-mug',
      imagePrompt:
        'Flat 2D vector archival 17th-century copperplate line etching on a solid pure #000000 black background, zero gradients, zero 3D mockup, crisp stippled ivory ink (#F5F0E6) and muted antique gold (#D97706) linework. Subject: An ornate Roman Republican senatorial seal featuring a classical laurel wreath, a shattered Punic amphora, and a curule chair at center. Chiseled Trajanic serif ribbon banner reading "CETERUM CENSEO CARTHAGINEM ESSE DELENDAM" above "SENATUS CONSULTUM · 149 B.C.". High-contrast museum plate aesthetic, isolated vector artwork.',
      layer1LoreHook:
        'No matter whether the Roman Senate was debating grain tariffs, aqueduct repairs, or road paving, Cato the Elder famously ended every single speech with one uncompromising demand: Furthermore, I consider that Carthage must be destroyed. Now you can bring that same relentless 2nd-century BC focus to your morning briefing.',
      layer2VisualBreakdown:
        'Rendered in authentic 17th-century copperplate stipple engraving, the emblem pairs a Roman curule magistrate chair with a fractured Punic trade amphora and chiseled Trajanic epigraphy dating to the eve of the Third Punic War (149 B.C.).',
      layer3Bullets: [
        'Heavyweight 11oz & 15oz obsidian-glazed ceramic mug engineered for high-contrast archival ink fidelity.',
        'Dishwasher and microwave safe with zero-fade kiln-cured typography built for daily seminar or office use.',
        'An unmistakable insider gift for Roman Republic historians, Latin teachers, and devotees of Cato’s stubborn rhetoric.',
      ],
      designAngle: 'Faux-Institution Crest',
      recommendedBlank: 'Mug',
    },
  },
  {
    id: 'opp-2',
    query: 'tabula peutingeriana desk mat',
    parentEntity: 'Tabula Peutingeriana',
    category: EntityCategory.ARTIFACTS_TEXTS,
    buyerIntentScore: 94,
    giftability: 'Exceptional',
    recommendedBlank: 'Desk Mat',
    designAngle: 'Patent Blueprint',
    suggestedSeoTitle: 'Cursus Publicus Imperial Road Network – Tabula Peutingeriana Desk Mat',
    autocompleteSource: 'unverified',
    brief: {
      fourthwallTitle: 'Cursus Publicus Imperial Road Network – Tabula Peutingeriana XL Desk Mat',
      urlSlug: 'cursus-publicus-imperial-road-network-tabula-peutingeriana-desk-mat',
      imagePrompt:
        'Flat 2D vector archival cartographic engraving on a solid pure #000000 black background, zero gradients, zero 3D shadows, crisp antique parchment ivory (#F5F0E6) and oxidised bronze (#D97706) fine technical linework. Subject: A panoramic horizontally elongated schematic Roman itinerarium map inspired by the Tabula Peutingeriana, showing jagged staging posts, Roman milestones, stylized personifications of Roma, Constantinople, and Antioch, and Latin distance numerals along the Cursus Publicus. Museum conservation plate border with corner registration marks.',
      layer1LoreHook:
        'Long before modern subway diagrams sacrificed geographic scale for pure routing clarity, Roman imperial couriers navigated from Hispania to the Ganges using the Tabula Peutingeriana—a twenty-two-foot schematic scroll of the Cursus Publicus. Spread the entire Mediterranean highway system across your workstation.',
      layer2VisualBreakdown:
        'Faithfully redrawn as a high-contrast dark-mode archival plate, this wide-format diagram preserves the medieval Vienna Codex staging-post zigzags, bathhouse icons, and league markers in razor-sharp ivory and bronze linework.',
      layer3Bullets: [
        'Generous 31.5" × 15.5" architectural desk mat surface accommodating mechanical keyboards, mice, and open Loeb Classical Library volumes.',
        'Micro-woven low-friction cloth top with precision anti-fray stitched perimeter and non-slip vulcanized rubber base.',
        'The definitive study upgrade for cartography collectors, classical philologists, and grand strategy gamers.',
      ],
      designAngle: 'Patent Blueprint',
      recommendedBlank: 'Desk Mat',
    },
  },
  {
    id: 'opp-3',
    query: 'varus give me back my legions shirt',
    parentEntity: 'Quinctilius Varus Give Me Back My Legions',
    category: EntityCategory.INSIDER_TERMS,
    buyerIntentScore: 92,
    giftability: 'Very High',
    recommendedBlank: 'Heavyweight Hoodie/Tee',
    designAngle: 'Archival Woodcut',
    suggestedSeoTitle: 'Teutoburg Forest 9 AD Lament – Varus Give Me Back My Legions Shirt',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-4',
    query: 'ides of march coin poster',
    parentEntity: 'Ides of March Denarius (EID MAR)',
    category: EntityCategory.ARTIFACTS_TEXTS,
    buyerIntentScore: 91,
    giftability: 'Very High',
    recommendedBlank: 'Museum Poster',
    designAngle: 'Archival Woodcut',
    suggestedSeoTitle: 'Brutus EID MAR Silver Denarius Plate – Ides of March Coin Poster',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-5',
    query: 'marcus aurelius meditations whiskey glass',
    parentEntity: 'Meditations Book IV',
    category: EntityCategory.ARTIFACTS_TEXTS,
    buyerIntentScore: 89,
    giftability: 'Exceptional',
    recommendedBlank: 'Rocks/Pint Glass',
    designAngle: 'Archival Woodcut',
    suggestedSeoTitle: 'Carnuntum Winter Camp Reflections – Marcus Aurelius Meditations Whiskey Glass',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-6',
    query: 'emperor aurelian restitutor orbis hoodie',
    parentEntity: 'Aurelian Restitutor Orbis',
    category: EntityCategory.ICONIC_FIGURES,
    buyerIntentScore: 88,
    giftability: 'Very High',
    recommendedBlank: 'Heavyweight Hoodie/Tee',
    designAngle: 'Faux-Institution Crest',
    suggestedSeoTitle: 'Restorer of the World 274 AD – Emperor Aurelian Restitutor Orbis Hoodie',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-7',
    query: 'latin teacher gifts tote bag',
    parentEntity: 'High School Latin Magister',
    category: EntityCategory.SUB_PROFESSIONS,
    buyerIntentScore: 86,
    giftability: 'Exceptional',
    recommendedBlank: 'Tote Bag',
    designAngle: 'Deadpan Identity Satire',
    suggestedSeoTitle: 'Department of Dead Languages & Ablative Absolutes – Latin Teacher Gifts Tote Bag',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-8',
    query: 'cave canem mosaic mug',
    parentEntity: 'Cave Canem Pompeii Mosaic',
    category: EntityCategory.ARTIFACTS_TEXTS,
    buyerIntentScore: 84,
    giftability: 'Very High',
    recommendedBlank: 'Mug',
    designAngle: 'Archival Woodcut',
    suggestedSeoTitle: 'House of the Tragic Poet Entryway – Cave Canem Mosaic Mug',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-9',
    query: 'cincinnatus gift poster',
    parentEntity: 'Lucius Quinctius Cincinnatus',
    category: EntityCategory.ICONIC_FIGURES,
    buyerIntentScore: 81,
    giftability: 'High',
    recommendedBlank: 'Museum Poster',
    designAngle: 'Archival Woodcut',
    suggestedSeoTitle: 'Sixteen Days of Absolute Power 458 BC – Cincinnatus Gift Poster',
    autocompleteSource: 'unverified',
  },
  {
    id: 'opp-10',
    query: 'crisis of the third century shirt',
    parentEntity: 'Crisis of the Third Century (235–284 AD)',
    category: EntityCategory.ERAS_MOVEMENTS,
    buyerIntentScore: 79,
    giftability: 'High',
    recommendedBlank: 'Heavyweight Hoodie/Tee',
    designAngle: 'Deadpan Identity Satire',
    suggestedSeoTitle: 'Twenty-Six Barracks Emperors Tour 235–284 AD – Crisis of the Third Century Shirt',
    autocompleteSource: 'unverified',
  },
];

export function buildDeterministicBrief(row: OpportunityRow): ProductBrief {
  if (row.brief) return row.brief;

  const cleanEntity = row.parentEntity;
  const cleanQuery = row.query;
  const slug = row.suggestedSeoTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const anglePrompts: Record<DesignAngle, string> = {
    'Archival Woodcut': `Flat 2D vector 16th-century museum woodcut & copperplate line etching on a solid pure #000000 black background, zero muddy gradients, zero 3D product mockups, crisp ivory parchment (#F5F0E6) and warm antique gold (#D97706) cross-hatched linework. Subject: Symmetrical archival illustration depicting "${cleanEntity}" with period-accurate iconography, botanical/architectural framing, and chiseled serif specimen typography below. Isolated flat vector artwork for print-on-demand.`,
    'Patent Blueprint': `Flat 2D vector 19th-century technical patent plate & cartographic diagram on a solid pure #000000 black background, zero gradients, zero 3D rendering, razor-sharp ivory (#F5F0E6) and amber-gold (#D97706) drafting lines. Subject: Annotated orthogonal elevation and cross-section schematic of "${cleanEntity}" complete with callout numerals (Fig. 1, Fig. 2), scale bar, compass rose, and archival plate header. Isolated flat vector artwork.`,
    'Faux-Institution Crest': `Flat 2D vector classical heraldic university department crest on a solid pure #000000 black background, zero gradients, zero 3D effects, crisp antique ivory (#F5F0E6) and burnished gold (#D97706) engraving lines. Subject: Ornate scholarly shield and laurel emblem for "${cleanEntity}" featuring classical tools of the discipline, ribbon scroll inscription, and founding date in monospace Roman numerals. Isolated flat vector artwork.`,
    'Deadpan Identity Satire': `Flat 2D vector vintage academic monograph title-page & woodcut vignette on a solid pure #000000 black background, zero gradients, zero 3D shadows, high-contrast ivory (#F5F0E6) and amber (#D97706) stipple linework. Subject: Deadpan scholarly treatise emblem celebrating "${cleanEntity}" with understated insider dry wit, museum catalog border rules, and crisp classical serif typography. Isolated flat vector artwork.`,
  };

  return {
    fourthwallTitle: row.suggestedSeoTitle,
    urlSlug: slug,
    imagePrompt: anglePrompts[row.designAngle] || anglePrompts['Archival Woodcut'],
    layer1LoreHook: `Every discipline has its canonical touchstones, and ${cleanEntity} stands as the ultimate insider shibboleth—instantly recognized by seasoned practitioners while remaining a mystery to the uninitiated. Designed specifically for buyers searching "${cleanQuery}", this piece elevates deep-cut historical lore into museum-grade everyday utility.`,
    layer2VisualBreakdown: `Executed in our signature ${row.designAngle} style on a pure obsidian canvas, the composition pairs high-precision stipple linework with archival specimen typography and period-verified reference details.`,
    layer3Bullets: [
      `Archival-grade ${row.recommendedBlank} crafted for crisp ivory-and-gold line fidelity against a deep dark-mode surface.`,
      `Engineered following the "${row.suggestedSeoTitle}" semantic structure to capture high-intent long-tail gift searchers.`,
      `An unmistakable conversation starter and scholarly gift for devotees of ${cleanEntity} and ${row.category}.`,
    ],
    designAngle: row.designAngle,
    recommendedBlank: row.recommendedBlank,
  };
}
