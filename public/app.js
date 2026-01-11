// public/app.js
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const grid = document.getElementById("grid");
const q = document.getElementById("q");
const cat = document.getElementById("cat");
const chips = document.getElementById("chips");
const count = document.getElementById("count");

const drawer = document.getElementById("drawer");
const closeBtn = document.getElementById("closeBtn");
const detail = document.getElementById("detail");

let DATA = [];
let tagFilter = new Set();

const TAGS = [
  "Rédaction", "Chat", "Recherche", "Code", "Image", "Vidéo", "Audio",
  "Transcription", "Traduction", "Présentation", "Design", "Data", "Productivité"
];

function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function matches(ai) {
  const text = norm(q.value);
  const category = cat.value;

  const hay = norm([
    ai.name,
    ai.category,
    ai.speciality,
    ...(ai.strengths || []),
    ...(ai.tags || []),
    ai.pricing,
    ai.level
  ].join(" "));

  if (category !== "all" && norm(ai.category) !== norm(category)) return false;
  if (text && !hay.includes(text)) return false;

  if (tagFilter.size > 0) {
    const aiTags = new Set((ai.tags || []).map(norm));
    for (const t of tagFilter) {
      if (!aiTags.has(t)) return false;
    }
  }
  return true;
}

function renderChips() {
  chips.innerHTML = "";
  for (const t of TAGS) {
    const el = document.createElement("div");
    el.className = "chip" + (tagFilter.has(norm(t)) ? " on" : "");
    el.textContent = t;
    el.onclick = () => {
      const key = norm(t);
      if (tagFilter.has(key)) tagFilter.delete(key);
      else tagFilter.add(key);
      renderChips();
      render();
    };
    chips.appendChild(el);
  }
}

function card(ai) {
  const el = document.createElement("article");
  el.className = "card";
  el.onclick = () => openDetail(ai);

  const badges = [];
  if (ai.category) badges.push(ai.category);
  if (ai.level) badges.push(ai.level);
  if (ai.pricing) badges.push(ai.pricing);

  el.innerHTML = `
    <h3 class="title">${ai.name}</h3>
    <div class="badges">
      ${badges.map(b => `<span class="badge">${escapeHtml(b)}</span>`).join("")}
    </div>
    <div class="desc">${escapeHtml(ai.speciality || "")}</div>
  `;
  return el;
}

function openDetail(ai) {
  const strengths = (ai.strengths || []).map(s => `<span class="pill">${escapeHtml(s)}</span>`).join("");
  const tags = (ai.tags || []).map(s => `<span class="pill">${escapeHtml(s)}</span>`).join("");

  detail.innerHTML = `
    <div class="detail-h">
      <h2>${escapeHtml(ai.name)}</h2>
      <div class="sub">${escapeHtml(ai.speciality || "")}</div>
    </div>
    <div class="pills">
      ${ai.category ? `<span class="pill">${escapeHtml(ai.category)}</span>` : ""}
      ${ai.level ? `<span class="pill">${escapeHtml(ai.level)}</span>` : ""}
      ${ai.pricing ? `<span class="pill">${escapeHtml(ai.pricing)}</span>` : ""}
    </div>

    <div class="hr"></div>

    <div class="kv">
      <div class="row"><div class="k">Spécialité</div><div class="v">${escapeHtml(ai.speciality || "")}</div></div>
      <div class="row"><div class="k">Idéal pour</div><div class="v">${escapeHtml(ai.best_for || "")}</div></div>
      <div class="row"><div class="k">Points forts</div><div class="v">${strengths || "—"}</div></div>
      <div class="row"><div class="k">Tags</div><div class="v">${tags || "—"}</div></div>
      ${ai.weaknesses?.length ? `<div class="row"><div class="k">Limites</div><div class="v">${escapeHtml(ai.weaknesses.join(" • "))}</div></div>` : ""}
    </div>
  `;

  drawer.classList.add("show");
  drawer.setAttribute("aria-hidden", "false");
  if (tg) tg.HapticFeedback?.impactOccurred?.("light");
}

function closeDetail() {
  drawer.classList.remove("show");
  drawer.setAttribute("aria-hidden", "true");
}

closeBtn.addEventListener("click", closeDetail);
drawer.addEventListener("click", (e) => {
  if (e.target === drawer) closeDetail();
});

function render() {
  grid.innerHTML = "";
  const list = DATA.filter(matches);
  count.textContent = `${list.length} IA`;
  for (const ai of list) grid.appendChild(card(ai));
}

function escapeHtml(s) {
  return (s ?? "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function init() {
  renderChips();
  const res = await fetch("/api/ais", { cache: "no-store" });
  DATA = await res.json();
  render();
}

q.addEventListener("input", render);
cat.addEventListener("change", render);

init();

// Rewarded interstitial (Monetag)
function showRewardAd(onReward) {
  const fn = window["show_10449525"]; // la fonction injectée par Monetag

  // Si la pub n'est pas dispo (script pas chargé, pas d'inventaire, etc.)
  if (typeof fn !== "function") {
    console.log("Monetag not ready - skipping ad");
    onReward?.();
    return;
  }

  fn()
    .then(() => {
      onReward?.(); // récompense après visionnage
    })
    .catch((err) => {
      console.log("Ad failed / not available", err);
    });
}


        
