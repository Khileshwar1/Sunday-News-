/* ====== Live Signals using Binance klines + RSI/MA ====== */

const $app = document.querySelector(".app");
const $currency = $app.querySelector(".currency");
const $currencyContainer = $currency.querySelector(".currency-container");
const $currencyValue = $currency.querySelector(".value");
const $blockForecast = $app.querySelector(".forecast");
const $blockForecastValue = $blockForecast.querySelector(".value");
const $btnAction = $app.querySelector(".btn.action");
const $btnActionText = $btnAction.querySelector(".text");

const BINANCE_BASE = "https://api.binance.com";
const KLINE_LIMIT = 200;
const RSI_PERIOD = 14;
const MA_SHORT = 9;
const MA_LONG = 21;
const AUTO_REFRESH_SECONDS = 60;

// map your friendly pairs to Binance symbols
const symbolMap = {
  "BTC/USDT": "BTCUSDT",
  "ETH/USDT": "ETHUSDT",
  "LTC/USDT": "LTCUSDT",
  "EUR/USDT": "EURUSDT",
  "GBP/USDT": "GBPUSDT",
  "AUD/USDT": "AUDUSDT"
};

/* ========== Helper Functions ========== */
async function fetchKlinesBinance(symbol, limit = KLINE_LIMIT) {
  const url = `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}&interval=1m&limit=${limit}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Binance API error: ${resp.status}`);
  const data = await resp.json();
  return data.map(k => parseFloat(k[4])); // close prices
}

function SMA(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function RSI(values, period = RSI_PERIOD) {
  if (values.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function decideSignal(rsi, maShort, maLong) {
  if (rsi === null || maShort === null || maLong === null) {
    return { signal: "NO_DATA", reason: "Insufficient history" };
  }
  if (rsi < 30) return { signal: "UP", reason: `RSI ${rsi.toFixed(2)} < 30` };
  if (rsi > 70) return { signal: "DOWN", reason: `RSI ${rsi.toFixed(2)} > 70` };
  return maShort > maLong
    ? { signal: "UP", reason: `MA(${MA_SHORT}) > MA(${MA_LONG})` }
    : { signal: "DOWN", reason: `MA(${MA_SHORT}) < MA(${MA_LONG})` };
}

/* ========== UI Update ========== */
function displaySignalUI(signalObj, assetName, rsi, maShort, maLong) {
  $blockForecastValue.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "signal-wrap";

  const title = document.createElement("div");
  title.textContent = `${assetName} — ${signalObj.signal}`;
  title.style.fontWeight = "700";

  const details = document.createElement("div");
  details.textContent =
    `${signalObj.reason} | RSI:${rsi.toFixed(2)} MA${MA_SHORT}:${maShort.toFixed(5)} MA${MA_LONG}:${maLong.toFixed(5)}`;
  details.style.fontSize = "0.9em";
  details.style.marginTop = "6px";

  wrap.appendChild(title);
  wrap.appendChild(details);
  $blockForecastValue.appendChild(wrap);

  $blockForecast.classList.remove("up", "down");
  if (signalObj.signal === "UP") $blockForecast.classList.add("up");
  if (signalObj.signal === "DOWN") $blockForecast.classList.add("down");
}

/* ========== Main Logic ========== */
async function getSignalForAsset(assetText) {
  try {
    let friendly = assetText.split(" ")[0];
    if (!symbolMap[friendly] && friendly.includes("/")) {
      const parts = friendly.split("/");
      friendly = `${parts[0]}/USDT`;
    }
    const symbol = symbolMap[friendly];
    if (!symbol) throw new Error("Symbol mapping not found");

    const closes = await fetchKlinesBinance(symbol);
    const maShort = SMA(closes, MA_SHORT);
    const maLong = SMA(closes, MA_LONG);
    const rsi = RSI(closes, RSI_PERIOD);

    const decision = decideSignal(rsi, maShort, maLong);
    displaySignalUI(decision, friendly, rsi, maShort, maLong);
  } catch (err) {
    $blockForecastValue.innerHTML = `<div class="err">Error: ${err.message}</div>`;
  } finally {
    $btnAction.classList.remove("loading");
    $btnActionText.textContent = "Next signal";
    $btnAction.dataset.initStatus = "wait";
  }
}

/* ========== Button & Auto Refresh ========== */
$btnAction.addEventListener("click", () => {
  if ($btnAction.dataset.initStatus === "loading") return;
  $btnAction.dataset.initStatus = "loading";
  $blockForecastValue.innerHTML = '<div class="spinner"></div>';
  $btnAction.classList.add("loading");
  $btnActionText.textContent = "loading";

  const asset = $currencyValue.textContent.trim();
  getSignalForAsset(asset);
});

// auto refresh
setInterval(() => {
  if ($btnAction.dataset.initStatus !== "loading") {
    const asset = $currencyValue.textContent.trim();
    getSignalForAsset(asset);
  }
}, AUTO_REFRESH_SECONDS * 1000);
