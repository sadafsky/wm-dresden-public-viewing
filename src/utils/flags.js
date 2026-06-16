// Map team codes → flagcdn slugs (ISO 3166-1 alpha-2 / UK nations).
// Covers BOTH FIFA codes (static data) and ISO3 codes (live football-data API).
export const CODE_TO_ISO = {
  // Hosts
  USA: 'us', CAN: 'ca', MEX: 'mx',
  // Europe
  GER: 'de', DEU: 'de', ESP: 'es', FRA: 'fr',
  ENG: 'gb-eng', SCO: 'gb-sct', SCT: 'gb-sct', WAL: 'gb-wls',
  POR: 'pt', PRT: 'pt', NED: 'nl', NLD: 'nl', HOL: 'nl',
  ITA: 'it', BEL: 'be', CRO: 'hr', HRV: 'hr', SUI: 'ch', CHE: 'ch',
  AUT: 'at', DEN: 'dk', DNK: 'dk', POL: 'pl', SWE: 'se', NOR: 'no',
  SRB: 'rs', TUR: 'tr', UKR: 'ua', CZE: 'cz', HUN: 'hu',
  GRE: 'gr', GRC: 'gr', SVN: 'si', SVK: 'sk', ROU: 'ro', ROM: 'ro',
  // South America
  BRA: 'br', ARG: 'ar', URU: 'uy', URY: 'uy', COL: 'co', ECU: 'ec',
  PER: 'pe', CHI: 'cl', CHL: 'cl', PAR: 'py', PRY: 'py', VEN: 've', BOL: 'bo',
  // Africa
  MAR: 'ma', SEN: 'sn', TUN: 'tn', ALG: 'dz', DZA: 'dz', EGY: 'eg',
  NGA: 'ng', NGR: 'ng', CMR: 'cm', GHA: 'gh', CIV: 'ci',
  RSA: 'za', ZAF: 'za', MLI: 'ml', ANG: 'ao', AGO: 'ao', CPV: 'cv',
  COD: 'cd', DRC: 'cd', COG: 'cg', GUI: 'gn', GIN: 'gn',
  // Asia / Oceania
  JPN: 'jp', KOR: 'kr', IRN: 'ir', KSA: 'sa', SAU: 'sa', AUS: 'au',
  QAT: 'qa', IRQ: 'iq', UAE: 'ae', ARE: 'ae', UZB: 'uz', JOR: 'jo',
  NZL: 'nz',
  // CONCACAF & Caribbean
  CRC: 'cr', CRI: 'cr', PAN: 'pa', JAM: 'jm', HON: 'hn', HND: 'hn',
  HAI: 'ht', HTI: 'ht', CUW: 'cw', SLV: 'sv', GUA: 'gt', GTM: 'gt',
}

export function flagUrl(code) {
  const iso = CODE_TO_ISO[(code || '').toUpperCase()]
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null
}
