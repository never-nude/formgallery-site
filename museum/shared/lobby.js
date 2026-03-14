const DEFAULT_PREVIEW_DIRECTION = Object.freeze([1.58, 0.56, 1.72]);
const PREVIEW_TARGET_HEIGHT = 1.12;
const PREVIEW_PEDESTAL_HEIGHT = 0.16;
const PREVIEW_FOCUS_RATIO = 0.56;
const PREVIEW_SPIN = 0.16;
const VIEW_PARAM = "view";

const VIEW_OPTIONS = Object.freeze([
  {
    id: "rooms",
    label: "Curatorial rooms",
    note: "Keep the collection in its editorial rooms while surfacing a representative rotating preview in each one."
  },
  {
    id: "chronology",
    label: "Chronology",
    note: "Follow the collection from ancient kingdoms and classical antiquity through the nineteenth century."
  },
  {
    id: "region",
    label: "Region",
    note: "Survey the collection by cultural geography, from Egypt and Mesopotamia to Italy, France, Asia, and Sub-Saharan Africa."
  },
  {
    id: "tradition",
    label: "Tradition",
    note: "Trace lineages of form, devotion, court culture, and academic sculptural practice across the collection."
  },
  {
    id: "maker",
    label: "Maker",
    note: "Browse by named sculptor, workshop, or unknown hand to compare authorship and attribution across eras."
  },
  {
    id: "material",
    label: "Material",
    note: "Compare how bronze, stone, relief carving, plaster casts, and organic materials shape the collection’s surfaces."
  }
]);

const CHRONOLOGY_BANDS = Object.freeze([
  {
    id: "preclassical",
    title: "Ancient kingdoms",
    subtitle: "Early monumental and courtly forms before the classical Mediterranean canon.",
    maxYear: -500
  },
  {
    id: "classical",
    title: "Classical antiquity",
    subtitle: "Greek, Hellenistic, and Roman sculpture traditions, including celebrated later copies.",
    maxYear: 400
  },
  {
    id: "medieval",
    title: "Sacred and court traditions",
    subtitle: "Medieval and later devotional or court sculpture beyond the Mediterranean classical orbit.",
    maxYear: 1400
  },
  {
    id: "renaissance",
    title: "Renaissance",
    subtitle: "Italian humanism, revival, and sculptural naturalism from the fifteenth and sixteenth centuries.",
    maxYear: 1600
  },
  {
    id: "enlightenment",
    title: "Enlightenment and neoclassicism",
    subtitle: "Academic sculpture, courtly refinement, and revived classical form in the seventeenth and eighteenth centuries.",
    maxYear: 1800
  },
  {
    id: "nineteenth-century",
    title: "Nineteenth century",
    subtitle: "Industrial-era sculpture, museum casts, and the modern threshold before 1900.",
    maxYear: Infinity
  }
]);

const REGION_DEFINITIONS = Object.freeze({
  "Egypt & the Nile": {
    order: 10,
    subtitle: "Monumental Egyptian sculpture and Nile-world forms."
  },
  Mesopotamia: {
    order: 20,
    subtitle: "Assyrian and Near Eastern court sculpture and relief."
  },
  "Greek world": {
    order: 30,
    subtitle: "Greek and Hellenistic forms, including later casts and copy traditions."
  },
  "Roman world": {
    order: 40,
    subtitle: "Roman portraiture, imperial imagery, and later Roman copy traditions."
  },
  Asia: {
    order: 50,
    subtitle: "South and East Asian sacred and court sculpture."
  },
  "Sub-Saharan Africa": {
    order: 60,
    subtitle: "Devotional, ancestral, and prestige sculpture traditions from across Central and West Africa."
  },
  Italy: {
    order: 70,
    subtitle: "Italian Renaissance sculpture and later museum cast traditions."
  },
  France: {
    order: 80,
    subtitle: "French neoclassical, academic, and modern sculpture."
  },
  "Europe beyond Italy": {
    order: 90,
    subtitle: "European sculpture outside the current Italian and French clusters."
  }
});

const TRADITION_DEFINITIONS = Object.freeze({
  "Egyptian monumental sculpture": {
    order: 10,
    subtitle: "Stone and architectural sculpture shaped by pharaonic monumentality and afterlives."
  },
  "Assyrian court relief": {
    order: 20,
    subtitle: "Royal narrative carving and palace relief traditions of the ancient Near East."
  },
  "Greek and Hellenistic tradition": {
    order: 30,
    subtitle: "Heroic, athletic, and idealized figure traditions rooted in the Greek world."
  },
  "Roman sculpture and copy tradition": {
    order: 40,
    subtitle: "Imperial portraiture, Roman workshops, and the transmission of classical models."
  },
  "Asian sacred traditions": {
    order: 50,
    subtitle: "Sacred image-making, court patronage, and devotional sculptural lineages across Asia."
  },
  "Central African devotional traditions": {
    order: 60,
    subtitle: "Power, maternity, and ancestral presence in Central and West African sculpture."
  },
  "Italian Renaissance": {
    order: 70,
    subtitle: "Humanist sculptural revival, monumentality, and naturalism in the Italian Renaissance."
  },
  "French neoclassicism": {
    order: 80,
    subtitle: "Academic clarity, antique reference, and courtly refinement in eighteenth-century France."
  },
  "Modern sculpture": {
    order: 90,
    subtitle: "Late nineteenth-century modern sculptural form and expressive surfaces."
  }
});

