function link(label, url) {
  return { label, url };
}

function source(summary, links = [], note = "") {
  return { summary, links, note };
}

function smkSource({ summary, recordUrl, fullUrl, fallbackUrl, note = "" }) {
  const links = [];
  if (recordUrl) links.push(link("Record", recordUrl));
  if (fullUrl) links.push(link("Full STL", fullUrl));
  if (fallbackUrl && fallbackUrl !== fullUrl) links.push(link("Optimized STL", fallbackUrl));
  return source(summary, links, note);
}

const MICHELANGELO_SUBTITLE = "Artist: Michelangelo Buonarroti (1475-1564)";

export const museumPiecesExtension = {
  "michelangelo-madonna-of-the-stairs": {
    kind: "stl",
    path: "/michelangelo/madonna-of-the-stairs/",
    sectionId: "michelangelo",
    sortOrder: 5,
    viewerTitle: "Madonna of the Stairs (c. 1490-1492)",
    subtitle: MICHELANGELO_SUBTITLE,
    lobbyMeta: "Source: SMK Open",
    source: smkSource({
      summary: "SMK Open source mesh for Madonna of the Stairs / Trappe-Madonna.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS2358",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/rf55zd315_smk-madonna-of-the-steps.obj",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/m613n3373_KAS2358_small.stl",
      note: "SMK catalogs this as a modern plaster cast after Michelangelo; the c. 1490-1492 date here refers to Michelangelo's original relief."
    }),
    defaults: {
      zoom: 2.65,
      exposure: 0.44,
      rough: 0.2
    },
    model: {
      primaryUrl: "./madonna_of_the_stairs_source_small.stl",
      fallbackUrl: "./madonna_of_the_stairs_source_small.stl"
    },
    scene: {
      rotateX: 0,
      targetHeight: 1.22,
      defaultYaw: -Math.PI * 0.05,
      defaultViewVector: [1.06, 0.5, 2.02],
      mobileViewVector: [0.82, 0.42, 1.72]
    }
  },
  "michelangelo-risen-christ": {
    kind: "stl",
    path: "/michelangelo/risen-christ/",
    sectionId: "michelangelo",
    sortOrder: 78,
    viewerTitle: "Risen Christ (c. 1519-1521)",
    subtitle: MICHELANGELO_SUBTITLE,
    lobbyMeta: "Source: SMK Open",
    source: smkSource({
      summary: "SMK Open source mesh for Risen Christ / Den genopstandne Kristus.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS422",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/p5547x24g_smk40-kas422-risen-christ.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/k930c2765_KAS422_small.stl",
      note: "SMK catalogs this as a plaster cast after Michelangelo. The c. 1519-1521 date here follows the original sculpture rather than the cast."
    }),
    defaults: {
      zoom: 2.9,
      exposure: 0.42,
      rough: 0.2
    },
    model: {
      primaryUrl: "./risen_christ_source_small.stl",
      fallbackUrl: "./risen_christ_source_small.stl"
    },
    scene: {
      rotateX: 0,
      targetHeight: 1.76,
      defaultYaw: Math.PI * 0.08
    }
  },
  "michelangelo-apollo": {
    kind: "stl",
    path: "/michelangelo/apollo/",
    sectionId: "michelangelo",
    sortOrder: 165,
    viewerTitle: "Apollo (c. 1530)",
    subtitle: MICHELANGELO_SUBTITLE,
    lobbyMeta: "Source: SMK Open",
    source: smkSource({
      summary: "SMK Open source mesh for Apollo / Apollon.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS473",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/qv33s208r_smk14-kas473-apollo-michelangelo.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/4q77fw84x_KAS473_small.stl",
      note: "SMK catalogs this as a plaster cast after Michelangelo. The c. 1530 date is the conventional art-historical dating for the original work."
    }),
    defaults: {
      zoom: 2.75,
      exposure: 0.42,
      rough: 0.2
    },
    model: {
      primaryUrl: "./apollo_source_small.stl",
      fallbackUrl: "./apollo_source_small.stl"
    },
    scene: {
      rotateX: 0,
      targetHeight: 1.54,
      defaultYaw: -Math.PI * 0.16
    }
  }
};
