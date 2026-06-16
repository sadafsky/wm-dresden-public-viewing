// Map FIFA 3-letter codes → flagcdn slugs (ISO 3166-1 alpha-2, plus UK nations).
const ISO = {
  GER: 'de', ESP: 'es', FRA: 'fr', BRA: 'br', ARG: 'ar', ENG: 'gb-eng',
  NED: 'nl', POR: 'pt', ITA: 'it', BEL: 'be', CRO: 'hr', URU: 'uy',
  MAR: 'ma', MEX: 'mx', USA: 'us', SUI: 'ch', JPN: 'jp', SEN: 'sn',
  COL: 'co', KOR: 'kr', CMR: 'cm', NOR: 'no', ECU: 'ec', SWE: 'se',
  TUN: 'tn', IRQ: 'iq', CPV: 'cv', CIV: 'ci', SCO: 'gb-sct', WAL: 'gb-wls',
  CAN: 'ca', AUS: 'au', KSA: 'sa', QAT: 'qa', IRN: 'ir', GHA: 'gh',
  NGA: 'ng', EGY: 'eg', ALG: 'dz', CRC: 'cr', PAN: 'pa', JAM: 'jm',
  PAR: 'py', PER: 'pe', CHI: 'cl', VEN: 've', BOL: 'bo', TUR: 'tr',
  GRE: 'gr', SRB: 'rs', UKR: 'ua', CZE: 'cz', ROU: 'ro', HUN: 'hu',
  SVN: 'si', SVK: 'sk', POL: 'pl', AUT: 'at', DEN: 'dk', SCG: 'rs',
  RSA: 'za', UZB: 'uz', JOR: 'jo', NZL: 'nz', HAI: 'ht', CUW: 'cw',
}

export function flagUrl(code) {
  const iso = ISO[(code || '').toUpperCase()]
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null
}