const MATERIAL_DEFINITIONS = Object.freeze({
  "Bronze and metal": {
    order: 10,
    subtitle: "Works understood through metallic surfaces, from ancient bronzes to later casts."
  },
  "Stone and marble": {
    order: 20,
    subtitle: "Freestanding works rooted in stone, marble, or monumental carved surfaces."
  },
  "Relief and architectural carving": {
    order: 30,
    subtitle: "Carved narrative surfaces, relief panels, and architectural fragments."
  },
  "Plaster cast tradition": {
    order: 40,
    subtitle: "Museum casts and sculptural transmission through plaster reproductions."
  },
  "Wood, ivory, and organic materials": {
    order: 50,
    subtitle: "Objects shaped through wood, ivory, horn, or other organic sculptural media."
  }
});

let previewModulesPromise = null;
let previewCleanup = null;

function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function resolveLobbyEntry(entry, pieces) {
  if (typeof entry === "string") {
    const piece = pieces[entry];
    return {
      pieceId: entry,
      piece,
      href: piece?.path,
      title: piece?.lobbyTitle || piece?.viewerTitle,
      meta: piece?.lobbyMeta,
      note: piece?.lobbyNote
    };
  }

  if (entry?.pieceId) {
    const piece = pieces[entry.pieceId];
    return {
      pieceId: entry.pieceId,
      piece,
      href: entry.href || piece?.path,
      title: entry.title || piece?.lobbyTitle || piece?.viewerTitle,
      meta: entry.meta || piece?.lobbyMeta,
      note: entry.note || piece?.lobbyNote
    };
  }

  return entry;
}

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(piece) {
  return [
    piece.viewerTitle,
    piece.subtitle,
    piece.lobbyMeta,
    piece.source?.summary,
    piece.source?.note
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function cleanMakerLabel(value) {
  return value
    .replace(/^artist:\s*/i, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMakerLabel(piece) {
  const subtitle = piece.subtitle || "";

  if (/^artist:/i.test(subtitle)) {
    const label = cleanMakerLabel(subtitle).split(";")[0].trim();
    if (!label || /unknown/i.test(label) || /workshop/i.test(label)) {
      return "Unknown / workshop";
    }
    return label;
  }

  if (piece.sectionId === "michelangelo") return "Michelangelo Buonarroti";
  if (piece.sectionId === "bouchardon") return "Edme Bouchardon";
  if (piece.sectionId === "rodin") return "Auguste Rodin";
  if (piece.sectionId === "early-renaissance") return "Donatello";

  return "Unknown / workshop";
}

function approximateCenturyYear(century, era, qualifier = "") {
  const normalizedQualifier = qualifier.toLowerCase();
  const start = era === "bce" ? -century * 100 : (century - 1) * 100;
  const offset =
    normalizedQualifier.includes("late") ? 84 :
    normalizedQualifier.includes("mid") ? 50 :
    normalizedQualifier.includes("early") ? 16 :
    50;
  return start + offset;
}

function parseApproxYear(piece) {
  const text = `${piece.viewerTitle || ""} ${piece.subtitle || ""}`;

  if (/mid-19th\s+to\s+early\s+20th\s+century/i.test(text)) {
    return 1885;
  }

  const decadeMatch = text.match(/(\d{3,4})0s/i);
  if (decadeMatch) {
    return Number.parseInt(decadeMatch[1], 10) + 5;
  }

  const yearRangeMatch = text.match(/(\d{1,4})\s*[-–]\s*(\d{1,4})\s*(bce|ce)/i);
  if (yearRangeMatch) {
    const start = Number.parseInt(yearRangeMatch[1], 10);
    const end = Number.parseInt(yearRangeMatch[2], 10);
    const era = yearRangeMatch[3].toLowerCase();
    const signedStart = era === "bce" ? -start : start;
    const signedEnd = era === "bce" ? -end : end;
    return Math.round((signedStart + signedEnd) * 0.5);
  }

  const explicitYearMatch = text.match(/(\d{1,4})\s*(bce|ce)/i);
  if (explicitYearMatch) {
    const year = Number.parseInt(explicitYearMatch[1], 10);
    return explicitYearMatch[2].toLowerCase() === "bce" ? -year : year;
  }

  const centuryRangeMatch = text.match(
    /(early|mid|late)?-?\s*(\d{1,2})(?:st|nd|rd|th)\s+to\s+(early|mid|late)?-?\s*(\d{1,2})(?:st|nd|rd|th)\s+century/i
  );
  if (centuryRangeMatch) {
    const startYear = approximateCenturyYear(
      Number.parseInt(centuryRangeMatch[2], 10),
      "ce",
      centuryRangeMatch[1] || ""
    );
    const endYear = approximateCenturyYear(
      Number.parseInt(centuryRangeMatch[4], 10),
      "ce",
      centuryRangeMatch[3] || ""
    );
    return Math.round((startYear + endYear) * 0.5);
  }

  const centuryMatch = text.match(/(early|mid|late)?-?\s*(\d{1,2})(?:st|nd|rd|th)(?:-century)?(?:\s+type)?(?:\s+(bce|ce))?/i);
  if (centuryMatch && /century/i.test(text)) {
    const era = centuryMatch[3]?.toLowerCase() || "ce";
    return approximateCenturyYear(Number.parseInt(centuryMatch[2], 10), era, centuryMatch[1] || "");
  }

  const plainYearRange = text.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (plainYearRange) {
    return Math.round((Number.parseInt(plainYearRange[1], 10) + Number.parseInt(plainYearRange[2], 10)) * 0.5);
  }

  const plainYear = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  if (plainYear) {
    return Number.parseInt(plainYear[1], 10);
  }

  return null;
}

function formatApproxYear(year) {
  if (year == null) return "Date uncertain";
  const rounded = Math.round(year);
  return rounded < 0 ? `${Math.abs(rounded)} BCE` : `${rounded} CE`;
}

function formatYearRange(entries) {
  const years = entries.map((entry) => parseApproxYear(entry.piece)).filter((value) => value != null);
  if (!years.length) return "Date range pending";
  const min = Math.min(...years);
  const max = Math.max(...years);
  if (min === max) return formatApproxYear(min);
  return `${formatApproxYear(min)} – ${formatApproxYear(max)}`;
}

function formatPieceCount(count) {
  return `${count} ${count === 1 ? "piece" : "pieces"}`;
}

function sortEntriesByCollectionOrder(a, b) {
  const aOrder = a.piece?.sortOrder ?? 9999;
  const bOrder = b.piece?.sortOrder ?? 9999;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  return (a.title || "").localeCompare(b.title || "", undefined, { numeric: true });
}

function sortEntriesByYear(a, b) {
  const aYear = parseApproxYear(a.piece);
  const bYear = parseApproxYear(b.piece);
  if (aYear != null && bYear != null && aYear !== bYear) {
    return aYear - bYear;
  }
  if (aYear == null && bYear != null) return 1;
  if (aYear != null && bYear == null) return -1;
  return sortEntriesByCollectionOrder(a, b);
}

function getChronologyBand(piece) {
  const year = parseApproxYear(piece);
  for (const band of CHRONOLOGY_BANDS) {
    if (year == null || year <= band.maxYear) {
      return band;
    }
  }
  return CHRONOLOGY_BANDS[CHRONOLOGY_BANDS.length - 1];
}

function getRegionLabel(piece) {
  const text = normalizeText(piece);

  if (piece.sectionId === "asia") return "Asia";
  if (piece.sectionId === "sub-saharan-africa") return "Sub-Saharan Africa";
  if (piece.sectionId === "early-renaissance" || piece.sectionId === "michelangelo") return "Italy";
  if (piece.sectionId === "bouchardon" || piece.sectionId === "rodin") return "France";

  if (/egypt|giza|sphinx/.test(text)) return "Egypt & the Nile";
  if (/assyrian|nimrud|nineveh|mesopotamia/.test(text)) return "Mesopotamia";
  if (/roman|prima porta|germanicus|capitoline|belvedere torso|ludovisi/.test(text)) return "Roman world";
  if (/delphi|artemision|athena|discobolus|milo|laocoon|gaul|greek|hellenistic/.test(text)) return "Greek world";

  return "Europe beyond Italy";
}

function getTraditionLabel(piece) {
  const region = getRegionLabel(piece);

  if (piece.sectionId === "asia") return "Asian sacred traditions";
  if (piece.sectionId === "sub-saharan-africa") return "Central African devotional traditions";
  if (piece.sectionId === "early-renaissance" || piece.sectionId === "michelangelo") return "Italian Renaissance";
  if (piece.sectionId === "bouchardon") return "French neoclassicism";
  if (piece.sectionId === "rodin") return "Modern sculpture";

  if (region === "Egypt & the Nile") return "Egyptian monumental sculpture";
  if (region === "Mesopotamia") return "Assyrian court relief";
  if (region === "Roman world") return "Roman sculpture and copy tradition";
  if (region === "Greek world") return "Greek and Hellenistic tradition";

  return "European sculptural tradition";
}

function getMaterialLabel(piece) {
  const text = normalizeText(piece);

  if (/relief|throne|panel|stele|orthostat/.test(text) || piece.scene?.showPedestal === false) {
    return "Relief and architectural carving";
  }
  if (/bronze|copper|gilt|metal/.test(text) || (piece.material?.metalness ?? 0) > 0.55) {
    return "Bronze and metal";
  }
  if (/wood|ivory|tusk|horn|organic|kongo/.test(text)) {
    return "Wood, ivory, and organic materials";
  }
  if (/plaster cast|cast after/.test(text)) {
    return "Plaster cast tradition";
  }

  return "Stone and marble";
}

function buildBaseEntries(lobby, pieces) {
  const entries = [];

  for (const section of lobby.sections || []) {
    for (const rawEntry of section.items || []) {
      const entry = resolveLobbyEntry(rawEntry, pieces);
      if (!entry?.piece || entry.piece.hiddenFromLobby) continue;
      entries.push(entry);
    }
  }

  return entries.sort(sortEntriesByCollectionOrder);
}

function pickFeaturedEntry(entries) {
  const previewable = entries.filter((entry) => entry?.piece && entry.piece.kind !== "sketchfab");
  const ideal = previewable.find((entry) => {
    const text = normalizeText(entry.piece);
    return entry.piece.scene?.showPedestal !== false && !/relief|panel|stele|throne/.test(text);
  });
  return ideal || previewable[0] || entries[0] || null;
}

function buildStaticSections(lobby, pieces) {
  return (lobby.sections || [])
    .map((section, index) => {
      const items = (section.items || [])
        .map((entry) => resolveLobbyEntry(entry, pieces))
        .filter((entry) => entry?.piece && !entry.piece.hiddenFromLobby)
        .sort(sortEntriesByCollectionOrder);

      return {
        id: section.id,
        anchor: `rooms-${slugify(section.title)}`,
        title: section.title,
        subtitle: section.subtitle,
        rangeLabel: formatYearRange(items),
        order: index,
        tone: index % 4,
        items,
        featuredEntry: pickFeaturedEntry(items)
      };
    })
    .filter((section) => section.items.length > 0);
}

function buildGroupedSections(entries, viewId) {
  const groups = new Map();

  for (const entry of entries) {
    let id;
    let title;
    let subtitle;
    let order;

    if (viewId === "chronology") {
      const band = getChronologyBand(entry.piece);
      id = band.id;
      title = band.title;
      subtitle = band.subtitle;
      order = CHRONOLOGY_BANDS.findIndex((item) => item.id === band.id);
    } else if (viewId === "region") {
      title = getRegionLabel(entry.piece);
      const definition = REGION_DEFINITIONS[title] || REGION_DEFINITIONS["Europe beyond Italy"];
      id = slugify(title);
      subtitle = definition.subtitle;
      order = definition.order;
    } else if (viewId === "tradition") {
      title = getTraditionLabel(entry.piece);
      const definition = TRADITION_DEFINITIONS[title] || {
        order: 999,
        subtitle: "Works grouped by broad sculptural lineage."
      };
      id = slugify(title);
      subtitle = definition.subtitle;
      order = definition.order;
    } else if (viewId === "maker") {
      title = extractMakerLabel(entry.piece);
      id = slugify(title);
      subtitle =
        title === "Unknown / workshop"
          ? "Works without a named sculptor or with workshop-level attribution."
          : "Works grouped under a named sculptor or attributed maker.";
      order = title === "Unknown / workshop" ? 999 : 0;
    } else if (viewId === "material") {
      title = getMaterialLabel(entry.piece);
      const definition = MATERIAL_DEFINITIONS[title] || {
        order: 999,
        subtitle: "Works grouped by prevailing material character."
      };
      id = slugify(title);
      subtitle = definition.subtitle;
      order = definition.order;
    } else {
      continue;
    }

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        anchor: `${viewId}-${id}`,
        title,
        subtitle,
        order,
        tone: groups.size % 4,
        items: []
      });
    }

    groups.get(id).items.push(entry);
  }

  return Array.from(groups.values())
    .map((section) => {
      section.items.sort(viewId === "chronology" ? sortEntriesByYear : sortEntriesByCollectionOrder);
      if (viewId === "maker") {
        section.order = section.title === "Unknown / workshop" ? 999 : -section.items.length;
      }
      section.rangeLabel = formatYearRange(section.items);
      section.featuredEntry = pickFeaturedEntry(section.items);
      return section;
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (viewId === "maker") {
        if (a.items.length !== b.items.length) return b.items.length - a.items.length;
      }
      return a.title.localeCompare(b.title);
    });
}

function buildCollectionViews(lobby, pieces) {
  const baseEntries = buildBaseEntries(lobby, pieces);

  return {
    rooms: {
      option: VIEW_OPTIONS.find((view) => view.id === "rooms"),
      sections: buildStaticSections(lobby, pieces)
    },
    chronology: {
      option: VIEW_OPTIONS.find((view) => view.id === "chronology"),
      sections: buildGroupedSections(baseEntries, "chronology")
    },
    region: {
      option: VIEW_OPTIONS.find((view) => view.id === "region"),
      sections: buildGroupedSections(baseEntries, "region")
    },
    tradition: {
      option: VIEW_OPTIONS.find((view) => view.id === "tradition"),
      sections: buildGroupedSections(baseEntries, "tradition")
    },
    maker: {
      option: VIEW_OPTIONS.find((view) => view.id === "maker"),
      sections: buildGroupedSections(baseEntries, "maker")
    },
    material: {
      option: VIEW_OPTIONS.find((view) => view.id === "material"),
      sections: buildGroupedSections(baseEntries, "material")
    }
  };
}

function buildLobbyStats(views, activeView) {
  const allEntries = views.rooms.sections.flatMap((section) => section.items);
  const regionCount = views.region.sections.length;
  const makerCount = views.maker.sections.length;

  return [
    {
      kicker: "Collection",
      value: `${allEntries.length}`,
      label: "Works on view"
    },
    {
      kicker: "Current view",
      value: `${activeView.sections.length}`,
      label: `${activeView.option.label} groups`
    },
    {
      kicker: "Regions",
      value: `${regionCount}`,
      label: "Geographies represented"
    },
    {
      kicker: "Makers",
      value: `${makerCount}`,
      label: "Named hands and workshops"
    }
  ];
}

function entryKickerForView(entry, viewId) {
  if (!entry?.piece) return "Sculpture";

  if (viewId === "chronology") return formatApproxYear(parseApproxYear(entry.piece));
  if (viewId === "region") return getTraditionLabel(entry.piece);
  if (viewId === "tradition") return getRegionLabel(entry.piece);
  if (viewId === "maker") return getRegionLabel(entry.piece);
  if (viewId === "material") return extractMakerLabel(entry.piece);

  return extractMakerLabel(entry.piece);
}

function renderPreview(entry) {
  if (!entry?.piece || entry.piece.kind === "sketchfab") {
    return `
      <div class="section-preview-shell">
        <div class="section-preview section-preview-empty">
          <div class="section-preview-fallback">
            <p class="section-preview-label">Preview unavailable</p>
            <p class="section-preview-copy">This group currently opens with a non-native source.</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="section-preview-shell">
      <div class="section-preview" data-piece-id="${escapeHtml(entry.pieceId)}" data-kind="${escapeHtml(entry.piece.kind)}">
        <div class="section-preview-loading">
          <p class="section-preview-label">Rotating preview</p>
          <p class="section-preview-copy">${escapeHtml(entry.title)}</p>
        </div>
      </div>
      <div class="section-preview-meta">
        <p class="section-preview-label">Featured work</p>
        <p class="section-preview-title">${escapeHtml(entry.title)}</p>
      </div>
    </div>
  `;
}

function renderEntry(entry, viewId) {
  return `
    <li>
      <a class="piece" href="${escapeHtml(entry.href)}">
        <div class="piece-copy">
          <p class="piece-kicker">${escapeHtml(entryKickerForView(entry, viewId))}</p>
          <h3 class="piece-title">${escapeHtml(entry.title)}</h3>
          ${entry.meta ? `<p class="piece-meta">${escapeHtml(entry.meta)}</p>` : ""}
          ${entry.note ? `<p class="piece-note">${escapeHtml(entry.note)}</p>` : ""}
        </div>
        <div class="piece-footer">
          <span class="piece-arrow">View piece</span>
        </div>
      </a>
    </li>
  `;
}

function renderSection(section, viewId, index) {
  return `
    <section class="lobby-section" id="${escapeHtml(section.anchor)}" data-tone="${index % 4}">
      ${renderPreview(section.featuredEntry)}
      <header class="section-header">
        <div>
          <p class="section-kicker">${escapeHtml(viewId === "rooms" ? "Gallery" : VIEW_OPTIONS.find((view) => view.id === viewId)?.label || "Collection")}</p>
          <h2 class="section-title">${escapeHtml(section.title)}</h2>
          ${section.subtitle ? `<p class="section-sub">${escapeHtml(section.subtitle)}</p>` : ""}
          <p class="section-range">${escapeHtml(section.rangeLabel)}</p>
        </div>
        <p class="section-count">${escapeHtml(formatPieceCount(section.items.length))}</p>
      </header>
      <ol class="list">
        ${section.items.map((entry) => renderEntry(entry, viewId)).join("")}
      </ol>
    </section>
  `;
}

function renderSelect(activeViewId) {
  return `
    <label class="lobby-view-field" for="collection-view">
      <span class="lobby-view-label">View collection by</span>
      <span class="lobby-view-select-wrap">
        <select id="collection-view" class="lobby-view-select">
          ${VIEW_OPTIONS.map((option) => `
            <option value="${escapeHtml(option.id)}" ${option.id === activeViewId ? "selected" : ""}>${escapeHtml(option.label)}</option>
          `).join("")}
        </select>
      </span>
    </label>
  `;
}

function renderMuseumLobbyApp(lobby, views, activeViewId) {
  const activeView = views[activeViewId] || views.rooms;
  const stats = buildLobbyStats(views, activeView);

  return `
    <div class="app lobby-app" data-collection-view="${escapeHtml(activeViewId)}">
      <div class="panel lobby-panel">
        <div class="lobby-panel-inner">
          <div class="lobby-hero">
            <div class="lobby-copy">
              <div class="lobby-brand">
                <span class="lobby-brand-mark" aria-hidden="true">
                  <img src="/museum/shared/form-gallery-mark.svg" alt="" />
                </span>
                <span class="lobby-brand-copy">
                  <span class="lobby-brand-name">${escapeHtml(lobby.title || "Form Gallery")}</span>
                  <span class="lobby-brand-context">Museum Lobby</span>
                </span>
              </div>
              <h1 class="title lobby-title">Museum Lobby</h1>
              <p class="sub lobby-sub">${escapeHtml(lobby.subtitle || "")}</p>
            </div>
            <div class="lobby-stats">
              ${stats.map((stat) => `
                <article class="lobby-stat">
                  <p class="lobby-stat-kicker">${escapeHtml(stat.kicker)}</p>
                  <p class="lobby-stat-value">${escapeHtml(stat.value)}</p>
                  <p class="lobby-stat-label">${escapeHtml(stat.label)}</p>
                </article>
              `).join("")}
            </div>
          </div>
          <div class="lobby-viewbar">
            ${renderSelect(activeViewId)}
            <p class="lobby-view-note">${escapeHtml(activeView.option.note)}</p>
          </div>
          <div class="lobby-jumps" aria-label="Jump to collection groups">
            ${activeView.sections.map((section) => `
              <a class="lobby-jump" href="#${escapeHtml(section.anchor)}">
                <span class="lobby-jump-label">${escapeHtml(section.title)}</span>
                <span class="lobby-jump-count">${section.items.length}</span>
              </a>
            `).join("")}
          </div>
        </div>
      </div>
      <main class="stage">
        <div class="lobby-grid">
          ${activeView.sections.map((section, index) => renderSection(section, activeViewId, index)).join("")}
        </div>
      </main>
    </div>
  `;
}

function getPreviewModules() {
  if (!previewModulesPromise) {
    previewModulesPromise = (async () => {
      const THREE = await import("https://esm.sh/three@0.161.0?bundle");
      const { STLLoader } = await import("https://esm.sh/three@0.161.0/examples/jsm/loaders/STLLoader.js?bundle");
      const { GLTFLoader } = await import("https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js?bundle");
      const { DRACOLoader } = await import("https://esm.sh/three@0.161.0/examples/jsm/loaders/DRACOLoader.js?bundle");
      const { RoomEnvironment } = await import("https://esm.sh/three@0.161.0/examples/jsm/environments/RoomEnvironment.js?bundle");
      const { mergeVertices } = await import("https://esm.sh/three@0.161.0/examples/jsm/utils/BufferGeometryUtils.js?bundle");

      return { THREE, STLLoader, GLTFLoader, DRACOLoader, RoomEnvironment, mergeVertices };
    })();
  }

  return previewModulesPromise;
}

function normalizeUrls(urlOrUrls) {
  if (!urlOrUrls) return [];
  return Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
}

function resolvePreviewUrls(piece) {
  const model = piece.model || {};
  return normalizeUrls(model.fallbackUrl || model.primaryUrl || model.url);
}

function resolveColor(THREE, value) {
  return value instanceof THREE.Color ? value : new THREE.Color(value);
}

async function loadFirstAvailable(urls, loadFn) {
  let lastError = null;

  for (const url of urls) {
    try {
      return await loadFn(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No preview source could be loaded.");
}

function solveLinear3x3(matrix, vector) {
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let pivotIndex = 0; pivotIndex < 3; pivotIndex += 1) {
    let pivotRow = pivotIndex;
    for (let row = pivotIndex + 1; row < 3; row += 1) {
      if (Math.abs(augmented[row][pivotIndex]) > Math.abs(augmented[pivotRow][pivotIndex])) {
        pivotRow = row;
      }
    }

    const pivotValue = augmented[pivotRow][pivotIndex];
    if (Math.abs(pivotValue) < 1e-8) {
      return null;
    }

    if (pivotRow !== pivotIndex) {
      [augmented[pivotIndex], augmented[pivotRow]] = [augmented[pivotRow], augmented[pivotIndex]];
    }

    for (let row = pivotIndex + 1; row < 3; row += 1) {
      const factor = augmented[row][pivotIndex] / augmented[pivotIndex][pivotIndex];
      for (let column = pivotIndex; column < 4; column += 1) {
        augmented[row][column] -= augmented[pivotIndex][column] * factor;
      }
    }
  }

  const solution = [0, 0, 0];
  for (let row = 2; row >= 0; row -= 1) {
    let value = augmented[row][3];
    for (let column = row + 1; column < 3; column += 1) {
      value -= augmented[row][column] * solution[column];
    }
    solution[row] = value / augmented[row][row];
  }

  return solution;
}

function fitBottomPlaneNormal(points, THREE) {
  if (points.length < 3) return null;

  let sumXX = 0;
  let sumXZ = 0;
  let sumX = 0;
  let sumZZ = 0;
  let sumZ = 0;
  let sumXY = 0;
  let sumZY = 0;
  let sumY = 0;

  for (const point of points) {
    const { x, y, z } = point;
    sumXX += x * x;
    sumXZ += x * z;
    sumX += x;
    sumZZ += z * z;
    sumZ += z;
    sumXY += x * y;
    sumZY += z * y;
    sumY += y;
  }

  const coefficients = solveLinear3x3(
    [
      [sumXX, sumXZ, sumX],
      [sumXZ, sumZZ, sumZ],
      [sumX, sumZ, points.length]
    ],
    [sumXY, sumZY, sumY]
  );

  if (!coefficients) return null;

  const [a, b] = coefficients;
  const normal = new THREE.Vector3(-a, 1, -b).normalize();
  if (normal.y < 0) {
    normal.multiplyScalar(-1);
  }
  return normal;
}

function collectBottomPlaneNormal(root, THREE, options = {}) {
  const sampledPoints = [];
  let vertexCount = 0;

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const positions = child.geometry.getAttribute("position");
    if (!positions) return;
    vertexCount += positions.count;
  });

  if (vertexCount < 3) return null;

  const maxSamples = options.maxSamples ?? 12000;
  const stride = Math.max(1, Math.ceil(vertexCount / maxSamples));
  const temp = new THREE.Vector3();
  let sampledIndex = 0;
  let minY = Infinity;
  let maxY = -Infinity;

  root.updateMatrixWorld(true);

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const positions = child.geometry.getAttribute("position");
    if (!positions) return;

    for (let index = 0; index < positions.count; index += 1) {
      if (sampledIndex % stride !== 0) {
        sampledIndex += 1;
        continue;
      }

      sampledIndex += 1;
      temp.fromBufferAttribute(positions, index).applyMatrix4(child.matrixWorld);
      sampledPoints.push({ x: temp.x, y: temp.y, z: temp.z });
      minY = Math.min(minY, temp.y);
      maxY = Math.max(maxY, temp.y);
    }
  });

  if (sampledPoints.length < 3) return null;

  const height = Math.max(maxY - minY, 1e-6);
  const sortedY = sampledPoints.map((point) => point.y).sort((a, b) => a - b);
  const percentile = options.bottomPercentile ?? 0.015;
  const percentileIndex = Math.min(sortedY.length - 1, Math.floor(sortedY.length * percentile));
  const bottomStart = sortedY[percentileIndex];
  const bottomRatio = options.bottomRatio ?? 0.04;
  const threshold = bottomStart + height * bottomRatio;
  const bottomPoints = sampledPoints.filter((point) => point.y <= threshold);

  return fitBottomPlaneNormal(bottomPoints, THREE);
}

