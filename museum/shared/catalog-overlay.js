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
const DONATELLO_SUBTITLE = "Artist attribution: Donatello (c. 1386-1466)";
const VERROCCHIO_SUBTITLE = "Artist: Andrea del Verrocchio (c. 1435-1488)";

export const museumPiecesExtension = {
  "donatello-cecilia-gonzaga": {
    kind: "sketchfab",
    path: "/donatello/cecilia-gonzaga/",
    sectionId: "early-renaissance",
    sortOrder: 11,
    viewerTitle: "Cecilia Gonzaga (attributed to Donatello, 15th century)",
    subtitle: DONATELLO_SUBTITLE,
    lobbyMeta: "Source: Sketchfab / The Spis Museum",
    source: source(
      "Sketchfab scan published by The Spis Museum.",
      [
        link("Sketchfab model", "https://sketchfab.com/3d-models/ceciliae-gonzagae-sm-7156-9dac3be34f894e94815b7c691e8971f5")
      ],
      "The source museum description says the Carrara marble bust is assumed to represent Cecilia Gonzaga and is probably by Donatello."
    ),
    defaults: {
      zoom: 2.2,
      lightAngle: 20,
      lightPower: 2.1,
      exposure: 0.48,
      rough: 0.2
    },
    model: {
      uid: "9dac3be34f894e94815b7c691e8971f5",
      transparent: true
    }
  },
  "donatello-our-lady-of-forgiveness": {
    kind: "sketchfab",
    path: "/donatello/our-lady-of-forgiveness/",
    sectionId: "early-renaissance",
    sortOrder: 12,
    viewerTitle: "Our Lady of Forgiveness (1457-1459)",
    subtitle: "Artist: Donatello (c. 1386-1466)",
    lobbyMeta: "Source: Sketchfab / Siena photogrammetry",
    source: source(
      "Sketchfab photogrammetry model made in collaboration with Opera del Duomo, Siena.",
      [
        link("Sketchfab model", "https://sketchfab.com/3d-models/our-lady-of-forgiveness-donatello-siena-2a72b9f22da043eab0ff0988ac570ec0")
      ],
      "The source description identifies this as Donatello's La Madonna del Perdono, a marble sculpture from the Cathedral in Siena, recorded in August 2022."
    ),
    defaults: {
      zoom: 2.4,
      lightAngle: 18,
      lightPower: 2.05,
      exposure: 0.46,
      rough: 0.2
    },
    model: {
      uid: "2a72b9f22da043eab0ff0988ac570ec0",
      transparent: true
    }
  },
  "verrocchio-david": {
    kind: "sketchfab",
    path: "/verrocchio/david/",
    sectionId: "early-renaissance",
    sortOrder: 13,
    viewerTitle: "David (Andrea del Verrocchio, 1470s)",
    subtitle: VERROCCHIO_SUBTITLE,
    lobbyMeta: "Source: Sketchfab / Artec 3D scan",
    source: source(
      "Sketchfab model published as a free downloadable scan by CIMtech Inc.",
      [
        link("Sketchfab model", "https://sketchfab.com/3d-models/david-statue-3d-scan-artec-3d-08c5b7a46d23401cacaec1acb6c55211")
      ],
      "The source page describes this as Andrea del Verrocchio's David, scanned from a plaster copy."
    ),
    defaults: {
      zoom: 2.1,
      lightAngle: 22,
      lightPower: 2.15,
      exposure: 0.5,
      rough: 0.2
    },
    model: {
      uid: "08c5b7a46d23401cacaec1acb6c55211",
      transparent: true
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
      targetHeight: 1.54,
      defaultYaw: -Math.PI * 0.16
    }
  }
};
