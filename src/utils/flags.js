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
  TRI: 'tt', SUR: 'sr', GUY: 'gy', NCA: 'ni', GRN: 'gd', SKN: 'kn',
  CUB: 'cu', DOM: 'do', BRB: 'bb', ATG: 'ag', LCA: 'lc', VIN: 'vc',
  DMA: 'dm', BLZ: 'bz', BAH: 'bs', BER: 'bm', ARU: 'aw',
  // Rest of UEFA
  BIH: 'ba', MKD: 'mk', ALB: 'al', ISR: 'il', FIN: 'fi', ISL: 'is',
  IRL: 'ie', NIR: 'gb-nir', MNE: 'me', KOS: 'xk', GEO: 'ge', ARM: 'am',
  AZE: 'az', KAZ: 'kz', BUL: 'bg', BGR: 'bg', BLR: 'by', LUX: 'lu',
  LTU: 'lt', LVA: 'lv', EST: 'ee', CYP: 'cy', MLT: 'mt', AND: 'ad',
  FRO: 'fo', GIB: 'gi', LIE: 'li', SMR: 'sm', MDA: 'md',
  // More Africa
  BFA: 'bf', GAB: 'ga', BEN: 'bj', TOG: 'tg', ZAM: 'zm', TAN: 'tz',
  UGA: 'ug', KEN: 'ke', MTN: 'mr', SDN: 'sd', LBY: 'ly', EQG: 'gq',
  GAM: 'gm', GNB: 'gw', COM: 'km', MAD: 'mg', MDG: 'mg', MOZ: 'mz',
  NAM: 'na', BOT: 'bw', ZIM: 'zw', SLE: 'sl', LBR: 'lr', NIG: 'ne',
  // More Asia
  THA: 'th', VIE: 'vn', IND: 'in', IDN: 'id', MAS: 'my', PHI: 'ph',
  TJK: 'tj', TKM: 'tm', KGZ: 'kg', PLE: 'ps', LBN: 'lb', SYR: 'sy',
  KUW: 'kw', YEM: 'ye', HKG: 'hk', BHR: 'bh', OMA: 'om', CHN: 'cn',
  PRK: 'kp', SGP: 'sg', MNG: 'mn',
  // More Oceania
  FIJ: 'fj', SOL: 'sb', VAN: 'vu', PNG: 'pg', NCL: 'nc', TAH: 'pf',
  COK: 'ck', SAM: 'ws', TGA: 'to',
}

export function flagUrl(code) {
  const iso = CODE_TO_ISO[(code || '').toUpperCase()]
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null
}