function computePreviewDirection(THREE, piece, mount) {
  const vector =
    mount.clientWidth < 380 && piece.scene?.mobileViewVector
      ? piece.scene.mobileViewVector
      : piece.scene?.defaultViewVector || DEFAULT_PREVIEW_DIRECTION;
  const direction = new THREE.Vector3(...vector);
  if (direction.lengthSq() < 1e-6) {
    return new THREE.Vector3(...DEFAULT_PREVIEW_DIRECTION).normalize();
  }
  return direction.normalize();
}

function createPreviewEnvironment({ THREE, RoomEnvironment, renderer, piece, mount }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.01, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.02).texture;

  const hemi = new THREE.HemisphereLight(0xfffbf4, 0xc7b7a4, 0.88);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff7ea, piece.defaults?.lightPower || 2.1);
  keyLight.position.set(2.5, 3.8, 2.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -2.5;
  keyLight.shadow.camera.right = 2.5;
  keyLight.shadow.camera.top = 2.5;
  keyLight.shadow.camera.bottom = -2.5;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 14;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf5ede0, 1.2);
  fillLight.position.set(-2.2, 2.1, 2.2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xe2ebf5, 0.82);
  rimLight.position.set(-2.4, 2.7, -2.1);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.55, 96),
    new THREE.MeshStandardMaterial({
      color: 0xe8dece,
      roughness: 0.95,
      metalness: 0.0
    })
  );
  floor.rotation.x = -Math.PI * 0.5;
  floor.receiveShadow = true;
  scene.add(floor);

  const showPedestal = piece.scene?.showPedestal ?? true;
  const pedestalHeight = showPedestal ? PREVIEW_PEDESTAL_HEIGHT : 0.02;

  if (showPedestal) {
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.5, pedestalHeight, 72),
      new THREE.MeshStandardMaterial({
        color: 0xd2c3b2,
        roughness: 0.84,
        metalness: 0.02
      })
    );
    pedestal.position.y = pedestalHeight * 0.5;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
  }

  pmrem.dispose();
  return { scene, camera, pedestalHeight };
}

