import fetch from 'node-fetch';
import prisma from '../lib/prisma';

// ---------------- MEMORY ----------------
let latestPrices: Record<string, any> = {};

// ---------------- SAFE FETCH ----------------
async function safeFetch(url: string) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------- SMART PARSER ----------------
function extractPrice(data: any): number {
  if (!data) return 0;

  if (typeof data === 'number') return data;

  if (data.price) return data.price;

  if (data.result) return data.result;

  const val = Object.values(data).find(v => typeof v === 'number');
  return (val as number) || 0;
}

// ---------------- GET PRICE FROM APIs ----------------
async function getPriceFromApis(type: string) {
  const apis = await prisma.apiSource.findMany({
    where: {
      type,
      isActive: true,
    },
    orderBy: {
      priority: 'asc',
    },
  });

  for (const api of apis) {
    const data = await safeFetch(api.url);

    if (data) {
      const price = extractPrice(data);

      if (price > 0) return price;
    }
  }

  return 0;
}

// ---------------- PRODUCT PRICE ----------------
async function getProductPrice(product: any) {
  let basePrice = 0;

  // 🔥 API
  if (product.useApi) {
    basePrice = await getPriceFromApis(product.category);
  }

  // 🔥 fallback
  if (!basePrice && product.manualPrice) {
    basePrice = product.manualPrice;
  }

  if (!basePrice || basePrice <= 0) return null;

  // 🔥 اسپرد حرفه‌ای
  const buyPrice =
    basePrice * (1 + (product.buySpread || 0) / 100);

  const sellPrice =
    basePrice * (1 - (product.sellSpread || 0) / 100);

  return {
    basePrice,
    buyPrice,
    sellPrice,
  };
}

// ---------------- MAIN ----------------
async function fetchPrices() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
  });

  const result: Record<string, any> = {};

  for (const product of products) {
    const price = await getProductPrice(product);

    if (price) {
      // 🔥 کلید اصلی برای trading
      result[product.name] = price;
    }
  }

  // ---------------- GLOBAL ASSETS ----------------

  const gold = await getPriceFromApis('gold');
  if (gold > 0) {
    result['GOLD'] = {
      basePrice: gold,
      buyPrice: gold * 1.002,
      sellPrice: gold * 0.998,
    };
  }

  const fiat = await getPriceFromApis('fiat');
  if (fiat > 0) {
    result['USD_AED'] = {
      basePrice: fiat,
      buyPrice: fiat * 1.001,
      sellPrice: fiat * 0.999,
    };
  }

  // 🔥 fallback اضطراری (خیلی مهم)
  if (!Object.keys(result).length) {
    result['GOLD'] = {
      basePrice: 2500,
      buyPrice: 2510,
      sellPrice: 2490,
    };

    result['USDT'] = {
      basePrice: 1,
      buyPrice: 1,
      sellPrice: 1,
    };
  }

  return result;
}

// ---------------- UPDATE ----------------
export async function updatePrices() {
  try {
    const prices = await fetchPrices();
    latestPrices = prices;

    console.log('🔥 Prices Updated:', prices);
  } catch (err) {
    console.error('Price update failed:', err);
  }
}

// ---------------- START ----------------
export function startPriceService() {
  updatePrices();

  // 🔥 سریع ولی منطقی
  setInterval(updatePrices, 5000);
}

// ---------------- GET ----------------
export function getLatestPrices() {
  return latestPrices;
}