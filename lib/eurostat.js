// Thin client for Eurostat's current dissemination API (the old wdds/rest
// endpoint the jsonstat-euro package used was retired in Oct 2023). Returns a
// JSON-stat toolkit Dataset, the same interface the rest of the code expects.
import JSONstat from 'jsonstat-toolkit';

const BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

// Build the request URL for a dataset code + filter map.
export function buildUrl(dataset, filter = {}, { lang = 'EN' } = {}) {
  const params = new URLSearchParams({ format: 'JSON', lang });
  for (const [key, value] of Object.entries(filter)) params.append(key, value);
  return `${BASE}/${dataset}?${params.toString()}`;
}

// Fetch + parse one dataset. Throws on a non-2xx response so callers can treat
// transport failures distinctly from valid-but-empty responses.
export async function fetchDataset(query, { timeoutMs = 20000 } = {}) {
  const url = buildUrl(query.dataset, query.filter);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      err.status = res.status;
      throw err;
    }
    return JSONstat(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

// A dataset is "empty" when any dimension has zero categories - which is what
// Eurostat returns (HTTP 200, class "dataset") when a filter code no longer
// exists. Such a response has no usable observations.
export function isEmpty(ds) {
  const sizes = (ds && ds.size) || [];
  return sizes.length === 0 || sizes.some((n) => !n);
}
