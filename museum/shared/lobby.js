function resolveLobbyEntry(entry, pieces) {
  if (typeof entry === "string") {
    const piece = pieces[entry];
    return {
      href: piece.path,
      title: piece.lobbyTitle || piece.viewerTitle,
      meta: piece.lobbyMeta,
      note: piece.lobbyNote
    };
  }

  if (entry.pieceId) {
    const piece = pieces[entry.pieceId];
    return {
      href: entry.href || piece.path,
      title: entry.title || piece.lobbyTitle || piece.viewerTitle,
      meta: entry.meta || piece.lobbyMeta,
      note: entry.note || piece.lobbyNote
    };
  }

  return entry;
}

function renderEntry(entry) {
  return `
    <li>
      <a class="piece" href="${entry.href}">
        <p class="piece-kicker">Sculpture</p>
        <h3 class="piece-title">${entry.title}</h3>
        ${entry.meta ? `<p class="piece-meta">${entry.meta}</p>` : ""}
        ${entry.note ? `<p class="piece-note">${entry.note}</p>` : ""}
        <div class="piece-footer">
          <span class="piece-arrow">Open piece</span>
        </div>
      </a>
    </li>
  `;
}

export function renderMuseumLobby(lobby, pieces) {
  document.title = lobby.pageTitle || document.title;

  const totalPieces = lobby.sections.reduce((sum, section) => sum + section.items.length, 0);
  const jumpLinks = lobby.sections
    .map(
      (section) => `
        <a class="lobby-jump" href="#${section.id}">
          <span class="lobby-jump-label">${section.title}</span>
          <span class="lobby-jump-count">${section.items.length}</span>
        </a>
      `
    )
    .join("");

  const sectionsHtml = lobby.sections
    .map((section, index) => {
      const pieceCountLabel = `${section.items.length} ${section.items.length === 1 ? "piece" : "pieces"}`;
      const itemsHtml = section.items.map((entry) => renderEntry(resolveLobbyEntry(entry, pieces))).join("");
      return `
        <section id="${section.id}" class="lobby-section" data-tone="${index % 4}">
          <div class="section-header">
            <div>
              <p class="section-kicker">Gallery ${String(index + 1).padStart(2, "0")}</p>
              <h2 class="section-title">${section.title}</h2>
              <p class="section-sub">${section.subtitle}</p>
            </div>
            <p class="section-count">${pieceCountLabel}</p>
          </div>
          <ul class="list">${itemsHtml}</ul>
        </section>
      `;
    })
    .join("");

  document.body.innerHTML = `
    <div class="app lobby-app">
      <section class="panel lobby-panel">
        <div class="lobby-panel-inner">
          <div class="lobby-hero">
            <div class="lobby-copy">
              <p class="lobby-eyebrow">form gallery</p>
              <h1 class="title lobby-title">${lobby.title}</h1>
              <p class="sub lobby-sub">${lobby.subtitle}</p>
            </div>

            <div class="lobby-stats" aria-label="Museum summary">
              <article class="lobby-stat">
                <p class="lobby-stat-kicker">Collection</p>
                <p class="lobby-stat-value">${totalPieces}</p>
                <p class="lobby-stat-label">Live pieces</p>
              </article>
              <article class="lobby-stat">
                <p class="lobby-stat-kicker">Sections</p>
                <p class="lobby-stat-value">${lobby.sections.length}</p>
                <p class="lobby-stat-label">Active galleries</p>
              </article>
            </div>
          </div>

          <nav class="lobby-jumps" aria-label="Jump to gallery">
            ${jumpLinks}
          </nav>
        </div>
      </section>

      <section class="stage">
        <div class="lobby-grid">${sectionsHtml}</div>
      </section>
    </div>
  `;
}
