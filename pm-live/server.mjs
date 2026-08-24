import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 10000);
const IRAN_INTERVAL_MS = 60_000;
// GoldAPI free tier: 100 requests/month. 9h => max ~80 scheduled calls/month.
const GLOBAL_INTERVAL_MS = 9 * 60 * 60 * 1000;
const TIMEOUT_MS = 20_000;

const IRAN_URL = process.env.IRAN_API_URL || 'https://api.brsapi.ir/Market/Gold_Currency.php';
const IRAN_KEY = process.env.IRAN_API_KEY || '';
const GOLD_KEY = process.env.GOLDAPI_KEY || '';

let cache = {
  iran: { data: null, fetchedAt: 0, error: null },
  global: { data: null, fetchedAt: 0, error: null },
};
let iranPromise = null;
let globalPromise = null;

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬\s]/g, '').replace('%', '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

function normalizeName(v) { return String(v ?? '').replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim(); }

function normalizeIranItem(item, categoryHint = '') {
  if (!item || typeof item !== 'object') return null;
  const name = normalizeName(item.name ?? item.title ?? item.Name ?? item.Title ?? item.symbol ?? item.Symbol ?? item.fa_name ?? item.en_name);
  const price = num(item.price ?? item.Price ?? item.value ?? item.Value ?? item.last ?? item.last_price ?? item.sell ?? item.buy ?? item.current);
  if (!name || price === null) return null;
  const change = num(item.change_percent ?? item.ChangePercent ?? item.percent ?? item.percentage ?? item.change ?? item.change_value);
  const unit = normalizeName(item.unit ?? item.Unit ?? item.type ?? item.Type ?? '');
  return { name, price, change, unit, source: 'iran' , categoryHint };
}

const aliases = {
  gold: ['gold','golds','tal','tala','طلا','طلایی'], coin: ['coin','coins','sekeh','sekkeh','seke','سکه'], currency: ['currency','currencies','arz','ارز','curr'], stock: ['stock','stocks','bors','bourse','بورس','شاخص'], crypto: ['crypto','cryptocurrency','cryptocurrencies','ramzarz','رمزارز','رمزارزها']
};
function clean(v) { return normalizeName(v).toLowerCase().replace(/[_-]/g, '').replace(/\s/g, ''); }
function categoryFromKey(key) {
  const k = clean(key);
  for (const [cat, list] of Object.entries(aliases)) if (list.some(a => clean(a) === k)) return cat;
  return null;
}
function categoryFromName(name) {
  const n = clean(name);
  if (['سکه','امامی','بهارآزادی','نیمسکه','ربعسکه','سکهگرمی','coin'].some(x => n.includes(clean(x)))) return 'coin';
  if (['bitcoin','btc','ethereum','eth','tether','usdt','bnb','solana','sol','xrp','dogecoin','crypto','رمزارز','بیتکوین','اتریوم'].some(x => n.includes(clean(x)))) return 'crypto';
  if (['شاخص','بورس','هموزن','شاخصکل','stock','index'].some(x => n.includes(clean(x)))) return 'stock';
  if (['دلار','یورو','پوند','درهم','لیر','روبل','دینار','ریال','usd','eur','aed','gbp','currency'].some(x => n.includes(clean(x)))) return 'currency';
  if (['طلا','گرمطلا','طلای','آبشده','آبشده','انس','اونس','gold'].some(x => n.includes(clean(x)))) return 'gold';
  return null;
}
function walkArrays(value, path = '', out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) { out.push({ key: path, items: value }); return out; }
  for (const [k, v] of Object.entries(value)) walkArrays(v, path ? `${path}.${k}` : k, out);
  return out;
}
function normalizeIranPayload(payload) {
  const result = { gold: [], coin: [], currency: [], stock: [], crypto: [] };
  const root = payload?.data && typeof payload.data === 'object' ? payload.data : payload?.result && typeof payload.result === 'object' ? payload.result : payload;
  const arrays = walkArrays(root);
  for (const group of arrays) {
    const key = group.key.split('.').pop() || '';
    const explicit = categoryFromKey(key);
    for (const raw of group.items) {
      const item = normalizeIranItem(raw, explicit || '');
      if (!item) continue;
      const cat = explicit === 'gold' && categoryFromName(item.name) === 'coin' ? 'coin' : explicit || categoryFromName(item.name);
      if (cat && result[cat]) result[cat].push({ ...item, category: cat });
    }
  }
  for (const group of arrays) {
    if (categoryFromKey(group.key.split('.').pop() || '')) continue;
    for (const raw of group.items) {
      const item = normalizeIranItem(raw);
      if (!item) continue;
      const cat = categoryFromName(item.name);
      if (cat) result[cat].push({ ...item, category: cat });
    }
  }
  for (const cat of Object.keys(result)) {
    const seen = new Set();
    result[cat] = result[cat].filter(x => { const k = `${clean(x.name)}|${x.price}`; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  return result;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { ...options, signal: controller.signal, headers: { Accept: 'application/json', ...(options.headers || {}) } });
    const text = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 180)}`);
    return JSON.parse(text);
  } finally { clearTimeout(timer); }
}

async function refreshIran(force = false) {
  if (iranPromise) return iranPromise;
  if (!IRAN_KEY) throw new Error('IRAN_API_KEY is not configured');
  if (!force && cache.iran.data && Date.now() - cache.iran.fetchedAt < IRAN_INTERVAL_MS) return cache.iran.data;
  iranPromise = (async () => {
    try {
      const url = `${IRAN_URL}?key=${encodeURIComponent(IRAN_KEY)}`;
      const raw = await fetchJson(url);
      const data = normalizeIranPayload(raw);
      const count = Object.values(data).reduce((a, x) => a + x.length, 0);
      if (!count) throw new Error('Iran API returned no recognizable market items');
      cache.iran = { data, fetchedAt: Date.now(), error: null };
      return data;
    } catch (e) {
      cache.iran.error = e.message;
      if (cache.iran.data) return cache.iran.data;
      throw e;
    } finally { iranPromise = null; }
  })();
  return iranPromise;
}

async function refreshGlobal(force = false) {
  if (globalPromise) return globalPromise;
  if (!GOLD_KEY) throw new Error('GOLDAPI_KEY is not configured');
  if (!force && cache.global.data && Date.now() - cache.global.fetchedAt < GLOBAL_INTERVAL_MS) return cache.global.data;
  globalPromise = (async () => {
    try {
      const url = 'https://www.goldapi.io/api/price/XAU/USD?melt_price=true&currency_info=true&purity=false';
      const raw = await fetchJson(url, { headers: { 'x-access-token': GOLD_KEY } });
      const data = {
        symbol: raw.symbol || 'FOREXCOM:XAUUSD', metal: raw.metal || 'XAU', currency: raw.currency || 'USD', price: num(raw.price), bid: num(raw.bid), ask: num(raw.ask), change: num(raw.change ?? raw.ch), changePercent: num(raw.change_percent ?? raw.chp), gram24k: num(raw.price_gram_24k ?? raw.price_per_unit?.gram ?? raw.melt_price_per_gram?.['24k']), timestamp: raw.timestamp || Math.floor(Date.now()/1000), datetime: raw.datetime || new Date().toISOString()
      };
      if (data.price === null) throw new Error('GoldAPI returned no XAU/USD price');
      cache.global = { data, fetchedAt: Date.now(), error: null };
      return data;
    } catch (e) {
      cache.global.error = e.message;
      if (cache.global.data) return cache.global.data;
      throw e;
    } finally { globalPromise = null; }
  })();
  return globalPromise;
}

async function getMarket(force = false) {
  const [iran, global] = await Promise.allSettled([refreshIran(force), refreshGlobal(force)]);
  return {
    ok: Boolean(cache.iran.data || cache.global.data),
    serverTime: new Date().toISOString(),
    refreshPolicy: { iranMs: IRAN_INTERVAL_MS, globalMs: GLOBAL_INTERVAL_MS },
    iran: cache.iran.data || { gold: [], coin: [], currency: [], stock: [], crypto: [] },
    global: cache.global.data,
    sources: {
      iran: { status: iran.status === 'fulfilled' ? 'ok' : 'stale/error', fetchedAt: cache.iran.fetchedAt || null, error: cache.iran.error },
      global: { status: global.status === 'fulfilled' ? 'ok' : 'stale/error', fetchedAt: cache.global.fetchedAt || null, error: cache.global.error }
    }
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'pm-live', time: new Date().toISOString() }));
app.get('/api/market', async (req, res) => {
  try {
    const force = req.query.refresh === '1';
    const data = await getMarket(force);
    res.setHeader('Cache-Control', 'no-store');
    res.json(data);
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message, serverTime: new Date().toISOString(), cached: Boolean(cache.iran.data || cache.global.data) });
  }
});

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, { maxAge: '5m' }));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PM LIVE listening on ${PORT}`);
  // Warm Iran data on boot; global is warmed lazily and then every 9h.
  refreshIran().catch(e => console.error('Iran warmup:', e.message));
  refreshGlobal().catch(e => console.error('Global warmup:', e.message));
});
