// Stale-while-revalidate helpers for on-read data refresh. Deliberately free of
// any database or network specifics: callers inject the function that actually
// re-fetches a metric, and this module handles the TTL check and in-flight
// de-duplication. That keeps the policy easy to unit-test in isolation.

// A document is stale if it is missing, has no numeric timestamp, or its `date`
// (epoch ms) is older than ttlMs. A cache miss (no doc) counts as stale, which
// is what makes "miss" and "expired" share the same refresh path.
export function isStale(doc, ttlMs, now = Date.now()) {
  if (!doc || typeof doc.date !== 'number') return true;
  return now - doc.date > ttlMs;
}

// Build a de-duplicating refresher around refreshFn(metricId). Concurrent calls
// for the same metricId share one in-flight promise, so a burst of clicks can
// never trigger the same Eurostat download more than once at a time. refreshFn
// is expected to resolve (not reject); any rejection is contained and surfaced
// as a falsy result so background callers never produce unhandled rejections.
export function createRefresher(refreshFn) {
  const inFlight = new Map();

  function refreshMetric(metricId) {
    const existing = inFlight.get(metricId);
    if (existing) return existing;

    const p = Promise.resolve()
      .then(() => refreshFn(metricId))
      .catch(() => false)
      .finally(() => inFlight.delete(metricId));

    inFlight.set(metricId, p);
    return p;
  }

  return { refreshMetric, inFlight };
}