function getPreviewTargetHeight(piece) {
  return Math.min(piece.scene?.targetHeight || PREVIEW_TARGET_HEIGHT, 1.48);
}

function framePreview({ THREE, camera, sculpture, piece, pedestalHeight, mount }) {
  const focusYRatio = piece.scene?.focusYRatio ?? PREVIEW_FOCUS_RATIO;
  const targetHeight = getPreviewTargetHeight(piece);
  const box = new THREE.Box3().setFromObject(sculpture);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const target = new THREE.Vector3(0, pedestalHeight + targetHeight * focusYRatio, 0);
  const direction = computePreviewDirection(THREE, piece, mount);
  const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = (sphere.radius / Math.sin(halfFov)) * 1.16;

  camera.position.copy(target.clone().addScaledVector(direction, distance));
  camera.lookAt(target);
}

async function mountStlPreview({ mount, piece, modules }) {
  const { THREE, STLLoader, RoomEnvironment, mergeVertices } = modules;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = piece.defaults?.exposure || 0.42;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const { scene, camera, pedestalHeight } = createPreviewEnvironment({ THREE, RoomEnvironment, renderer, piece, mount });
  const urls = resolvePreviewUrls(piece);
  const loader = new STLLoader();
  let geometry = await loadFirstAvailable(urls, (url) => loader.loadAsync(url));

  const rotateX = piece.scene?.rotateX ?? -Math.PI * 0.5;
  const rotateY = piece.scene?.rotateY ?? 0;
  const rotateZ = piece.scene?.rotateZ ?? 0;

  if (rotateX) geometry.rotateX(rotateX);
  if (rotateY) geometry.rotateY(rotateY);
  if (rotateZ) geometry.rotateZ(rotateZ);

  const vertexCount = geometry.attributes.position?.count || 0;
  if (vertexCount < 1_800_000) {
    geometry = mergeVertices(geometry, 1e-4);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -box.min.y, -center.z);

  const materialConfig = {
    color: "#ece3d3",
    metalness: 0.0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.38,
    sheen: 0.22,
    sheenRoughness: 0.8,
    sheenColor: "#fff2df",
    reflectivity: 0.38,
    ...(piece.material || {})
  };

  const sculptureMaterial = new THREE.MeshPhysicalMaterial({
    color: resolveColor(THREE, materialConfig.color),
    roughness: piece.defaults?.rough ?? 0.2,
    metalness: materialConfig.metalness,
    clearcoat: materialConfig.clearcoat,
    clearcoatRoughness: materialConfig.clearcoatRoughness,
    sheen: materialConfig.sheen,
    sheenRoughness: materialConfig.sheenRoughness,
    sheenColor: resolveColor(THREE, materialConfig.sheenColor),
    reflectivity: materialConfig.reflectivity
  });

  const sculpture = new THREE.Mesh(geometry, sculptureMaterial);
  const scale = getPreviewTargetHeight(piece) / size.y;
  sculpture.scale.setScalar(scale);
  sculpture.rotation.y = piece.scene?.defaultYaw ?? 0;
  sculpture.position.y = pedestalHeight + (piece.scene?.previewSeatOffset ?? 0);
  sculpture.castShadow = true;
  sculpture.receiveShadow = true;
  scene.add(sculpture);

  framePreview({ THREE, camera, sculpture, piece, pedestalHeight, mount });
  return { renderer, scene, camera, sculpture };
}

