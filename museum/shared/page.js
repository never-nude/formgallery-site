const MODULE_VERSION = "20260315-2340";

let catalogPromise = null;
const COLLECTION_DESCRIPTION = "Form Gallery is a digital sculpture collection spanning antiquity through the twenty-first century. Browse by gallery, era, region, or maker.";

const MEDIUM_BY_PIECE = Object.freeze({
  sphinx: "Limestone",
  "ashurnasirpal-lion-hunt": "Alabaster relief",
  "lion-released-from-cage": "Alabaster relief",
  "goryeo-avalokiteshvara": "Carved wood with applied jewelry",
  "sapi-portuguese-hunting-horn": "Ivory, metal",
  "loango-ivory-tusk-female-finial": "Ivory, wood",
  "loango-ivory-tusk-seated-european-finial": "Ivory, wood",
  "loango-ivory-tusk-trade-scenes": "Ivory",
  "kongo-maternity-figure": "Wood, glass, glass beads, brass tacks, pigment",
  "charioteer-of-delphi": "Bronze",
  "venus-de-milo": "Marble",
  discobolus: "Marble copy",
  "artemision-bronze": "Bronze",
  "athena-lemnia": "Bronze type (reconstruction)",
  germanicus: "Marble",
  "belvedere-torso": "Marble",
  "apollo-belvedere": "Marble copy",
  "dying-gaul": "Marble copy",
  "ludovisi-gaul": "Marble group",
  "capitoline-venus": "Marble copy",
  laocoon: "Marble group",
  "augustus-of-prima-porta": "Marble",
  "donatello-saint-george": "Marble",
  "michelangelo-battle-of-the-centaurs": "Marble relief",
  "michelangelo-bacchus": "Marble",
  "michelangelo-pieta": "Marble",
  "michelangelo-david": "Marble",
  "michelangelo-bruges-madonna": "Marble",
  "michelangelo-tondo-pitti": "Marble relief",
  "michelangelo-tondo-taddei": "Marble relief",
  "michelangelo-moses": "Marble",
  "michelangelo-dying-slave": "Marble",
  "michelangelo-rebellious-slave": "Marble",
  "michelangelo-prisoner": "Marble",
  "michelangelo-medici-madonna": "Marble",
  "michelangelo-dawn": "Marble",
  "michelangelo-dusk": "Marble",
  "michelangelo-night": "Marble",
  "michelangelo-day": "Marble",
  "michelangelo-giuliano-duke-of-nemours": "Marble",
  "michelangelo-lorenzo-duke-of-urbino": "Marble",
  "michelangelo-brutus": "Marble",
  "michelangelo-rondanini-pieta": "Marble",
  "bouchardon-cupid": "Marble",
  "rodin-the-thinker": "Bronze",
  "donatello-david-bronze": "Bronze",
  "benedetto-da-maiano-john-the-baptist-as-a-boy": "Marble",
  "rodin-walking-man": "Bronze",
  "rodin-danaid": "Terracotta",
  "lorenzi-portrait-of-michelangelo": "Marble bust",
  "michelangelo-risen-christ": "Marble",
  "michelangelo-apollo": "Marble",
  "barberini-faun": "Marble",
  "apollo-lykeios": "Marble copy",
  "the-wrestlers": "Marble group"
});

