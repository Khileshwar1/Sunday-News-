// --- Existing code same रहेगा (UI, currency selection वगैरह) ---
// नीचे वाले हिस्से में बदलाव कर रहे हैं

// 🔥 Binance से Market Data लाने का function
async function getMarketData(symbol = "BTCUSDT") {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=50`;
  const response = await fetch(url);
  const data = await response.json();

  // Closing prices निकालना
  const closes = data.map(candle => parseFloat(candle[4]));
  return closes;
}

// 🔥 RSI Calculation Function
function calculateRSI(prices, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// 🔥 Forecast अब real market पर आधारित
async function getForecast() {
  try {
    const prices = await getMarketData("BTCUSDT"); // आप चाहें तो EURUSD, ETHUSDT, etc बदल सकते हैं
    const rsi = calculateRSI(prices);

    if (rsi < 30) return "UP ✅ (Oversold)";
    if (rsi > 70) return "DOWN ❌ (Overbought)";
    return "WAIT ⏳ (Neutral)";
  } catch (e) {
    console.error("Error fetching data:", e);
    return "Error ❌";
  }
}

// 🔥 Button click पर real signal generate होगा
$btnAction.addEventListener("click", async () => {
  let status = $btnAction.dataset.initStatus;
  if (status == "loading") return;
  $btnAction.dataset.initStatus = "loading";

  $blockForecastValue.innerHTML = '<div class="spinner"></div>';
  $btnAction.classList.add("loading");
  $btnActionText.textContent = "loading";

  // Real signal लाओ
  let forecastValue = await getForecast();

  setTimeout(() => {
    $blockForecastValue.innerHTML = forecastValue;

    if (forecastValue.includes("DOWN")) {
      $blockForecast.classList.add("down");
      $blockForecast.classList.remove("up");
    } else if (forecastValue.includes("UP")) {
      $blockForecast.classList.add("up");
      $blockForecast.classList.remove("down");
    } else {
      $blockForecast.classList.remove("up");
      $blockForecast.classList.remove("down");
    }

    setTimeOut(1);
  }, 1000);
});if (isWeekend) {
  if (!$currencyValue.textContent.includes("CRYPTO IDX")) {
    $currencyValue.textContent = currency[0] + " (OTC)";
  }
} else {
  $currencyValue.textContent = currency[0];
}

currency.map((item) => {
  if (isWeekend) {
    if (!item.includes("CRYPTO IDX")) {
      item = item + " (OTC)";
    }
  }

  let div = document.createElement("div");
  div.classList.add("item");
  div.textContent = item;
  $currencyContainer.appendChild(div);
});

setTime();

window.addEventListener("click", (e) => {
  if (!$currencyContainer.contains(e.target) && !$currency.contains(e.target)) {
    $currencyContainer.classList.remove("windowShow");
  }

  if (!$timeItems.contains(e.target) && !$blockSetTime.contains(e.target)) {
    $timeItems.classList.remove("windowShow");
  }
});

$currency.addEventListener("click", (e) => {
  $currencyContainer.classList.add("windowShow");
});

$currencyContainer.querySelectorAll(".item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    let val = item.textContent;
    $currencyValue.textContent = val;
    $currencyContainer.classList.remove("windowShow");
  });
});

$blockSetTime.addEventListener("click", (e) => {
  $timeItems.classList.add("windowShow");
});

timeItemsActivate();

// $blockSetTime.addEventListener('click', () => {
// 	$timeInput.focus();
// })

// $timeInput.value = getCurrentTime();
// $timeInput.addEventListener("input", function () {
// 	const sanitizedInput = $timeInput.value.replace(/[^0-9]/g, "");
// 	let value = sanitizedInput;
//
// 	if (sanitizedInput.length >= 3) {
// 		value = value.slice(0, 2) + ":" + value.slice(2);
// 	}
//
// 	if (value.length >= 5) {
// 		value = value.slice(0, 5);
// 	}
//
// 	if ((value[0] == 2 && value[1] > 4) || (value[0] > 2) || (value[1] > 9)) {
// 		value = '2';
// 	}
//
// 	if (value.slice(3)[0] > 5) {
// 		value = value.slice(0, 2) + ":";
// 	}
//
// 	$timeInput.value = value;
// });
//
// $timeInput.addEventListener("blur", function () {
// 	if ($timeInput.value.length == 0) {
// 		$timeInput.value = getCurrentTime();
// 	}
// });

$btnAction.addEventListener("click", () => {
  let status = $btnAction.dataset.initStatus;
  if (status == "loading") return;
  $btnAction.dataset.initStatus = "loading";

  $blockForecastValue.innerHTML = '<div class="spinner"></div>';
  $blockForecast.classList.remove("down");
  $blockForecast.classList.remove("up");
  // isTimeBehindScheduled();
  let forecastValue = getRandomForecast();
  $btnAction.classList.add("loading");
  $btnActionText.textContent = "loading";
  setTimeout(() => {
    $blockForecastValue.innerHTML = forecastValue;
    if (forecastValue == "DOWN") {
      $blockForecast.classList.add("down");
    } else if (forecastValue == "UP") {
      $blockForecast.classList.add("up");
    }

    setTimeOut(1);
  }, 1000);
});

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timeString = hours + ":" + minutes;
  return timeString;
}

// function isTimeBehindScheduled() {
// 	const currentTime = getCurrentTime();
// 	if (currentTime > $timeInput.value) {
// 		$timeInput.value = currentTime;
// 	}
// }

function isTimeBehindScheduled() {
  const cTime = getCurrentTime();
  if (cTime > $timeValue.textContent) {
    $timeValue.textContent = cTime;
    currentTime = getCurrentTime();
    setCurrentTimeItems();
    timeItemsActivate();
  }
}

function getRandomForecast() {
  const randomValue = Math.random();
  if (randomValue < 0.5) {
    return "DOWN";
  } else {
    return "UP";
  }
}

function setCurrentTimeItems() {
  $timeItems.innerHTML = "";
  $timeValue.textContent = currentTime;
  let val = currentTime;
  for (let i = 0; i < 15; i++) {
    let firstT = +val.slice(0, 2);
    let lastM = +val.slice(3, 5);

    if (i > 0) {
      lastM = lastM + 1;

      if (lastM == 60) {
        firstT = firstT + 1;
        if (firstT < 10) {
          val = `0${firstT}:00`;
        } else {
          val = `${firstT}:00`;
        }
      } else {
        if (firstT < 10) {
          if (lastM < 10) {
            val = `0${firstT}:0${lastM}`;
          } else {
            val = `0${firstT}:${lastM}`;
          }
        } else {
          if (lastM < 10) {
            val = `${firstT}:0${lastM}`;
          } else {
            val = `${firstT}:${lastM}`;
          }
        }
      }
    }

    let div = document.createElement("div");
    div.classList.add("item");
    div.textContent = val;
    $timeItems.appendChild(div);
  }
}

function setTime() {
  $timeItems.innerHTML = "";
  $timeValue.textContent = "1 Min";

  for (let i = 1; i <= 1; i++) {
    let div = document.createElement("div");
    div.classList.add("item");
    div.textContent = `${i} Min`;
    $timeItems.appendChild(div);
  }
}

function timeItemsActivate() {
  $timeItems.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      let val = item.textContent;
      $timeValue.textContent = val;
      $timeItems.classList.remove("windowShow");
    });
  });
}

function setTimeOut($countMinutes = 1) {
  let startTime = 0;
  let endTime = $countMinutes * 60;
  let time = endTime;
  let interval = "";
  $btnActionText.textContent = timeView(time);
  interval = setInterval(() => {
    startTime += 1;
    if (startTime == endTime) {
      $btnAction.classList.remove("loading");
      $btnActionText.textContent = "Next signal";
      $btnAction.dataset.initStatus = "wait";
      clearInterval(interval);
    } else {
      time -= 1;
      $btnActionText.textContent = timeView(time);
    }
  }, 1000);
}

function timeView(countSecond) {
  let minutes = Math.floor(countSecond / 60);

  if (minutes > 0) {
    console.log(1);
    return `${minutes}:${countSecond - minutes * 60}`;
  } else {
    console.log(2);
    return `0:${countSecond}`;
  }
}

$modal.querySelector(".unlock").addEventListener("click", () => {
  let code = $modal.querySelector(".modal-input input").value;
  setCode(code);
});
function setCode(code) {
  if (sessionCodesArr.includes(code)) {
    localStorage.setItem("sessionCode", code);
    $modal.style.display = "none";
    document.querySelector(".display").style.display = "flex";
  } else {
    document.querySelector(".modal-input .errtxt").classList.add("active");
  }
}

if (sessionCode && sessionCodesArr.includes(sessionCode)) {
  $modal.style.display = "none";
  document.querySelector(".display").style.display = "flex";
}

const currencyPairs = [
  "AUD/CAD",
  "GBP/JPY",
  "CHF/JPY",
  "AUD/USD",
  "EUR/CAD",
  "USD/JPY",
  "EUR/USD",
];

async function updateRates() {
  const baseUrl = "https://api.exchangerate-api.com/v4/latest/USD";
  const response = await fetch(baseUrl);
  const data = await response.json();
  const rates = data.rates;

  const marquee1 = document.createElement("div");
  const marquee2 = document.createElement("div");

  currencyPairs.forEach((pair) => {
    const [base, quote] = pair.split("/");
    const rate = (rates[quote] / rates[base]).toFixed(2);
    const span1 = document.createElement("span");
    const span2 = document.createElement("span");
    span1.textContent = span2.textContent = `${pair} ${rate}`;
    span1.style.paddingRight = span2.style.paddingRight = "25px";
    marquee1.appendChild(span1);
    marquee2.appendChild(span2);
  });

  const marqueeContainer = document.getElementById("marquee");
  marqueeContainer.appendChild(marquee1);
  marqueeContainer.appendChild(marquee2);

  startMarquee(marqueeContainer);
}

function startMarquee(container) {
  let x = 0;
  const speed = 1;

  function move() {
    const firstChildWidth = container.firstChild.offsetWidth;
    x -= speed;
    if (x < -firstChildWidth) {
      container.appendChild(container.firstChild);
      x += firstChildWidth;
    }
    container.style.transform = `translateX(${x}px)`;

    requestAnimationFrame(move);
  }
  move();
}

document.addEventListener("DOMContentLoaded", updateRates);