function disposeMaterials(material) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose?.());
    return;
  }
  material?.dispose?.();
}

async function mountGltfPreview({ mount, piece, modules }) {
  const { THREE, GLTFLoader, DRACOLoader, RoomEnvironment } = modules;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = piece.defaults?.exposure || 0.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const { scene, camera, pedestalHeight } = createPreviewEnvironment({ THREE, RoomEnvironment, renderer, piece, mount });
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
  loader.setDRACOLoader(dracoLoader);

  const urls = resolvePreviewUrls(piece);
  const gltf = await loadFirstAvailable(urls, (url) => loader.loadAsync(url));
  const root = gltf.scene || gltf.scenes?.[0];
  if (!root) {
    dracoLoader.dispose();
    throw new Error("No scene graph was found in the glTF preview.");
  }

  const rawGroup = new THREE.Group();
  rawGroup.add(root);
  rawGroup.rotation.set(piece.scene?.rotateX ?? 0, piece.scene?.rotateY ?? 0, piece.scene?.rotateZ ?? 0);
  rawGroup.updateMatrixWorld(true);

  if (piece.scene?.autoLevel) {
    const bottomNormal = collectBottomPlaneNormal(rawGroup, THREE, {
      maxSamples: piece.scene?.autoLevelMaxSamples,
      bottomPercentile: piece.scene?.autoLevelBottomPercentile,
      bottomRatio: piece.scene?.autoLevelBottomRatio
    });
    if (bottomNormal) {
      const levelQuaternion = new THREE.Quaternion().setFromUnitVectors(bottomNormal, new THREE.Vector3(0, 1, 0));
      rawGroup.applyQuaternion(levelQuaternion);
      rawGroup.updateMatrixWorld(true);
    }
  }

  rawGroup.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });

  const rawBox = new THREE.Box3().setFromObject(rawGroup);
  const size = rawBox.getSize(new THREE.Vector3());
  const center = rawBox.getCenter(new THREE.Vector3());
  rawGroup.position.set(-center.x, -rawBox.min.y, -center.z);

  const sculpture = new THREE.Group();
  sculpture.add(rawGroup);
  const scale = getPreviewTargetHeight(piece) / size.y;
  sculpture.scale.setScalar(scale);
  sculpture.rotation.y = piece.scene?.defaultYaw ?? 0;
  sculpture.position.y = pedestalHeight + (piece.scene?.verticalOffset ?? 0) + (piece.scene?.previewSeatOffset ?? 0);
  scene.add(sculpture);

  framePreview({ THREE, camera, sculpture, piece, pedestalHeight, mount });
  dracoLoader.dispose();
  return { renderer, scene, camera, sculpture };
}

