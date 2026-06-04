// Stable identity and friendly labels for a "metric" (a Eurostat dataset code
// plus the filter that pins it down). Kept separate from index.js so it can be
// imported and unit-tested without booting the server.

// A deterministic id for a (dataset, filter) pair, independent of key order, so
// the same metric always maps to the same DB key and the same catalog entry.
export function makeMetricId(datasetId, filter = {}) {
  const parts = Object.keys(filter)
    .sort()
    .map((k) => `${k}=${filter[k]}`);
  return parts.length ? `${datasetId}::${parts.join('&')}` : datasetId;
}

// Friendly names for the filter codes that distinguish otherwise identical
// dataset titles. Unknown codes fall back to the raw code (accurate, if terse).
export const CODE_LABELS = {
  // NACE Rev.2 sections (air emissions by source)
  A: 'Agriculture',
  B: 'Mining & quarrying',
  C: 'Manufacturing',
  D: 'Energy supply',
  // Renewable energy sources (siec)
  RA100: 'Hydro',
  RA200: 'Geothermal',
  RA300: 'Wind',
  RA400: 'Solar',
  RA500: 'Tide/wave/ocean',
  W6000: 'Waste',
  // Fuel groups (siec) in electricity & heat generation
  'C0000X0350-0370': 'Solid fossil fuels',
  N900H: 'Nuclear heat',
  O4000XBIO: 'Oil & petroleum',
  TOTAL: 'Total',
};

// Filter keys that split one dataset code into several distinct metrics.
const DISTINGUISHING = ['nace_r2', 'siec', 'waste'];

// Human-readable label: the Eurostat dataset title, plus the distinguishing
// filter value when one code is split into several metrics.
export function buildDisplay(label, filter = {}) {
  for (const key of DISTINGUISHING) {
    if (filter[key]) return `${label} — ${CODE_LABELS[filter[key]] || filter[key]}`;
  }
  return label;
}
