import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import RenderChart from './components/StackedAreaChart.js';
import { socket } from './components/context/socket';

// The "zipper": merge a received series into the chart rows, keyed by year.
// Returns brand-new objects so React re-renders.
function mergeSeries(rows, points, seriesKey) {
  const byTime = new Map(rows.map((row) => [row.time, { ...row }]));
  points.forEach((point) => {
    const row = byTime.get(point.time) || { time: point.time };
    row[seriesKey] = point.value;
    byTime.set(point.time, row);
  });
  return Array.from(byTime.values()).sort((a, b) => a.time.localeCompare(b.time));
}

// Remove one series' column from every chart row.
function dropSeries(rows, seriesKey) {
  return rows.map((row) => {
    const { [seriesKey]: _omit, ...rest } = row;
    return rest;
  });
}

// Stable line key per (country, metric). With one active metric the metric part
// is constant, but keeping it makes the legend self-describing.
const seriesKeyFor = (countryName, metricDisplay) => `${countryName} — ${metricDisplay}`;

function App() {
  const [metrics, setMetrics] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activeMetricId, setActiveMetricId] = useState('');
  const [selectedGeos, setSelectedGeos] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState('Loading available data…');

  // Refs so the once-registered socket handlers see current values.
  const activeKeys = useRef(new Set());
  const activeMetricIdRef = useRef('');
  useEffect(() => {
    activeMetricIdRef.current = activeMetricId;
  }, [activeMetricId]);

  useEffect(() => {
    const handleCatalog = ({ metrics: m = [], countries: c = [] }) => {
      setMetrics(m);
      setCountries(c);
      setStatus(
        m.length
          ? ''
          : 'No data yet — start the server once with INGEST=true to populate the database.'
      );
      if (m.length) {
        const first = m[0];
        activeMetricIdRef.current = activeMetricIdRef.current || first.id;
        setActiveMetricId((cur) => cur || first.id);
        // Plot one country up front so the chart isn't blank.
        const firstGeo = first.geos.find((g) => c.some((x) => x.geo === g));
        if (firstGeo) {
          setSelectedGeos((cur) => (cur.length ? cur : [firstGeo]));
          socket.emit('data', { metricId: first.id, geo: firstGeo });
        }
      }
    };

    const handleData = (payload) => {
      if (!payload || !Array.isArray(payload.data)) return;
      // Ignore late responses for a metric we've since switched away from.
      if (payload.metricId && payload.metricId !== activeMetricIdRef.current) return;
      const key = seriesKeyFor(payload.country || payload.geo, payload.display || payload.label);
      activeKeys.current.add(key);
      setChartData((rows) => mergeSeries(rows, payload.data, key));
      setSeries((keys) => (keys.includes(key) ? keys : [...keys, key]));
    };

    // Background refresh landed: update in place only if still on the chart.
    const handleUpdate = (payload) => {
      if (!payload || !Array.isArray(payload.data)) return;
      if (payload.metricId && payload.metricId !== activeMetricIdRef.current) return;
      const key = seriesKeyFor(payload.country || payload.geo, payload.display || payload.label);
      if (!activeKeys.current.has(key)) return;
      setChartData((rows) => mergeSeries(rows, payload.data, key));
    };

    socket.on('catalog', handleCatalog);
    socket.on('data', handleData);
    socket.on('data:update', handleUpdate);
    socket.emit('catalog');

    return () => {
      socket.off('catalog', handleCatalog);
      socket.off('data', handleData);
      socket.off('data:update', handleUpdate);
    };
  }, []);

  const activeMetric = metrics.find((m) => m.id === activeMetricId);

  const countryName = useMemo(() => {
    const byGeo = new Map(countries.map((c) => [c.geo, c.country]));
    return (geo) => byGeo.get(geo) || geo;
  }, [countries]);

  // Only countries with data for the active metric get a pill.
  const availableCountries = useMemo(() => {
    if (!activeMetric) return countries;
    const ok = new Set(activeMetric.geos);
    return countries.filter((c) => ok.has(c.geo));
  }, [activeMetric, countries]);

  // Switch the active dataset: reset the chart and re-plot whichever selected
  // countries also have data for the new metric.
  const selectMetric = (id) => {
    if (id === activeMetricId) return;
    const m = metrics.find((x) => x.id === id);
    const ok = new Set(m ? m.geos : []);
    const kept = selectedGeos.filter((g) => ok.has(g));

    activeKeys.current = new Set();
    activeMetricIdRef.current = id;
    setActiveMetricId(id);
    setSelectedGeos(kept);
    setChartData([]);
    setSeries([]);
    kept.forEach((g) => socket.emit('data', { metricId: id, geo: g }));
  };

  const toggleCountry = (geo) => {
    if (selectedGeos.includes(geo)) {
      setSelectedGeos((gs) => gs.filter((g) => g !== geo));
      if (activeMetric) {
        const key = seriesKeyFor(countryName(geo), activeMetric.display);
        activeKeys.current.delete(key);
        setSeries((keys) => keys.filter((k) => k !== key));
        setChartData((rows) => dropSeries(rows, key));
      }
    } else {
      setSelectedGeos((gs) => [...gs, geo]);
      socket.emit('data', { metricId: activeMetricId, geo });
    }
  };

  const clearAll = () => {
    activeKeys.current = new Set();
    setSelectedGeos([]);
    setChartData([]);
    setSeries([]);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="brand">How is Earth?</h1>

        <section className="picker">
          <h2>Dataset</h2>
          <div className="pills">
            {metrics.map((m) => (
              <button
                key={m.id}
                type="button"
                className={'pill' + (m.id === activeMetricId ? ' pill--active' : '')}
                onClick={() => selectMetric(m.id)}
              >
                {m.display}
              </button>
            ))}
          </div>
        </section>

        <section className="picker">
          <div className="picker__head">
            <h2>Countries</h2>
            {selectedGeos.length > 0 && (
              <button type="button" className="link" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>
          <div className="pills">
            {availableCountries.map((c) => (
              <button
                key={c.geo}
                type="button"
                className={'pill' + (selectedGeos.includes(c.geo) ? ' pill--active' : '')}
                onClick={() => toggleCountry(c.geo)}
              >
                {c.country}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <main className="chart-area">
        {activeMetric && <h2 className="metric-title">{activeMetric.display}</h2>}
        {status && <p className="status">{status}</p>}
        <RenderChart chartData={chartData} series={series} />
      </main>
    </div>
  );
}

export default App;
