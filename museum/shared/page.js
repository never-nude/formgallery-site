const MODULE_VERSION = "20260314-2238";

let catalogPromise = null;

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
  return medium ? { ...piece, medium } : piece;
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
      Object.entries(museumPieces).map(([pieceId, piece]) => [normalizePath(piece.path), pieceId])
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
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function renderBootError(message, error) {
  console.error(error);
  document.body.innerHTML = `<p style="margin:16px;font-family:IBM Plex Sans, Avenir Next, sans-serif;color:#2f2a22;">${message}</p>`;
}

export async function initMuseumLobbyPage() {
  try {
    const [{ museumLobby, museumPieces }, { renderMuseumLobby }] = await Promise.all([
      loadCatalog(),
      import(`./lobby.js?v=${MODULE_VERSION}`)
    ]);
    renderMuseumLobby(museumLobby, museumPieces);
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
    if (piece.kind === "stl") {
      const { initStlMuseumPage } = await import(`./stl-viewer.js?v=${MODULE_VERSION}`);
      await initStlMuseumPage(piece);
      return;
    }

    if (piece.kind === "sketchfab") {
      const { initSketchfabMuseumPage } = await import(`./sketchfab-viewer.js?v=${MODULE_VERSION}`);
      await initSketchfabMuseumPage(piece);
      return;
    }

    if (piece.kind === "gltf") {
      const { initGltfMuseumPage } = await import(`./gltf-viewer.js?v=${MODULE_VERSION}`);
      await initGltfMuseumPage(piece);
      return;
    }

    throw new Error(`Unsupported museum piece kind: ${piece.kind}`);
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