const DIMENSIONS_BY_PIECE = Object.freeze({
  sphinx: "H: 2000 cm | L: 7300 cm",
  "ashurnasirpal-lion-hunt": "H: 90 cm | W: 224 cm",
  "lion-released-from-cage": "H: 57.5 cm | W: 114 cm",
  "goryeo-avalokiteshvara": "H: 67.65 cm",
  "sapi-portuguese-hunting-horn": "H: 64.2 cm | W: 16.4 cm | D: 9 cm",
  "loango-ivory-tusk-female-finial": "H: 34.4 cm | W: 13.5 cm | D: 13.5 cm",
  "loango-ivory-tusk-seated-european-finial": "H: 32.8 cm | W: 13.6 cm | D: 13.5 cm",
  "loango-ivory-tusk-trade-scenes": "H: 73.3 cm | W: 6.4 cm | D: 6.4 cm",
  "kongo-maternity-figure": "H: 25.7 cm | W: 10.5 cm | D: 10.2 cm",
  "venus-de-milo": "H: 204 cm",
  discobolus: "H: 170 cm | W: 115 cm | D: 50 cm",
  "artemision-bronze": "H: 201 cm | W: 214 cm | D: 43 cm",
  "athena-lemnia": "H: 208 cm | W: 81.5 cm | D: 50 cm",
  germanicus: "H: 192 cm | W: 80.5 cm | D: 54 cm",
  "belvedere-torso": "H: 122 cm | W: 79 cm | D: 90 cm",
  "apollo-belvedere": "H: 232 cm | W: 103 cm | D: 126 cm",
  "dying-gaul": "H: 96 cm | W: 185 cm | D: 89 cm",
  "ludovisi-gaul": "H: 229 cm | W: 168 cm | D: 112.5 cm",
  "capitoline-venus": "H: 188.5 cm | W: 62 cm",
  laocoon: "H: 242 cm | W: 162.5 cm | D: 103 cm",
  "augustus-of-prima-porta": "H: 217 cm",
  "donatello-saint-george": "H: 219 cm | W: 78.5 cm | D: 55 cm",
  "michelangelo-battle-of-the-centaurs": "H: 80 cm | W: 89 cm",
  "michelangelo-bacchus": "H: 208 cm | W: 76.5 cm | D: 59 cm",
  "michelangelo-pieta": "H: 176 cm | W: 170 cm | D: 89 cm",
  "michelangelo-david": "H: 517 cm",
  "michelangelo-bruges-madonna": "H: 129 cm | W: 60 cm | D: 71 cm",
  "michelangelo-tondo-pitti": "H: 89 cm | W: 83 cm",
  "michelangelo-tondo-taddei": "H: 105 cm | W: 104 cm",
  "michelangelo-moses": "H: 249 cm | W: 110 cm | D: 107 cm",
  "michelangelo-dying-slave": "H: 228 cm | W: 74 cm | D: 58 cm",
  "michelangelo-rebellious-slave": "H: 213 cm | W: 82.5 cm | D: 51.5 cm",
  "michelangelo-prisoner": "H: 256 cm | W: 73 cm | D: 93 cm",
  "michelangelo-medici-madonna": "H: 225 cm | W: 104.5 cm | D: 104 cm",
  "michelangelo-dawn": "H: 150 cm | W: 240 cm | D: 97 cm",
  "michelangelo-dusk": "H: 147.5 cm | W: 212 cm | D: 86 cm",
  "michelangelo-night": "H: 150 cm | W: 206 cm | D: 105 cm",
  "michelangelo-day": "H: 120 cm | W: 200 cm | D: 75 cm",
  "michelangelo-giuliano-duke-of-nemours": "H: 182 cm | W: 89 cm | D: 100 cm",
  "michelangelo-lorenzo-duke-of-urbino": "H: 187 cm | W: 76 cm | D: 94 cm",
  "michelangelo-brutus": "H: 105 cm | W: 71 cm | D: 43 cm",
  "michelangelo-rondanini-pieta": "H: 190 cm | W: 70 cm | D: 86 cm",
  "bouchardon-cupid": "H: 173 cm | W: 75 cm | D: 75 cm",
  "rodin-the-thinker": "H: 189 cm | W: 98 cm | D: 140 cm",
  "donatello-david-bronze": "H: 160 cm | W: 68 cm | D: 61 cm",
  "benedetto-da-maiano-john-the-baptist-as-a-boy": "H: 144 cm | W: 47 cm | D: 35 cm",
  "rodin-walking-man": "H: 214 cm | W: 70 cm | D: 164 cm",
  "rodin-danaid": "H: 20.2 cm | W: 36.5 cm | D: 27.5 cm",
  "lorenzi-portrait-of-michelangelo": "H: 43 cm | W: 25 cm | D: 28 cm",
  "michelangelo-risen-christ": "H: 251 cm | W: 74 cm | D: 82.5 cm",
  "michelangelo-apollo": "H: 149 cm | W: 56.5 cm | D: 59 cm",
  "barberini-faun": "H: 216 cm | W: 148 cm | D: 126 cm",
  "apollo-lykeios": "H: 231.5 cm | W: 90 cm | D: 72 cm",
  "the-wrestlers": "H: 95.5 cm | W: 117 cm | D: 70 cm"
});

