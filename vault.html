// vault.js — BistroCuza16 Game
// Vault cu animație ouă care se sparg în tigaie + delay 5 secunde

import {
  auth, db, onAuthStateChanged,
  doc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase-config.js";

// ── Premii posibile (trase la sorți) ─────────────────────────────────────────
const VAULT_PRIZES = [
  { id: "coffee",    emoji: "☕", label: "Cafea gratuită",          desc: "Un espresso sau cappuccino la alegere",    pts: 0,  type: "reward" },
  { id: "pts_20",    emoji: "⭐", label: "20 Puncte Bonus",         desc: "Adăugate direct în portofelul tău",        pts: 20, type: "points" },
  { id: "pts_30",    emoji: "🌟", label: "30 Puncte Bonus",         desc: "Adăugate direct în portofelul tău",        pts: 30, type: "points" },
  { id: "pts_50",    emoji: "💫", label: "50 Puncte Bonus",         desc: "Adăugate direct în portofelul tău",        pts: 50, type: "points" },
  { id: "toast",     emoji: "🍞", label: "Avocado Toast gratuit",   desc: "La orice comandă de băutură",              pts: 0,  type: "reward" },
  { id: "dessert",   emoji: "🍌", label: "Desert gratuit",          desc: "Banana Bread sau înghețată artizanală",    pts: 0,  type: "reward" },
  { id: "discount10",emoji: "🎁", label: "10% reducere",            desc: "La următoarea comandă, valabilă 7 zile",   pts: 0,  type: "reward" },
  { id: "pts_15",    emoji: "✨", label: "15 Puncte Bonus",         desc: "Adăugate direct în portofelul tău",        pts: 15, type: "points" },
];

// Greutăți (probabilitate) pentru fiecare premiu
const PRIZE_WEIGHTS = [5, 25, 20, 10, 8, 7, 10, 15];

function drawPrize() {
  const total = PRIZE_WEIGHTS.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZE_WEIGHTS.length; i++) {
    r -= PRIZE_WEIGHTS[i];
    if (r <= 0) return VAULT_PRIZES[i];
  }
  return VAULT_PRIZES[0];
}