async function createPreviewInstance(mount, piece) {
  const modules = await getPreviewModules();
  const builder = piece.kind === "gltf" ? mountGltfPreview : piece.kind === "stl" ? mountStlPreview : null;
  if (!builder) {
    throw new Error(`Unsupported preview kind: ${piece.kind}`);
  }

  const instance = await builder({ mount, piece, modules });
  const { renderer, scene, camera, sculpture } = instance;
  const baseYaw = sculpture.rotation.y;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spin = reduceMotion ? 0 : piece.scene?.previewSpin ?? PREVIEW_SPIN;
  const loading = mount.querySelector(".section-preview-loading");
  if (loading) {
    loading.remove();
  }

  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  let running = false;
  let disposed = false;

  const renderFrame = (time) => {
    if (disposed) return;
    sculpture.rotation.y = baseYaw + (spin ? time * 0.001 * spin : 0);
    renderer.render(scene, camera);
  };

  function resize() {
    if (disposed) return;
    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function start() {
    if (running || disposed) return;
    running = true;
    renderer.setAnimationLoop(renderFrame);
  }

  function stop() {
    if (!running) return;
    running = false;
    renderer.setAnimationLoop(null);
  }

  function destroy() {
    if (disposed) return;
    stop();
    disposed = true;
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.geometry?.dispose?.();
      disposeMaterials(child.material);
    });
    renderer.dispose();
    mount.innerHTML = "";
  }

  resize();
  return { start, stop, resize, destroy };
}