function inferMediumFromText(piece) {
  const text = [
    piece?.viewerTitle || "",
    piece?.subtitle || "",
    piece?.lobbyMeta || "",
    piece?.source?.summary || "",
    piece?.source?.note || ""
  ]
    .join(" ")
    .toLowerCase();

  if (/\balabaster relief\b/.test(text)) return "Alabaster relief";
  if (/\bterracotta\b/.test(text)) return "Terracotta";
  if (/\bivory, wood\b/.test(text)) return "Ivory, wood";
  if (/\bivory\b/.test(text)) return "Ivory";
  if (/wood[, ]+glass|glass beads|brass tacks/.test(text)) return "Wood, glass, glass beads, brass tacks, pigment";
  if (/\bbronze\b/.test(text) && !/plaster/.test(text)) return "Bronze";
  if (/\blimestone\b/.test(text)) return "Limestone";
  if (/\bmarble\b/.test(text)) return "Marble";
  if (/\bplaster cast\b/.test(text)) return "Plaster cast";
  return "";
}

function enrichPieceMetadata(pieceId, piece) {
  if (!piece) return piece;
  const medium = piece.medium || MEDIUM_BY_PIECE[pieceId] || inferMediumFromText(piece);
  const dimensions = piece.dimensions || DIMENSIONS_BY_PIECE[pieceId] || "";
  const enriched = { ...piece };
  if (medium) {
    enriched.medium = medium;
  }
  if (dimensions) {
    enriched.dimensions = dimensions;
  }
  return enriched;
}

function buildMergedCatalog(base, extension) {
  const museumSections = base.museumSections || [];
  const museumPieces = Object.fromEntries(
    Object.entries({
      ...(base.museumPieces || {}),
      ...(extension.museumPiecesExtension || {})
    }).map(([pieceId, piece]) => [pieceId, enrichPieceMetadata(pieceId, piece)])
  );

  const sections = museumSections
    .map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      items: Object.entries(museumPieces)
        .filter(([, piece]) => piece.sectionId === section.id && !piece.hiddenFromLobby)
        .sort(([, a], [, b]) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return (a.viewerTitle || "").localeCompare(b.viewerTitle || "");
        })
        .map(([pieceId]) => pieceId)
    }))
    .filter((section) => section.items.length > 0);

  return {
    ...base,
    museumSections,
    museumPieces,
    museumLobby: {
      ...(base.museumLobby || {}),
      sections
    },
    museumRouteMap: Object.fromEntries(
      Object.entries(museumPieces).flatMap(([pieceId, piece]) => routeEntriesForPath(piece.path, pieceId))
    )
  };
}

function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      import(`./catalog.js?v=${MODULE_VERSION}`),
      import(`./catalog-overlay.js?v=${MODULE_VERSION}`).catch(() => ({}))
    ]).then(([base, extension]) => buildMergedCatalog(base, extension));
  }
  return catalogPromise;
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.endsWith(".html")) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function routeEntriesForPath(pathname, pieceId) {
  const normalized = normalizePath(pathname);
  if (pathname && pathname.endsWith("/index.html")) {
    return [
      [normalized, pieceId],
      [normalizePath(pathname.slice(0, -"index.html".length)), pieceId]
    ];
  }
  return [[normalized, pieceId]];
}

function renderBootError(message, error) {
  console.error(error);
  document.body.innerHTML = `<p style="margin:16px;font-family:IBM Plex Sans, Avenir Next, sans-serif;color:#2f2a22;">${message}</p>`;
}

