// Pure helpers for turning a fetched Eurostat JSON-stat dataset into
// per-country documents ready for MongoDB. Kept free of any DB code so the
// transformation logic can be unit-tested on its own.

// Read a single { value, status } cell for one country in one year.
// Using the JSON-stat toolkit's object selector (Data({geo, time})) means we
// never have to compute flat-array offsets by hand, so it stays correct no
// matter what order Eurostat lists the dimensions in. Missing cells (a country
// that reports nothing for a given year) are normalised to an explicit null.
function readCell(ds, geoId, yearId) {
  const cell = ds.Data({ geo: geoId, time: yearId });
  const point = Array.isArray(cell) ? cell[0] : cell;
  const value = point && point.value != null ? point.value : null;
  const status = point && point.status != null ? point.status : null;
  return { time: yearId, value, status };
}

// Turn one fetched dataset into an array of documents, one per country:
//   { datasetId, geo, country, label, data: [{ time, value, status }, ...] }
export function datasetToSeries(ds, datasetCode) {
  const geoDim = ds.Dimension('geo');
  const timeDim = ds.Dimension('time');

  return geoDim.id.map((geoId, geoIndex) => ({
    datasetId: datasetCode,
    geo: geoId,
    country: geoDim.Category(geoIndex).label,
    label: ds.label,
    data: timeDim.id.map((yearId) => readCell(ds, geoId, yearId)),
  }));
}

// Does a country document actually contain at least one observation? Used to
// drop countries that appear in a dataset's code list but report no data, so
// the UI never offers an empty series.
export function hasObservations(doc) {
  return Array.isArray(doc.data) && doc.data.some((point) => point.value != null);
}
