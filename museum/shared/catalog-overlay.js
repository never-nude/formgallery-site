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
  "rodin-heroic-head-of-pierre-de-wissant": {
    kind: "stl",
    path: "/rodin/heroic-head-of-pierre-de-wissant/",
    sectionId: "rodin",
    sortOrder: 40,
    viewerTitle: "Heroic Head of Pierre de Wissant (1886)",
    subtitle: "Artist: Auguste Rodin (1840-1917)",
    medium: "Plaster",
    dimensions: "H: 85.1 cm | W: 61 cm | D: 50.8 cm",
    lobbyMeta: "Source: Wikimedia Commons / Cleveland Museum of Art STL",
    source: source(
      "Local STL mirrored from the Wikimedia Commons file for Rodin's Heroic Head of Pierre de Wissant, cataloged by the Cleveland Museum of Art.",
      [
        link("Wikimedia Commons file", "https://commons.wikimedia.org/wiki/File:1917.722_Heroic_Head_of_Pierre_de_Wissant_-_3D_model.stl"),
        link("Direct STL", "https://upload.wikimedia.org/wikipedia/commons/1/1c/1917.722_Heroic_Head_of_Pierre_de_Wissant_-_3D_model.stl"),
        link("Cleveland Museum of Art", "https://www.clevelandart.org/art/1917.722")
      ],
      "The Commons file identifies the work as Auguste Rodin's Heroic Head of Pierre de Wissant in the Cleveland Museum of Art. The displayed dimensions follow the museum metadata surfaced on the Commons file page."
    ),
    defaults: {
      zoom: 2.44,
      lightAngle: 30,
      lightPower: 2.18,
      rough: 0.22
    },
    model: {
      primaryUrl: "./heroic_head_of_pierre_de_wissant_source.stl",
      fallbackUrl: "./heroic_head_of_pierre_de_wissant_source.stl"
    },
    timeouts: {
      primaryMs: 60000,
      fallbackMs: 60000
    },
    scene: {
      rotateX: 0,
      rotateZ: Math.PI,
      targetHeight: 1.08,
      defaultYaw: -Math.PI * 0.06,
      defaultViewVector: [1.18, 0.46, 1.66],
      mobileViewVector: [0.86, 0.38, 1.54]
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
  },
  "princess-from-amarna": {
    kind: "stl",
    path: "/princess-from-amarna/",
    sectionId: "antiquity",
    sortOrder: 11,
    viewerTitle: "Princess from Amarna (Egypt, c. 1365-1349 BCE)",
    subtitle: "Artist: Unknown Egyptian workshop",
    medium: "Quartzite",
    dimensions: "H: 16.5 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS2226)",
    source: smkSource({
      summary: "SMK Open source mesh for Princess from Amarna, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS2226",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/cj82kc77d_smk-kas2226-princess-of-amarna.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/v979v741f_KAS2226_small.stl",
      note: "SMK catalogs the object as a plaster cast after an Egyptian Museum original from Tell el-Amarna, associated in the source record with the workshop of Thutmose and dated to the Amarna Period, 18th Dynasty."
    }),
    defaults: {
      zoom: 2.38,
      lightAngle: 26,
      lightPower: 2.06,
      exposure: 0.42,
      rough: 0.22
    },
    model: {
      primaryUrl: "./princess_from_amarna_source_small.stl",
      fallbackUrl: "./princess_from_amarna_source_small.stl"
    },
    scene: {
      targetHeight: 1.16,
      defaultYaw: 0,
      defaultViewVector: [1.02, 0.44, 1.56],
      mobileViewVector: [0.74, 0.34, 1.38]
    },
    material: {
      color: "#d6b992",
      metalness: 0.02,
      clearcoat: 0.06,
      clearcoatRoughness: 0.58,
      sheen: 0.08,
      sheenRoughness: 0.9,
      sheenColor: "#ead2b1",
      reflectivity: 0.18
    }
  },
  "capitoline-wolf": {
    kind: "stl",
    path: "/capitoline-wolf/",
    sectionId: "antiquity",
    sortOrder: 27.65,
    viewerTitle: "Capitoline Wolf (Etruscan type, c. 450 BCE)",
    subtitle: "Artist: Unknown Italic workshop",
    medium: "Bronze",
    dimensions: "H: 94 cm | W: 65 cm | D: 144.5 cm",
    lobbyMeta: "Source: SMK Open painted plaster cast (KAS837); bronze material pass",
    source: smkSource({
      summary: "SMK Open source mesh for the Capitoline Wolf type, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS837",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/g445cj932_smk39-kas837-capitoline-wolf-decimated.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/05741x168_KAS837_small.stl",
      note: "SMK catalogs the object itself as a painted plaster cast. The source record identifies the original as the Capitoline Wolf type in the Palazzo dei Conservatori, with Etruscan attribution and a c. 450 BCE date."
    }),
    defaults: {
      zoom: 2.9,
      lightAngle: 28,
      lightPower: 2.2,
      exposure: 0.44,
      rough: 0.2
    },
    model: {
      primaryUrl: "./capitoline_wolf_source_small.stl",
      fallbackUrl: "./capitoline_wolf_source_small.stl"
    },
    scene: {
      targetHeight: 1.12,
      defaultYaw: 0,
      defaultViewVector: [1.18, 0.46, 1.78],
      mobileViewVector: [0.84, 0.34, 1.6]
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
  "aphrodite-anadyomene": {
    kind: "stl",
    path: "/aphrodite-anadyomene/",
    sectionId: "antiquity",
    sortOrder: 28.7,
    viewerTitle: "Aphrodite Anadyomene (Roman copy after a Greek original, 1st century BCE)",
    subtitle: "Artist: Unknown Roman workshop after a Greek original",
    medium: "Marble",
    dimensions: "H: 154 cm | W: 59 cm | D: 41.5 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS185)",
    source: smkSource({
      summary: "SMK Open source mesh for Aphrodite Anadyomene, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS185",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/rn301581s_16-smk-esquiline-aphrodite-inv-1141.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/1z40kz34x_KAS185_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record identifies the original as the Esquiline / Anadyomene Aphrodite type from Rome, held in the Palazzo dei Conservatori."
    }),
    defaults: {
      zoom: 2.86,
      lightAngle: 28,
      lightPower: 2.12,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./aphrodite_anadyomene_source_small.stl",
      fallbackUrl: "./aphrodite_anadyomene_source_small.stl"
    }
  },
  "herakles-lansdowne": {
    kind: "stl",
    path: "/herakles-lansdowne/",
    sectionId: "antiquity",
    sortOrder: 28.85,
    viewerTitle: "Herakles Lansdowne (Roman copy after a Greek original, 4th century BCE type)",
    subtitle: "Artist: Unknown Roman workshop after a classical Greek original",
    medium: "Marble",
    dimensions: "H: 208 cm | W: 88 cm | D: 76 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS224)",
    source: smkSource({
      summary: "SMK Open source mesh for the Lansdowne Herakles type, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS224",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/mg74qr49g_smk-110-kas224.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/kd17cz49m_KAS224_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record links the original to the Hadrianic Villa findspot at Tivoli and the Getty's Lansdowne Herakles."
    }),
    defaults: {
      zoom: 2.98,
      lightAngle: 30,
      lightPower: 2.2,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./herakles_lansdowne_source_small.stl",
      fallbackUrl: "./herakles_lansdowne_source_small.stl"
    }
  },
  "kneeling-archer": {
    kind: "stl",
    path: "/kneeling-archer/",
    sectionId: "antiquity",
    sortOrder: 26.8,
    viewerTitle: "Kneeling Archer (Aphaia temple figure, c. 500-490 BCE)",
    subtitle: "Artist: Unknown Greek sculptor",
    medium: "Marble",
    dimensions: "H: 104 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS2125)",
    source: smkSource({
      summary: "SMK Open source mesh for the Kneeling Archer from the Temple of Aphaia, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS2125",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/tt44ps735_smk-kas2125-aphaia-kneeling-archer.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/kh04dv58t_KAS2125.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record identifies the original as a west-pediment figure from the Temple of Aphaia on Aegina."
    }),
    defaults: {
      zoom: 2.72,
      lightAngle: 24,
      lightPower: 2.08,
      exposure: 0.42,
      rough: 0.2
    },
    model: {
      primaryUrl: "./kneeling_archer_source_small.stl",
      fallbackUrl: "./kneeling_archer_source_small.stl"
    }
  },
  "castor-and-pollux": {
    kind: "stl",
    path: "/castor-and-pollux/",
    sectionId: "antiquity",
    sortOrder: 28.55,
    viewerTitle: "Castor and Pollux (Roman group, 1st century BCE)",
    subtitle: "Artist: Unknown Roman workshop",
    medium: "Marble group",
    dimensions: "H: 158 cm | W: 101 cm | D: 51 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS2362)",
    source: smkSource({
      summary: "SMK Open source mesh for Castor and Pollux, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS2362",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/cv43p265m_smk54-kas2362-castor-and-pollux-d.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/4j03d4287_KAS2362_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record traces the original group through the Ludovisi and Odescalchi collections to the Prado."
    }),
    defaults: {
      zoom: 3.12,
      lightAngle: 26,
      lightPower: 2.14,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./castor_and_pollux_source_small.stl",
      fallbackUrl: "./castor_and_pollux_source_small.stl"
    }
  },
  "athena-pallas-giustiniani": {
    kind: "stl",
    path: "/athena-pallas-giustiniani/",
    sectionId: "antiquity",
    sortOrder: 27.9,
    viewerTitle: "Athena Pallas Giustiniani (Roman copy after a Greek original, early 4th century BCE type)",
    subtitle: "Artist: Unknown Roman workshop after a classical Greek original",
    medium: "Marble",
    dimensions: "H: 219 cm | W: 93 cm | D: 65 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS255)",
    source: smkSource({
      summary: "SMK Open source mesh for Athena Pallas Giustiniani, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS255",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/g732df32k_smk52-kas255-athena-pallas-giustiniani.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/pz50h152p_KAS255_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record identifies the original as the Athena Pallas Giustiniani type in the Vatican's Museo Chiaramonti and dates the Greek prototype to the early 4th century BCE."
    }),
    defaults: {
      zoom: 2.92,
      lightAngle: 28,
      lightPower: 2.16,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./athena_pallas_giustiniani_source_small.stl",
      fallbackUrl: "./athena_pallas_giustiniani_source_small.stl"
    }
  },
  "medici-faun": {
    kind: "stl",
    path: "/medici-faun/",
    sectionId: "antiquity",
    sortOrder: 29.1,
    viewerTitle: "Medici Faun (Roman copy after a Hellenistic original, c. 200 BCE)",
    subtitle: "Artist: Unknown Roman workshop after a Hellenistic original",
    medium: "Marble",
    dimensions: "H: 141.5 cm | W: 81 cm | D: 54.5 cm",
    lobbyMeta: "Source: SMK Open plaster-cast scan (KAS460)",
    source: smkSource({
      summary: "SMK Open source mesh for the Medici Faun, localized into Form Gallery's native STL viewer.",
      recordUrl: "https://open.smk.dk/en/artwork/image/KAS460",
      fullUrl: "https://api.smk.dk/api/v1/download-3d/kk91fr31m_09-smk-dancing-satyr-inv-460.stl",
      fallbackUrl: "https://api.smk.dk/api/v1/download-3d/44558j590_KAS460_small.stl",
      note: "SMK catalogs the object itself as a plaster cast. The source record identifies the original as the Medici Faun / dancing satyr type in the Uffizi and dates the Greek prototype to around 200 BCE."
    }),
    defaults: {
      zoom: 2.88,
      lightAngle: 28,
      lightPower: 2.12,
      exposure: 0.43,
      rough: 0.2
    },
    model: {
      primaryUrl: "./medici_faun_source_small.stl",
      fallbackUrl: "./medici_faun_source_small.stl"
    }
  }
};