function initLobbyPreviews(pieces) {
  const mounts = [...document.querySelectorAll(".section-preview[data-piece-id]")];
  if (!mounts.length) {
    return () => {};
  }

  const instances = new Map();
  const visible = new Set();
  let disposed = false;

  const ensureInstance = async (mount) => {
    if (disposed) return null;
    if (instances.has(mount)) return instances.get(mount);

    const piece = pieces[mount.dataset.pieceId];
    if (!piece) return null;

    try {
      const instance = await createPreviewInstance(mount, piece);
      if (disposed) {
        instance.destroy();
        return null;
      }
      instances.set(mount, instance);
      if (document.visibilityState === "visible" && visible.has(mount)) {
        instance.start();
      }
      return instance;
    } catch (error) {
      console.error(error);
      mount.innerHTML = `
        <div class="section-preview-fallback">
          <p class="section-preview-label">Preview unavailable</p>
          <p class="section-preview-copy">The live object preview could not be initialized.</p>
        </div>
      `;
      return null;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const mount = entry.target;
        if (entry.isIntersecting) {
          visible.add(mount);
          ensureInstance(mount).then((instance) => {
            if (instance && document.visibilityState === "visible") {
              instance.start();
            }
          });
        } else {
          visible.delete(mount);
          instances.get(mount)?.stop();
        }
      }
    },
    { rootMargin: "160px 0px" }
  );

  mounts.forEach((mount) => observer.observe(mount));

  const handleResize = () => {
    instances.forEach((instance) => instance.resize());
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      visible.forEach((mount) => instances.get(mount)?.start());
      return;
    }
    instances.forEach((instance) => instance.stop());
  };

  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    disposed = true;
    observer.disconnect();
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
    instances.forEach((instance) => instance.destroy());
    instances.clear();
  };
}

function getInitialViewId() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get(VIEW_PARAM);
  if (VIEW_OPTIONS.some((option) => option.id === requested)) {
    return requested;
  }
  return "rooms";
}

function syncViewParam(viewId) {
  const url = new URL(window.location.href);
  if (viewId === "rooms") {
    url.searchParams.delete(VIEW_PARAM);
  } else {
    url.searchParams.set(VIEW_PARAM, viewId);
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function renderMuseumLobby(lobby, pieces) {
  const views = buildCollectionViews(lobby, pieces);
  const baseTitle = lobby.pageTitle || lobby.title || "Form Gallery";
  document.title = `${baseTitle} — Museum Lobby`;

  const render = (viewId) => {
    if (previewCleanup) {
      previewCleanup();
      previewCleanup = null;
    }

    const activeViewId = views[viewId] ? viewId : "rooms";
    syncViewParam(activeViewId);
    document.body.innerHTML = renderMuseumLobbyApp(lobby, views, activeViewId);

    const select = document.getElementById("collection-view");
    if (select) {
      select.addEventListener("change", (event) => {
        render(event.target.value);
      });
    }

    previewCleanup = initLobbyPreviews(pieces);
  };

  render(getInitialViewId());
}