// ── Utilitare ─────────────────────────────────────────────────────────────────
function getWeekId() {
  const now  = new Date();
  const day  = now.getDay();
  const monday = new Date(now);
  const diff = (day === 0) ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  return `${monday.getFullYear()}-W${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
}

function isMonday() {
  return new Date().getDay() === 1;
}

function daysUntilMonday() {
  const day = new Date().getDay();
  if (day === 1) return 0;
  return day === 0 ? 1 : 8 - day;
}

function updateScoreHeader(data) {
  document.getElementById("total-wallet").textContent = (data.totalWallet || 0) + " pct";
  document.getElementById("weekly-score").textContent = (data.weeklyScore  || 0) + " pct";
}

// ── Animație ouă ──────────────────────────────────────────────────────────────
async function playEggAnimation(prize) {
  const main = document.getElementById("main-content");

  // Render animație
  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">Vault Săptămânal</p>
      <div class="vault-stage">

        <div class="pan-container" id="pan-container">
          <!-- Tigaia -->
          <div class="pan-body">🍳</div>
          <!-- Ouăle întregi -->
          <div class="egg-left"  id="egg-left">🥚</div>
          <div class="egg-right" id="egg-right">🥚</div>
          <!-- Gălbenușuri — vizibile după spargere -->
          <div class="yolk-reveal" id="yolk-reveal">🟡🟡</div>
        </div>

        <p class="vault-title" id="vault-anim-msg">Spargeți ouăle...</p>
        <p class="vault-subtitle" id="vault-anim-sub">Vedeți ce v-a pregătit Cuza16 această săptămână!</p>

        <!-- Bara de progres a delay-ului -->
        <div id="vault-timer-wrap" style="width:100%;height:6px;background:var(--sand);border-radius:3px;overflow:hidden;">
          <div id="vault-timer-bar" style="height:100%;background:var(--gold);border-radius:3px;width:0%;transition:width 4.8s linear;"></div>
        </div>
        <p class="vault-countdown" id="vault-countdown">5</p>
      </div>
    </div>
  `;

  // Pornire animație
  await delay(300);
  document.getElementById("vault-timer-bar").style.width = "100%";

  await delay(600);  // ouăle se înclină
  document.getElementById("pan-container").classList.add("cracking");
  document.getElementById("vault-anim-msg").textContent = "Crack...";

  await delay(900);  // ouăle dispar
  document.getElementById("pan-container").classList.add("cracked");
  document.getElementById("vault-anim-msg").textContent = "🔥 Gătim...";

  // Countdown vizual 5→0
  for (let i = 4; i >= 1; i--) {
    await delay(1000);
    document.getElementById("vault-countdown").textContent = i;
  }
  await delay(1000);
  document.getElementById("vault-countdown").textContent = "0";

  // Gălbenușuri apar
  await delay(200);
  document.getElementById("yolk-reveal").classList.add("show");
  document.getElementById("vault-anim-msg").textContent = "🎉 Ați câștigat!";
  document.getElementById("vault-anim-sub").textContent = "";

  await delay(600);

  // Afișăm premiul
  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">Vault Săptămânal — Premiul tău</p>
      <div class="vault-stage">
        <div class="vault-prize-box">
          <span class="vault-prize-emoji">${prize.emoji}</span>
          <div class="vault-prize-label">${prize.label}</div>
          <div class="vault-prize-desc">${prize.desc}</div>
          ${prize.type === "reward"
            ? `<div class="vault-code-box" id="prize-code">—</div>
               <p style="font-size:11px;color:var(--sage);margin-top:8px;">Prezentați acest cod la casă</p>`
            : `<p style="font-size:13px;color:var(--sage);margin-top:8px;">Punctele au fost adăugate în portofelul tău!</p>`
          }
        </div>
        <p class="vault-subtitle">Reveniți săptămâna viitoare pentru o nouă surpriză!</p>
      </div>
    </div>
  `;

  // Dacă e cod de recompensă fizică, îl generăm
  if (prize.type === "reward") {
    const code = `C16-${prize.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById("prize-code").textContent = code;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Render stări vault ────────────────────────────────────────────────────────
function renderVaultLocked() {
  const days = daysUntilMonday();
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">Vault Săptămânal</p>
      <div class="vault-locked-wrap">
        <div class="vault-locked-icon">🔐</div>
        <h2 class="vault-title" style="margin-top:12px;">Vault-ul este blocat</h2>
        <p class="vault-subtitle" style="margin-top:8px;">
          Vault-ul se deschide doar <strong>Luni</strong>.<br>
          ${days === 1 ? "Reveniți mâine!" : `Mai sunt ${days} zile până luni.`}
        </p>
      </div>
    </div>
    <div class="card">
      <p class="eyebrow" style="margin-bottom:8px;">Cum funcționează Vault-ul?</p>
      <p style="font-size:14px;line-height:1.6;color:var(--charcoal);">
        În fiecare <strong>Luni</strong>, poți sparge 2 ouă în tigaia virtuală Cuza16 și descoperi ce câștig ți-a pregătit bistro-ul săptămâna aceasta — de la cafea gratuită, la puncte bonus sau reduceri.
      </p>
    </div>
  `;
}

function renderVaultAlreadyOpened(weekId, vaultHistory) {
  const prize = vaultHistory?.[weekId] || {};
  const main  = document.getElementById("main-content");
  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">Vault Săptămânal</p>
      <div class="vault-locked-wrap">
        <div class="vault-locked-icon">✅</div>
        <h2 class="vault-title" style="margin-top:12px;">Vault deschis această săptămână</h2>
        <p class="vault-subtitle" style="margin-top:8px;">
          Ai câștigat <strong>${prize.label || "o recompensă"}</strong> ${prize.emoji || "🎁"}<br>
          Revino <strong>Luni viitoare</strong> pentru o nouă surpriză!
        </p>
      </div>
    </div>
  `;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
let initialized = false; // Previne re-inițializare la refresh token Firebase

onAuthStateChanged(auth, async (user) => {
  if (initialized) return;
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  initialized = true;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) { window.location.href = "index.html"; return; }
  const userData = snap.data();

  updateScoreHeader(userData);

  const weekId = getWeekId();
  const isOpen = isMonday();
  const alreadyOpened = userData.vaultOpenedThisWeek === true &&
                        userData.currentWeekId === weekId;

  document.getElementById("loading-state")?.remove();

  // Blocaj: nu e luni
  if (!isOpen) {
    renderVaultLocked();
    return;
  }

  // Deja deschis această săptămână
  if (alreadyOpened) {
    renderVaultAlreadyOpened(weekId, userData.vaultHistory);
    return;
  }

  // ── DESCHIDERE VAULT ───────────────────────────────────────────────────────
  const prize = drawPrize();

  // Marcăm deschiderea în Firestore ÎNAINTE de animație (previne dubla deschidere)
  const updatePayload = {
    vaultOpenedThisWeek: true,
    currentWeekId: weekId,
    [`vaultHistory.${weekId}`]: {
      prize: prize.id,
      label: prize.label,
      emoji: prize.emoji,
      openedAt: serverTimestamp(),
    }
  };

  if (prize.type === "points" && prize.pts > 0) {
    updatePayload.totalWallet = increment(prize.pts);
    updatePayload.weeklyScore = increment(prize.pts);
  }

  try {
    await updateDoc(doc(db, "users", user.uid), updatePayload);
  } catch (err) {
    console.error("Eroare la salvarea vault-ului:", err);
  }

  // Update local pentru header
  if (prize.type === "points" && prize.pts > 0) {
    userData.totalWallet = (userData.totalWallet || 0) + prize.pts;
    userData.weeklyScore = (userData.weeklyScore  || 0) + prize.pts;
    updateScoreHeader(userData);
  }

  // Rulăm animația ouă (5 secunde delay inclus)
  await playEggAnimation(prize);
});
