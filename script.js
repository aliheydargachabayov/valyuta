const API_KEY = "0526f75efcdfd3a40b5442d32424082b";

const leftInput  = document.getElementById("leftInput");
const rightInput = document.getElementById("rightInput");
const leftRate   = document.getElementById("leftRate");
const rightRate  = document.getElementById("rightRate");
const errorEl    = document.getElementById("error");

const leftTabs  = document.querySelectorAll('.tabs[data-side="left"] .tab');
const rightTabs = document.querySelectorAll('.tabs[data-side="right"] .tab');

let leftCurrency  = "RUB";
let rightCurrency = "USD";

function cleanNumber(v){
  if (!v) return "";
  let s = String(v).replace(/,/g, ".").replace(/[^\d.]/g, "");
  if (!s) return "";
  const n = s.split(".");
  n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return n[1] ? n[0] + "." + n[1] : n[0];
}

function toNumber(v){
  if (!v) return 0;
  return parseFloat(v.replace(/\s/g, "").replace(",", ".")) || 0;
}

function setActive(tabs, curr){
  tabs.forEach(el => {
    if (el.dataset.currency === curr) el.classList.add("active");
    else el.classList.remove("active");
  });
}

async function getConverted(from, to, amount){
  if (from === to) return amount;

  const res = await fetch(
    `https://api.exchangerate.host/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`
  );
  const data = await res.json();

  if (!data || !data.success) throw 0;
  return data.result;
}

async function updateFromLeft(){
  errorEl.textContent = "";
  const val = toNumber(leftInput.value);

  try {
    const result = await getConverted(leftCurrency, rightCurrency, val);
    rightInput.value = cleanNumber(result.toFixed(4));
    showRates();
  } catch {
    errorEl.textContent = "Serverlə bağlı xəta yarandı. Yenidən cəhd edin.";
    rightInput.value = "";
    leftRate.textContent = "";
    rightRate.textContent = "";
  }
}

async function updateFromRight(){
  errorEl.textContent = "";
  const val = toNumber(rightInput.value);

  try {
    let r;
    if (leftCurrency === rightCurrency) {
      r = val;
    } else {
      r = await getConverted(rightCurrency, leftCurrency, val);
    }
    leftInput.value = cleanNumber(r.toFixed(4));
    showRates();
  } catch {
    errorEl.textContent = "Serverlə bağlı xəta yarandı. Yenidən cəhd edin.";
    leftInput.value = "";
    leftRate.textContent = "";
    rightRate.textContent = "";
  }
}

async function showRates(){
  if (leftCurrency === rightCurrency) {
    leftRate.textContent  = `1 ${leftCurrency} = 1 ${rightCurrency}`;
    rightRate.textContent = `1 ${rightCurrency} = 1 ${leftCurrency}`;
    return;
  }

  try {
    const r = await getConverted(leftCurrency, rightCurrency, 1);
    leftRate.textContent  = `1 ${leftCurrency} = ${r.toFixed(4)} ${rightCurrency}`;
    rightRate.textContent = `1 ${rightCurrency} = ${(1 / r).toFixed(4)} ${leftCurrency}`;
  } catch {
    leftRate.textContent = "";
    rightRate.textContent = "";
  }
}

leftInput.addEventListener("input", updateFromLeft);
rightInput.addEventListener("input", updateFromRight);

leftTabs.forEach(tab => {
  tab.onclick = () => {
    leftCurrency = tab.dataset.currency;
    setActive(leftTabs, leftCurrency);
    updateFromLeft();
  };
});

rightTabs.forEach(tab => {
  tab.onclick = () => {
    rightCurrency = tab.dataset.currency;
    setActive(rightTabs, rightCurrency);
    updateFromLeft();
  };
});

window.onload = () => {
  setActive(leftTabs, leftCurrency);
  setActive(rightTabs, rightCurrency);
  leftInput.value = cleanNumber(leftInput.value);
  updateFromLeft();
};