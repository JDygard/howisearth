// The Eurostat datasets this app tracks: a dataset code plus the filters that
// pin every dimension except geo and time, so each fetch returns one number per
// country per year. Filter codes occasionally change when Eurostat revises a
// dataset, so this list is the single place to keep them current.
// (Codes verified against the dissemination API in 2026.)
export const queryList = [
  // Population totals
  { dataset: 'demo_pjan', filter: { age: 'TOTAL', sex: 'T' } },
  // Projected population totals (baseline scenario)
  { dataset: 'proj_19np', filter: { age: 'TOTAL', sex: 'T', projection: 'BSL' } },
  // GDP per capita
  { dataset: 'nama_10_pc', filter: { unit: 'CP_EUR_HAB', na_item: 'B1GQ' } },
  // Total GDP
  { dataset: 'nama_10_gdp', filter: { unit: 'CP_MEUR', na_item: 'B1GQ' } },
  // Forest area
  { dataset: 'for_area', filter: { indic_fo: 'FOR' } },
  // Timber by volume
  { dataset: 'for_vol', filter: { indic_fo: 'FOR' } },
  // Total net greenhouse gas emissions per capita
  { dataset: 'sdg_13_10', filter: { src_crf: 'TOTXMEMO', unit: 'T_HAB' } },
  // Greenhouse gas emissions per capita by source sector (NACE Rev.2)
  { dataset: 'env_ac_ainah_r2', filter: { airpol: 'GHG', nace_r2: 'A', unit: 'KG_HAB' } },
  { dataset: 'env_ac_ainah_r2', filter: { airpol: 'GHG', nace_r2: 'B', unit: 'KG_HAB' } },
  { dataset: 'env_ac_ainah_r2', filter: { airpol: 'GHG', nace_r2: 'C', unit: 'KG_HAB' } },
  { dataset: 'env_ac_ainah_r2', filter: { airpol: 'GHG', nace_r2: 'D', unit: 'KG_HAB' } },
  // Waste generation per capita
  { dataset: 'env_wasgen', filter: { unit: 'KG_HAB', hazard: 'HAZ_NHAZ', nace_r2: 'TOTAL_HH', waste: 'W101' } },
  { dataset: 'env_wasgen', filter: { unit: 'KG_HAB', hazard: 'HAZ_NHAZ', nace_r2: 'TOTAL_HH', waste: 'TOTAL' } },
  // Renewable electricity production capacity (net maximum electrical capacity, MW)
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'RA100', plant_tec: 'CAP_NET_ELC' } }, // Hydro
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'RA200', plant_tec: 'CAP_NET_ELC' } }, // Geothermal
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'RA300', plant_tec: 'CAP_NET_ELC' } }, // Wind
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'RA400', plant_tec: 'CAP_NET_ELC' } }, // Solar
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'RA500', plant_tec: 'CAP_NET_ELC' } }, // Tide/wave/ocean
  { dataset: 'nrg_inf_epcrw', filter: { siec: 'W6000', plant_tec: 'CAP_NET_ELC' } }, // Waste
  // Share of energy from renewable sources
  { dataset: 'nrg_ind_ren', filter: { nrg_bal: 'REN' } },
  // Gross electricity production by type of fuel (GWh)
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'C0000X0350-0370', unit: 'GWH' } },
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'C0350-0370', unit: 'GWH' } },
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'FE', unit: 'GWH' } },
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'N900H', unit: 'GWH' } },
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'TOTAL', unit: 'GWH' } },
  { dataset: 'nrg_bal_peh', filter: { nrg_bal: 'GEP', siec: 'O4000XBIO', unit: 'GWH' } },
];