function upsertMetaTag(key, value, attribute = "name") {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setPageMetadata({ title, description }) {
  if (title) {
    document.title = title;
    upsertMetaTag("og:title", title, "property");
    upsertMetaTag("twitter:title", title);
  }

  if (description) {
    upsertMetaTag("description", description);
    upsertMetaTag("og:description", description, "property");
    upsertMetaTag("twitter:description", description);
  }
}

function simplifyWorkTitle(value = "") {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim() || value.trim();
}

function cleanMetadataText(value = "") {
  return value.replace(/^Artist:\s*/i, "").replace(/\s+/g, " ").trim();
}

function buildPiecePageDescription(piece) {
  const title = cleanMetadataText(piece.viewerTitle || "");
  const artist = cleanMetadataText(piece.subtitle || "");
  const medium = cleanMetadataText(piece.medium || "");
  const segments = [title];

  if (artist) {
    segments.push(artist);
  }

  if (medium) {
    segments.push(medium);
  }

  segments.push("Viewable in Form Gallery, a digital sculpture collection spanning antiquity through the twenty-first century.");
  return segments.join(". ").replace(/\.\s*$/, "") + ".";
}

export async function initMuseumLobbyPage() {
  try {
    const [{ museumLobby, museumPieces }, { renderMuseumLobby }] = await Promise.all([
      loadCatalog(),
      import(`./lobby.js?v=${MODULE_VERSION}`)
    ]);
    const lobbyConfig = {
      ...museumLobby,
      title: museumLobby.title || "Atrium",
      pageTitle: "Atrium — Form Gallery"
    };
    renderMuseumLobby(lobbyConfig, museumPieces);
    setPageMetadata({
      title: lobbyConfig.pageTitle,
      description: COLLECTION_DESCRIPTION
    });
  } catch (error) {
    renderBootError("Failed to load the museum lobby.", error);
  }
}

export async function initMuseumPiecePage(pieceId) {
  const { museumPieces } = await loadCatalog();
  const piece = museumPieces[pieceId];
  if (!piece) {
    renderBootError(`Unknown museum piece: ${pieceId}`, new Error(`Unknown museum piece: ${pieceId}`));
    return;
  }

  try {
    const pagePiece = {
      ...piece,
      pageTitle: `${simplifyWorkTitle(piece.viewerTitle)} — Form Gallery`
    };

    setPageMetadata({
      title: pagePiece.pageTitle,
      description: buildPiecePageDescription(pagePiece)
    });

    if (pagePiece.kind === "stl") {
      const { initStlMuseumPage } = await import(`./stl-viewer.js?v=${MODULE_VERSION}`);
      await initStlMuseumPage(pagePiece);
      return;
    }

    if (pagePiece.kind === "sketchfab") {
      const { initSketchfabMuseumPage } = await import(`./sketchfab-viewer.js?v=${MODULE_VERSION}`);
      await initSketchfabMuseumPage(pagePiece);
      return;
    }

    if (pagePiece.kind === "gltf") {
      const { initGltfMuseumPage } = await import(`./gltf-viewer.js?v=${MODULE_VERSION}`);
      await initGltfMuseumPage(pagePiece);
      return;
    }

    throw new Error(`Unsupported museum piece kind: ${pagePiece.kind}`);
  } catch (error) {
    renderBootError(`Failed to initialize ${piece.viewerTitle}.`, error);
  }
}

export async function initMuseumPageForCurrentPath() {
  try {
    const { museumRouteMap } = await loadCatalog();
    const currentPath = normalizePath(window.location.pathname);

    if (currentPath === "/museum/") {
      await initMuseumLobbyPage();
      return;
    }

    const pieceId = museumRouteMap[currentPath];
    if (!pieceId) {
      renderBootError(`No museum entry is registered for ${currentPath}`, new Error(`Unknown museum route: ${currentPath}`));
      return;
    }

    await initMuseumPiecePage(pieceId);
  } catch (error) {
    renderBootError("Failed to initialize the museum page.", error);
  }
}
