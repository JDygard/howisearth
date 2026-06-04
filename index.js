import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

import { queryList } from './lib/queries.js';
import { fetchDataset, isEmpty } from './lib/eurostat.js';
import { datasetToSeries, hasObservations } from './lib/transform.js';
import { makeMetricId, buildDisplay } from './lib/metrics.js';
import { isStale, createRefresher } from './lib/freshness.js';

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB;

// How old (in days) a metric's data may be before a read triggers a refresh.
// Eurostat datasets update a few times a year, so a week is plenty by default.
const FRESHNESS_MS = (Number(process.env.FRESHNESS_DAYS) || 7) * 24 * 60 * 60 * 1000;

if (!uri) {
  console.error('Missing MONGODB connection string. Add MONGODB=... to a .env file.');
  process.exit(1);
}

const mongo = new MongoClient(uri);
const database = mongo.db('how_is_earth');
const earthDB = database.collection('earthDB');

// metricId -> query, so an on-read refresh can find the right Eurostat call.
const queryByMetricId = new Map(queryList.map((q) => [makeMetricId(q.dataset, q.filter), q]));

// =============================== Ingestion ====================
// Fetch one dataset from Eurostat and upsert one document per country that
// actually has data, pruning any countries that previously did but no longer.
async function fetchAndSave(query) {
  const ds = await fetchDataset(query);

  if (!ds || ds.class !== 'dataset') {
    console.error(`  fetch failed for ${query.dataset}: not a dataset`);
    return;
  }
  if (isEmpty(ds)) {
    // HTTP 200 but no observations - almost always a stale/invalid filter code.
    console.warn(`  no data for ${query.dataset} ${JSON.stringify(query.filter)} - check filter codes`);
    return;
  }

  const metricId = makeMetricId(query.dataset, query.filter);
  const allCountries = datasetToSeries(ds, query.dataset);
  // Only keep countries with at least one real observation, so the selector
  // never offers an empty series.
  const docs = allCountries.filter(hasObservations);
  const keptGeos = docs.map((doc) => doc.geo);

  const ops = docs.map((doc) =>
    earthDB.updateOne(
      { metricId, geo: doc.geo },
      {
        $set: {
          metricId,
          datasetId: doc.datasetId,
          filter: query.filter,
          label: doc.label,
          country: doc.country,
          date: Date.now(),
          data: doc.data,
        },
      },
      { upsert: true }
    )
  );
  await Promise.all(ops);

  // Remove any stored rows for this metric that are no longer present/non-empty
  // (clears out empties written before this filter existed).
  await earthDB.deleteMany({ metricId, geo: { $nin: keptGeos } });

  console.log(`  saved ${ds.label} (${docs.length}/${allCountries.length} countries have data)`);
}

// Refresh every dataset. Sequential so we don't hammer the Eurostat API, and
// fully awaited so the DB connection is never closed mid-write.
async function ingestAll() {
  console.log(`Refreshing ${queryList.length} datasets from Eurostat...`);
  for (const query of queryList) {
    try {
      await fetchAndSave(query);
    } catch (err) {
      console.error(`  error on ${query.dataset}: ${err.message}`);
    }
  }
  console.log('Ingestion complete.');
}

// Re-fetch a single metric by id (one Eurostat call covers all its countries).
// Resolves to true on success, false if the id is unknown or the fetch fails -
// it never rejects, so background callers can't raise unhandled rejections.
async function refreshOne(metricId) {
  const query = queryByMetricId.get(metricId);
  if (!query) return false;
  try {
    await fetchAndSave(query);
    return true;
  } catch (err) {
    console.error(`  refresh failed for ${metricId}: ${err.message}`);
    return false;
  }
}

// De-duplicated refresher: concurrent requests for the same metric share one
// in-flight download.
const { refreshMetric } = createRefresher(refreshOne);

// =============================== Catalog (for the selector UI) ====================
// What metrics and countries do we actually have data for? Derived from the DB
// (which now holds only non-empty series), and each metric carries the exact
// set of countries it has - so the UI can narrow the country list per metric
// and never offer a combination that returns nothing.
async function getCatalog() {
  const metricsAgg = await earthDB
    .aggregate([
      {
        $group: {
          _id: '$metricId',
          datasetId: { $first: '$datasetId' },
          filter: { $first: '$filter' },
          label: { $first: '$label' },
          geos: { $addToSet: '$geo' },
        },
      },
    ])
    .toArray();

  const metrics = metricsAgg
    .map((m) => ({
      id: m._id,
      datasetId: m.datasetId,
      display: buildDisplay(m.label, m.filter),
      geos: m.geos.sort(),
    }))
    .sort((a, b) => a.display.localeCompare(b.display));

  const countriesAgg = await earthDB
    .aggregate([{ $group: { _id: '$geo', country: { $first: '$country' } } }])
    .toArray();

  const countries = countriesAgg
    .map((c) => ({ geo: c._id, country: c.country || c._id }))
    .sort((a, b) => a.country.localeCompare(b.country));

  return { metrics, countries };
}

function withDisplay(doc) {
  doc.display = buildDisplay(doc.label, doc.filter);
  return doc;
}

// Stale-while-revalidate read for one metric + country. Returns the document to
// serve now plus, when a stale copy was served, the in-flight refresh promise
// so the caller can push fresh data once it lands.
//  - Hit & fresh:  return it, no revalidation.
//  - Hit & stale:  return it now; revalidation refreshes for next time.
//  - Miss:         treat as infinitely stale - wait for a fetch, then return.
// Always falls back to whatever we have (even stale) if a refresh fails.
async function getSeries(metricId, geo) {
  let doc = await earthDB.findOne({ metricId, geo });

  if (doc && !isStale(doc, FRESHNESS_MS)) {
    return { doc: withDisplay(doc), revalidation: null };
  }

  if (doc) {
    return { doc: withDisplay(doc), revalidation: refreshMetric(metricId) };
  }

  const ok = await refreshMetric(metricId);
  if (ok) doc = await earthDB.findOne({ metricId, geo });
  return { doc: doc ? withDisplay(doc) : null, revalidation: null };
}

// =============================== Server ====================
async function start() {
  await mongo.connect();
  console.log('Connected to MongoDB.');

  // Optional bulk warm-up. Data also self-refreshes on read now, so this is
  // mainly for seeding the catalog and pre-filling everything in one go.
  if (process.env.INGEST === 'true') {
    await ingestAll();
  }

  const app = express();
  app.use(express.static('howisearth/build'));

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: ['http://localhost:3000', `http://localhost:${PORT}`] },
  });

  io.on('connection', (socket) => {
    socket.on('catalog', async () => {
      try {
        socket.emit('catalog', await getCatalog());
      } catch (err) {
        console.error('socket "catalog" error:', err.message);
        socket.emit('catalog', { metrics: [], countries: [] });
      }
    });

    socket.on('data', async ({ metricId, geo } = {}) => {
      if (!metricId || !geo) {
        socket.emit('data', null);
        return;
      }
      try {
        const { doc, revalidation } = await getSeries(metricId, geo);
        socket.emit('data', doc);

        if (revalidation) {
          revalidation
            .then(async (ok) => {
              if (!ok) return;
              const fresh = await earthDB.findOne({ metricId, geo });
              if (fresh) socket.emit('data:update', withDisplay(fresh));
            })
            .catch((err) => console.error('revalidation push error:', err.message));
        }
      } catch (err) {
        console.error('socket "data" error:', err.message);
        socket.emit('data', null);
      }
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve('howisearth/build', 'index.html'));
  });

  httpServer.listen(PORT, () => {
    console.log(`How is Earth? running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
