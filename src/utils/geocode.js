const CACHE_KEY = 'wm_geocache_v1'

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}

function writeCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch {}
}

export function getCached(address) {
  return readCache()[address] ?? null
}

export async function geocodeAddress(address) {
  const cache = readCache()
  if (cache[address]) return cache[address]

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WM-Dresden-2026-Public-Viewing/1.0' },
  })
  if (!res.ok) throw new Error(`Nominatim ${res.status}`)

  const data = await res.json()
  if (!data[0]) throw new Error(`Not found: ${address}`)

  const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)]
  cache[address] = coords
  writeCache(cache)
  return coords
}
