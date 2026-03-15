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
const DONATELLO_SUBTITLE = "Artist: Donatello (c. 1386-1466)";
const LORENZI_SUBTITLE = "Artist: Battista Lorenzi (1527-1594)";
const BENEDETTO_DA_MAIANO_SUBTITLE = "Artist: Attributed to Benedetto da Maiano (1442-1497)";

export const museumPiecesExtension = {
  "donatello-saint-george": {
    kind: "stl",
    path: "/donatello/saint-george/",
    sectionId: "early-renaissance",
    sortOrder: 74,
    viewerTitle: "Saint George (c. 1415-1417)",
    subtitle: DONATELLO_SUBTITLE,
    lobbyMeta: "Source: SMK Open plaster cast (KAS82)",
    source: smkSource({
      summary: "Rendered from SMK Open's optimized STL for the museum's plaster cast of Saint George.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS82",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/rn3015822_153-kas82.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/765376019_KAS82_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The c. 1415-1417 date follows the original Donatello sculpture rather than the cast."
    }),
    defaults: {
      zoom: 2.82,
      lightAngle: 28,
      lightPower: 2.34,
      exposure: 0.5,
      rough: 0.2
    },
    model: {
      primaryUrl: "./saint_george_source_small.stl",
      fallbackUrl: "./saint_george_source_small.stl"
    },
    scene: {
      targetHeight: 1.92,
      defaultYaw: -Math.PI * 0.04,
      defaultViewVector: [1.38, 0.72, 2.18],
      mobileViewVector: [1.0, 0.56, 1.94]
    }
  },
  "donatello-david-bronze": {
    kind: "stl",
    path: "/donatello/david/",
    sectionId: "early-renaissance",
    sortOrder: 76,
    viewerTitle: "David with the Head of Goliath (c. 1440s)",
    subtitle: DONATELLO_SUBTITLE,
    lobbyMeta: "Source: Wikimedia Commons / Scan the World; bronze material pass",
    source: source(
      "Rendered from the Scan the World STL on Wikimedia Commons, mirrored locally and decimated to the gallery's ~20 MB target for reliable native loading.",
      [
        link("Wikimedia Commons file", "https://commons.wikimedia.org/wiki/File:Scan_the_World_-_SMK17_-_KAS2036_-_David_With_The_Head_of_Goliath_(Donatello).stl"),
        link("Direct STL", "https://upload.wikimedia.org/wikipedia/commons/5/56/Scan_the_World_-_SMK17_-_KAS2036_-_David_With_The_Head_of_Goliath_%28Donatello%29.stl")
      ],
      "The original bronze is in the Museo Nazionale del Bargello. The viewer uses a local 400,000-face binary STL derivative to keep the delivered model close to 20 MB."
    ),
    defaults: {
      zoom: 2.95,
      lightAngle: 28,
      lightPower: 2.18,
      exposure: 0.46,
      rough: 0.2
    },
    model: {
      primaryUrl: "./donatello_david_source_small.stl",
      fallbackUrl: "./donatello_david_source_small.stl"
    },
    scene: {
      defaultYaw: -Math.PI * 0.08,
      targetHeight: 1.73,
      defaultViewVector: [1.72, 0.74, 1.88],
      mobileViewVector: [1.08, 0.48, 2.08]
    },
    material: {
      color: "#6e5b3a",
      metalness: 0.86,
      clearcoat: 0.08,
      clearcoatRoughness: 0.44,
      sheen: 0.0,
      sheenRoughness: 1.0,
      sheenColor: "#000000",
      reflectivity: 0.84
    }
  },
  "benedetto-da-maiano-john-the-baptist-as-a-boy": {
    kind: "stl",
    path: "/donatello/john-the-baptist-as-a-boy/",
    sectionId: "early-renaissance",
    sortOrder: 79,
    viewerTitle: "John the Baptist as a Boy (attributed to Benedetto da Maiano, 1480-1481)",
    subtitle: BENEDETTO_DA_MAIANO_SUBTITLE,
    lobbyMeta: "Source: SMK Open plaster cast (KAS465)",
    source: smkSource({
      summary: "Rendered from SMK Open's optimized STL for the museum's plaster cast titled John the Baptist as a Boy.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS465",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/s4655n294_144-john-the-baptist-inv-465.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/d791sm78j_KAS465_small.stl",
      note: "SMK catalogs the object as a plaster cast after a Bargello marble original. The attribution to Benedetto da Maiano and the 1480-1481 date are inferred from the original-object notes attached to the SMK record."
    }),
    defaults: {
      zoom: 2.58,
      lightAngle: 32,
      lightPower: 2.14,
      exposure: 0.46,
      rough: 0.2
    },
    model: {
      primaryUrl: "./john_the_baptist_as_a_boy_source_small.stl",
      fallbackUrl: "./john_the_baptist_as_a_boy_source_small.stl"
    },
    scene: {
      targetHeight: 1.34,
      defaultYaw: Math.PI * 0.06,
      defaultViewVector: [1.08, 0.46, 1.84],
      mobileViewVector: [0.82, 0.38, 1.68]
    }
  },
  "rodin-walking-man": {
    kind: "stl",
    path: "/rodin/the-walking-man/",
    sectionId: "rodin",
    sortOrder: 20,
    viewerTitle: "The Walking Man (conceived 1899-1900)",
    subtitle: "Artist: Auguste Rodin (1840-1917)",
    lobbyMeta: "Source: Wikimedia Commons / Thingiverse-derived STL",
    source: source(
      "Local STL mirrored from the Wikimedia Commons file for Rodin's The Walking Man.",
      [
        link("File page", "https://commons.wikimedia.org/wiki/File:Auguste_Rodin_-_L'Homme_qui_marche_-_3D_model_Thingiverse.stl"),
        link("Direct STL", "https://upload.wikimedia.org/wikipedia/commons/e/e4/Auguste_Rodin_-_L%27Homme_qui_marche_-_3D_model_Thingiverse.stl"),
        link("Musee Rodin reference", "https://www.meudon.musee-rodin.fr/en/musee/collections/oeuvres/walking-man-large-model")
      ],
      "The Commons file credits Thingiverse and carries a CC BY 4.0 license. The date here follows the Musee Rodin chronology for the large model's conception."
    ),
    defaults: {
      zoom: 3.05,
      lightAngle: 26,
      lightPower: 2.28,
      exposure: 0.46,
      rough: 0.2
    },
    model: {
      primaryUrl: "./walking_man_source.stl",
      fallbackUrl: "./walking_man_source.stl"
    },
    timeouts: {
      primaryMs: 60000,
      fallbackMs: 60000
    },
    scene: {
      targetHeight: 1.78,
      defaultYaw: -Math.PI * 0.1,
      defaultViewVector: [1.34, 0.64, 2.02],
      mobileViewVector: [0.94, 0.48, 1.86]
    },
    material: {
      color: "#85613b",
      metalness: 0.8,
      clearcoat: 0.06,
      clearcoatRoughness: 0.5,
      sheen: 0.0,
      sheenRoughness: 1.0,
      sheenColor: "#000000",
      reflectivity: 0.8
    }
  },
  "rodin-danaid": {
    kind: "stl",
    path: "/rodin/danaid/",
    sectionId: "rodin",
    sortOrder: 30,
    viewerTitle: "Danaid (1889)",
    subtitle: "Artist: Auguste Rodin (1840-1917)",
    lobbyMeta: "Source: Wikimedia Commons / Nationalmuseum STL",
    source: source(
      "Local STL mirrored from the Wikimedia Commons file for Rodin's Danaid, credited to Nationalmuseum's Sketchfab release.",
      [
        link("File page", "https://commons.wikimedia.org/wiki/File:Danaid_NMSk_1854_(Auguste_Rodin)_-_Nationalmuseum_-_76c5c234c6074b13a94bf793c276a509.stl"),
        link("Direct STL", "https://upload.wikimedia.org/wikipedia/commons/2/22/Danaid_NMSk_1854_%28Auguste_Rodin%29_-_Nationalmuseum_-_76c5c234c6074b13a94bf793c276a509.stl")
      ],
      "The source file describes a terracotta Danaid made in 1889 and originally linked to The Gates of Hell. The gallery render keeps that terracotta reading rather than forcing a bronze finish."
    ),
    defaults: {
      zoom: 2.52,
      lightAngle: 18,
      lightPower: 2.02,
      exposure: 0.5,
      rough: 0.28
    },
    model: {
      primaryUrl: "./danaid_source.stl",
      fallbackUrl: "./danaid_source.stl"
    },
    timeouts: {
      primaryMs: 60000,
      fallbackMs: 60000
    },
    scene: {
      targetHeight: 0.92,
      focusYRatio: 0.48,
      defaultYaw: Math.PI * 0.08,
      defaultViewVector: [1.18, 0.34, 1.72],
      mobileViewVector: [0.86, 0.26, 1.54]
    },
    material: {
      color: "#9d6a4a",
      metalness: 0.04,
      clearcoat: 0.1,
      clearcoatRoughness: 0.58,
      sheen: 0.12,
      sheenRoughness: 0.9,
      sheenColor: "#e4b995",
      reflectivity: 0.16
    }
  },
  "lorenzi-portrait-of-michelangelo": {
    kind: "stl",
    path: "/lorenzi/portrait-of-michelangelo/",
    sectionId: "early-renaissance",
    sortOrder: 82,
    viewerTitle: "Portrait of Michelangelo (after Battista Lorenzi, 16th-century type)",
    subtitle: LORENZI_SUBTITLE,
    lobbyMeta: "Source: SMK Open; plaster cast after Battista Lorenzi",
    source: smkSource({
      summary: "Rendered from SMK Open's optimized STL of the museum's plaster cast after Battista Lorenzi's portrait of Michelangelo.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS336",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/1c18dm47p_smk29-kas336-bust-of-michelangelo3.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/fx719s420_KAS336_small.stl",
      note: "The gallery serves a local mirror of the optimized STL, which already lands almost exactly on the museum's target delivery budget at about 20 MB and 400,000 triangles. SMK catalogs the object itself as a plaster cast made before 1897 after Battista Lorenzi."
    }),
    defaults: {
      zoom: 2.58,
      lightAngle: 31,
      lightPower: 2.08,
      exposure: 0.44,
      rough: 0.2
    },
    model: {
      primaryUrl: "./portrait_of_michelangelo_source_small.stl",
      fallbackUrl: "./portrait_of_michelangelo_source_small.stl"
    },
    scene: {
      defaultYaw: -Math.PI * 0.08,
      targetHeight: 1.12,
      defaultViewVector: [1.18, 0.42, 1.54],
      mobileViewVector: [0.86, 0.34, 1.74]
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
      rotateX: -Math.PI * 0.5,
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
      rotateX: -Math.PI * 0.5,
      targetHeight: 1.54,
      defaultYaw: -Math.PI * 0.16
    }
  },
  "barberini-faun": {
    kind: "stl",
    path: "/barberini-faun/",
    sectionId: "antiquity",
    sortOrder: 29.15,
    viewerTitle: "Barberini Faun (Roman copy after a Hellenistic original, c. 220 BCE)",
    subtitle: "Artist: Unknown Roman workshop after a Hellenistic original",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS208)",
    source: smkSource({
      summary: "SMK Open source mesh for the Barberini Faun.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS208",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/df65vd33z_kas208-barberini-faun.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/8w32rb332_KAS208_small.stl",
      note: "SMK catalogs this as a plaster cast. The dating here follows the usual Roman-copy-after-Hellenistic-original framing for the Barberini Faun type."
    }),
    defaults: {
      zoom: 3.05,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./barberini_faun_source_small.stl",
      fallbackUrl: "./barberini_faun_source_small.stl"
    }
  },
  "apollo-lykeios": {
    kind: "stl",
    path: "/apollo-lykeios/",
    sectionId: "antiquity",
    sortOrder: 29.2,
    viewerTitle: "Apollo Lykeios (copy tradition, 4th century BCE type)",
    subtitle: "Traditional attribution: Praxiteles; current mesh from SMK's cast record",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS1026)",
    source: smkSource({
      summary: "SMK Open source mesh for Apollo Lykeios / Apollon Lykeios.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS1026",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/9593v081h_42-kas2016.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/p5547x33f_KAS1026_small.stl",
      note: "SMK catalogs this as a plaster cast. The Praxiteles attribution is traditional rather than certain, and the title follows the source record's Apollo Lykeios identification."
    }),
    defaults: {
      zoom: 2.95,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./apollo_lykeios_source_small.stl",
      fallbackUrl: "./apollo_lykeios_source_small.stl"
    }
  },
  "the-wrestlers": {
    kind: "stl",
    path: "/the-wrestlers/",
    sectionId: "antiquity",
    sortOrder: 29.25,
    viewerTitle: "The Wrestlers (Roman copy after a Hellenistic original)",
    subtitle: "Artist: Unknown Roman workshop after a Hellenistic original",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS403)",
    source: smkSource({
      summary: "SMK Open source mesh for the Uffizi Wrestlers group, titled 'To brydere i kamp' in the source record.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS403",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/4q77fw74p_smk8-kas403-uffizi-wrestlers-1.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/8w32rb35m_KAS403_small.stl",
      note: "The Form Gallery title uses the common English name. SMK catalogs the object itself as a plaster cast after the Uffizi group."
    }),
    defaults: {
      zoom: 3.25,
      exposure: 0.44,
      rough: 0.2
    },
    model: {
      primaryUrl: "./wrestlers_source_small.stl",
      fallbackUrl: "./wrestlers_source_small.stl"
    }
  }
};
