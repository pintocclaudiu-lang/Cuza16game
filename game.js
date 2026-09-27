// game.js — BistroCuza16 Game

import {
  auth, db, onAuthStateChanged, signOut,
  doc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase-config.js";

// ── Constante ─────────────────────────────────────────────────────────────────
const GAME_DURATION_SEC = 15;
const DOUBLE_POINTS_DAY = 3; // Miercuri

// ── Întrebările Quiz ──────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: "Care este prețul preparatului \"Eggs Benedict\" de pe meniu?",
    opts: ["52 RON", "55 RON", "60 RON", "65 RON"],
    correct: 2,
    explanation: "Eggs Benedict costă 60 RON și este unul dintre cele mai populare preparate din micul dejun la Cuza16."
  },
  {
    q: "Ce preparat costă 92 RON în meniul Cuza16?",
    opts: ["Fettuccine with Beef Tenderloin", "Egg and Steak", "Kimchi Brisket Melt", "Smoked Eggplant Bowl"],
    correct: 1,
    explanation: "Egg and Steak este cel mai scump preparat din meniu, la 92 RON."
  },
  {
    q: "Cât costă Avocado Toast la Cuza16?",
    opts: ["42 RON", "49 RON", "52 RON", "55 RON"],
    correct: 3,
    explanation: "Avocado Toast se află la 55 RON."
  },
  {
    q: "Care este prețul Granola Bowl?",
    opts: ["35 RON", "38 RON", "42 RON", "46 RON"],
    correct: 2,
    explanation: "Granola Bowl costă 42 RON."
  },
  {
    q: "Kimchi Brisket Melt costă:",
    opts: ["72 RON", "78 RON", "82 RON", "88 RON"],
    correct: 2,
    explanation: "Kimchi Brisket Melt se află la 82 RON — un preparat fusion inspirat din bucătăria coreeană."
  },
  {
    q: "Care este prețul Acai Bowl?",
    opts: ["38 RON", "42 RON", "46 RON", "52 RON"],
    correct: 2,
    explanation: "Acai Bowl costă 46 RON."
  },
  {
    q: "Corn Ribs costă:",
    opts: ["19 RON", "22 RON", "26 RON", "29 RON"],
    correct: 2,
    explanation: "Corn Ribs costă 26 RON."
  },
  {
    q: "\"Eggs Royale Yuzu\" costă:",
    opts: ["58 RON", "60 RON", "62 RON", "65 RON"],
    correct: 2,
    explanation: "Eggs Royale Yuzu costă 62 RON — o variantă premium a clasicului Eggs Benedict, cu yuzu."
  },
  {
    q: "Cât costă Banana Bread cu Matcha Cream la desert?",
    opts: ["38 RON", "42 RON", "45 RON", "48 RON"],
    correct: 3,
    explanation: "Homemade Banana Bread and Matcha Cream costă 48 RON."
  },
  {
    q: "Turkish Eggs din meniu costă:",
    opts: ["38 RON", "42 RON", "45 RON", "49 RON"],
    correct: 2,
    explanation: "Turkish Eggs costă 45 RON."
  },
  {
    q: "Care dintre aceste preparate NU se află pe meniul de mic dejun al Cuza16?",
    opts: ["French Toast", "Mediterranean Bowl", "Soft Scramble Toast", "Mushroom Toast"],
    correct: 1,
    explanation: "Mediterranean Bowl este un preparat de brunch, nu de mic dejun."
  },
  {
    q: "Ce tip de paste se află pe meniul Cuza16?",
    opts: ["Spaghetti Carbonara", "Penne Arrabbiata", "Fettuccine with Beef Tenderloin", "Rigatoni Bolognese"],
    correct: 2,
    explanation: "Fettuccine with Beef Tenderloin (82 RON) este singurul preparat cu paste de pe meniu."
  },
  {
    q: "Care este mottoul Cuza16?",
    opts: [
      "Good food • Great coffee • Happy moments",
      "Real food • Good coffee • Slow moments",
      "Fresh food • Best coffee • Sweet moments",
      "Honest food • Fine coffee • Good moments"
    ],
    correct: 1,
    explanation: "Mottoul Cuza16 este \"Real food • Good coffee • Slow moments\"."
  },
  {
    q: "La ce oră se deschide Cuza16 în fiecare zi?",
    opts: ["7:00", "8:00", "9:00", "10:00"],
    correct: 1,
    explanation: "Cuza16 se deschide la 8:00 în fiecare zi."
  },
  {
    q: "Până la ce oră este deschis Cuza16?",
    opts: ["15:00", "16:00", "17:00", "18:00"],
    correct: 2,
    explanation: "Cuza16 se închide la 17:00 în fiecare zi."
  },
  {
    q: "Paccheri with Red Sauce din meniu costă:",
    opts: ["48 RON", "52 RON", "56 RON", "62 RON"],
    correct: 2,
    explanation: "Paccheri with Red Sauce costă 56 RON."
  },
  {
    q: "Care salată costă mai mult pe meniul Cuza16?",
    opts: ["Heirloom Tomato Salad", "Beef Salad", "Ambele costă la fel", "Nu există salate în meniu"],
    correct: 1,
    explanation: "Beef Salad costă 78 RON, în timp ce Heirloom Tomato Salad costă 49 RON."
  },
  {
    q: "Care preparat include yuzu pe meniu?",
    opts: ["Turkish Eggs", "Eggs Royale Yuzu", "Avocado Toast", "Green Bowl"],
    correct: 1,
    explanation: "Eggs Royale Yuzu (62 RON) este singurul preparat care include yuzu."
  },
  {
    q: "Soft Scramble Toast costă:",
    opts: ["52 RON", "55 RON", "59 RON", "62 RON"],
    correct: 2,
    explanation: "Soft Scramble Toast costă 59 RON."
  },
  {
    q: "Care este cel mai ieftin preparat din categoria Breakfast?",
    opts: ["Mushroom Toast (52 RON)", "Granola Bowl (42 RON)", "Acai Bowl (46 RON)", "Turkish Eggs (45 RON)"],
    correct: 1,
    explanation: "Granola Bowl la 42 RON este cel mai accesibil preparat de mic dejun."
  },
  {
    q: "Green Bowl costă:",
    opts: ["42 RON", "45 RON", "49 RON", "52 RON"],
    correct: 2,
    explanation: "Green Bowl costă 49 RON."
  },
  {
    q: "French Toast din meniu costă:",
    opts: ["48 RON", "52 RON", "55 RON", "58 RON"],
    correct: 2,
    explanation: "French Toast costă 55 RON la Cuza16."
  },
  {
    q: "Cuza16 se află în:",
    opts: ["Cluj-Napoca", "București", "Brașov", "Sibiu"],
    correct: 2,
    explanation: "Cuza16 Cafe Bistro se află în Brașov."
  },
  {
    q: "Fettuccine with Beef Tenderloin costă:",
    opts: ["72 RON", "78 RON", "82 RON", "88 RON"],
    correct: 2,
    explanation: "Fettuccine with Beef Tenderloin costă 82 RON."
  },
  {
    q: "Ce tip de paste mari (scurte și tubulare) se află pe meniu la Cuza16?",
    opts: ["Rigatoni", "Paccheri", "Penne", "Tortiglioni"],
    correct: 1,
    explanation: "Paccheri with Red Sauce (56 RON) este preparatul cu paste tubulare mari de pe meniu."
  },
];

// ── State global ──────────────────────────────────────────────────────────────
let currentUser = null;
let userData    = null;
let weekId      = null;
let activeTimer = null;

// ── Utilitare ─────────────────────────────────────────────────────────────────
function getWeekId() {
  const now  = new Date();
  const day  = now.getDay();
  const diff = (day === 0) ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return `${monday.getFullYear()}-W${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
}

function getDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── TEST MODE: schimbă numărul de mai jos pentru a testa o altă zi ──
// 0=Duminică, 1=Luni, 2=Marți, 3=Miercuri, 4=Joi, 5=Vineri, 6=Sâmbătă
// Setează null pentru ziua reală
function getDayOfWeek() {
  const forced = localStorage.getItem("testDay");
  return forced !== null ? parseInt(forced) : new Date().getDay();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isDoublePointsDay() {
  return getDayOfWeek() === DOUBLE_POINTS_DAY;
}

// ── Citire date utilizator (cu retry) ────────────────────────────────────────
async function loadUserData(uid) {
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return snap.data();
    await new Promise(r => setTimeout(r, 1000));
  }
  return null;
}

// ── Actualizare scoruri în header ─────────────────────────────────────────────
function updateScoreHeader(data) {
  document.getElementById("total-wallet").textContent = (data.totalWallet || 0) + " pct";
  document.getElementById("weekly-score").textContent = (data.weeklyScore  || 0) + " pct";
}

// ── Adaugă puncte în Firestore ────────────────────────────────────────────────
async function addPoints(uid, points, dayKey) {
  const multiplier = isDoublePointsDay() ? 2 : 1;
  const finalPts   = points * multiplier;
  try {
    await updateDoc(doc(db, "users", uid), {
      totalWallet:              increment(finalPts),
      weeklyScore:              increment(finalPts),
      currentWeekId:            weekId,
      lastInteractionDate:      dayKey,
      [`daysPlayed.${dayKey}`]: true,
      weeklyInteractionsCount:  increment(1),
    });
    userData.totalWallet = (userData.totalWallet || 0) + finalPts;
    userData.weeklyScore = (userData.weeklyScore  || 0) + finalPts;
    if (!userData.daysPlayed) userData.daysPlayed = {};
    userData.daysPlayed[dayKey] = true;
    updateScoreHeader(userData);
    checkStreakBonus(uid);
  } catch (err) {
    console.error("Eroare la salvarea punctelor:", err);
  }
}

// ── Streak bonus ──────────────────────────────────────────────────────────────
async function checkStreakBonus(uid) {
  const days = userData.daysPlayed || {};
  const playedCount = Object.keys(days).length;

  const bonusMap = { 3: 5, 5: 15, 7: 30 };
  const bonus = bonusMap[playedCount];
  if (!bonus) return;

  const bonusKey = `streakBonusClaimed.streak_${playedCount}`;
  if (userData[bonusKey]) return;

  try {
    await updateDoc(doc(db, "users", uid), {
      totalWallet:   increment(bonus),
      weeklyScore:   increment(bonus),
      [bonusKey]:    true,
    });
    userData.totalWallet = (userData.totalWallet || 0) + bonus;
    userData.weeklyScore = (userData.weeklyScore  || 0) + bonus;
    userData[bonusKey]   = true;
    updateScoreHeader(userData);
    showStreakPopup(playedCount, bonus);
  } catch (err) {
    console.error("Eroare streak bonus:", err);
  }
}

function showStreakPopup(days, bonus) {
  const labels = { 3: "3 zile la rând! 🔥", 5: "5 zile consecutiv! 🌟", 7: "Săptămână perfectă! 🏆" };
  const popup = document.createElement("div");
  popup.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);
    background:var(--charcoal);color:#fff;padding:28px 36px;border-radius:20px;
    text-align:center;z-index:9999;opacity:0;transition:all .4s cubic-bezier(.34,1.56,.64,1);
    box-shadow:0 8px 40px rgba(0,0,0,0.3);pointer-events:none;
  `;
  popup.innerHTML = `
    <div style="font-size:42px;margin-bottom:8px;">🔥</div>
    <div style="font-size:14px;opacity:0.7;margin-bottom:4px;">STREAK BONUS</div>
    <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px;">${labels[days]}</div>
    <div style="font-size:36px;font-weight:700;color:#E8C47A;">+${bonus} pct</div>
  `;
  document.body.appendChild(popup);
  requestAnimationFrame(() => {
    popup.style.opacity = "1";
    popup.style.transform = "translate(-50%,-50%) scale(1)";
  });
  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%,-50%) scale(0.8)";
    setTimeout(() => popup.remove(), 400);
  }, 3000);
}

// ── Bara de progres streak ────────────────────────────────────────────────────
function renderStreakBar() {
  const days      = userData.daysPlayed || {};
  const count     = Object.keys(days).length;
  const isDouble  = isDoublePointsDay();
  const container = document.getElementById("streak-bar-wrap");
  if (!container) return;

  const pips = [1,2,3,4,5,6,7].map(n => `
    <div style="
      width:34px;height:34px;border-radius:50%;
      background:${n <= count ? 'var(--charcoal)' : 'var(--sand)'};
      color:${n <= count ? '#E8C47A' : 'var(--charcoal)'};
      opacity:${n <= count ? '1' : '0.4'};
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
      border:1.5px solid ${n <= count ? 'var(--charcoal)' : 'var(--sand)'};
    ">${n}</div>
  `).join("");

  container.innerHTML = `
    <div style="padding:16px 20px 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--sage);">Streak săptămânal</span>
        <span style="font-size:11px;font-weight:600;color:var(--charcoal);opacity:0.6;">${count}/7 zile</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">${pips}</div>
      <div style="font-size:11px;color:var(--sage);margin-top:6px;">
        ${count >= 7 ? "🏆 Săptămână perfectă! +30 pct bonus câștigat!" :
          count >= 5 ? "🌟 5+ zile! +15 pct bonus câștigat!" :
          count >= 3 ? "🔥 3+ zile! +5 pct bonus câștigat!" :
          `Mai ${Math.max(0, 3 - count)} zi${(3 - count) === 1 ? '' : 'le'} pentru primul bonus!`}
      </div>
      ${isDouble ? `<div style="background:#FFF8E7;border-radius:8px;padding:8px 12px;margin-top:8px;font-size:12px;font-weight:600;color:var(--gold);">⭐ AZI CÂȘTIGI DUBLU! Toate punctele x2</div>` : ""}
    </div>
  `;
}

// ── Reset săptămânal ──────────────────────────────────────────────────────────
async function checkWeeklyReset(uid, data) {
  const newWeekId = getWeekId();
  if (data.currentWeekId && data.currentWeekId !== newWeekId) {
    try {
      await updateDoc(doc(db, "users", uid), {
        weeklyScore:              0,
        currentWeekId:            newWeekId,
        weeklyInteractionsCount:  0,
        vaultOpenedThisWeek:      false,
        daysPlayed:               {},
        streakBonusClaimed:       {},
      });
    } catch (err) {
      console.error("Eroare la reset săptămânal:", err);
    }
    data.weeklyScore             = 0;
    data.currentWeekId           = newWeekId;
    data.weeklyInteractionsCount = 0;
    data.vaultOpenedThisWeek     = false;
    data.daysPlayed              = {};
    data.streakBonusClaimed      = {};
  }
  return newWeekId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 1: CATCH GAME (Marți = cappuccino, Joi = ouă)
// ═══════════════════════════════════════════════════════════════════════════════
function renderCatchGame(emoji, label, dayKey, splashEmoji) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main   = document.getElementById("main-content");
  const double = isDoublePointsDay();

  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">${label}</p>
      <h2 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:4px;">${label}</h2>
      <p class="subtitle" style="margin-bottom:12px;">Prinde cât mai multe ${emoji} înainte să cadă! ${double ? '<strong style="color:var(--gold)">⭐ Dublu puncte azi!</strong>' : ''}</p>
      ${alreadyPlayed
        ? `<div class="played-badge">✅ Ai jucat deja azi — revino mâine!</div>`
        : `
          <div id="catch-info" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <span style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--sage);">Scor</span><br>
              <span id="catch-score" style="font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:var(--gold);">0</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--sage);">Combo</span><br>
              <span id="catch-combo" style="font-size:20px;font-weight:700;color:var(--charcoal);">x1</span>
            </div>
          </div>
          <div id="catch-timer-bar-wrap" style="width:100%;height:5px;background:var(--sand);border-radius:3px;overflow:hidden;margin-bottom:8px;">
            <div id="catch-timer-bar" style="height:100%;background:var(--gold);border-radius:3px;width:100%;transition:width ${GAME_DURATION_SEC}s linear;"></div>
          </div>
          <div id="catch-arena" style="
            position:relative;width:100%;height:320px;
            background:linear-gradient(180deg,#F7F4EF 0%,#EDE8DF 100%);
            border-radius:16px;overflow:hidden;border:1.5px solid var(--sand);
            cursor:pointer;touch-action:none;user-select:none;
          "></div>
          <div id="catch-result" style="margin-top:12px;min-height:20px;text-align:center;"></div>
          <button class="btn btn-primary" id="catch-start-btn" style="margin-top:12px;">🎮 Pornește jocul</button>
        `
      }
    </div>
  `;

  if (alreadyPlayed) return;

  let score       = 0;
  let combo       = 1;
  let comboStreak = 0;
  let running     = false;
  let timeLeft    = GAME_DURATION_SEC;
  let timerInterval = null;
  let spawnInterval = null;
  let spawnDelay    = 1200;

  const arena   = document.getElementById("catch-arena");
  const scoreEl = document.getElementById("catch-score");
  const comboEl = document.getElementById("catch-combo");
  const resultEl = document.getElementById("catch-result");
  const startBtn = document.getElementById("catch-start-btn");
  const timerBar = document.getElementById("catch-timer-bar");

  // CSS animații
  const style = document.createElement("style");
  style.textContent = `
    @keyframes splashAnim {
      0%   { transform:scale(0.5); opacity:1; }
      100% { transform:scale(1.8); opacity:0; }
    }
    @keyframes floatUp {
      0%   { transform:translateY(0); opacity:1; }
      100% { transform:translateY(-40px); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  function spawnObject() {
    if (!running) return;
    const obj   = document.createElement("div");
    const left  = 8 + Math.random() * 72;
    const speed = 2.5 + Math.random() * 2 - (combo > 2 ? 0.5 : 0);
    const size  = 48 + Math.floor(Math.random() * 16);

    obj.textContent = emoji;
    obj.style.cssText = `
      position:absolute;left:${left}%;top:-60px;
      font-size:${size}px;line-height:1;
      cursor:pointer;user-select:none;touch-action:manipulation;
      transition:top ${speed}s linear;
      filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));
    `;
    arena.appendChild(obj);

    requestAnimationFrame(() => requestAnimationFrame(() => { obj.style.top = "105%"; }));

    function onTap(e) {
      e.stopPropagation();
      if (!running) return;
      obj.removeEventListener("click", onTap);
      obj.removeEventListener("touchstart", onTap);

      comboStreak++;
      combo = comboStreak >= 3 ? 3 : comboStreak >= 2 ? 2 : 1;

      score += combo;
      scoreEl.textContent = score;
      comboEl.textContent = `x${combo}`;
      comboEl.style.color = combo >= 3 ? "var(--gold)" : combo === 2 ? "#7A8C6E" : "var(--charcoal)";

      // splash
      const rect      = obj.getBoundingClientRect();
      const arenaRect = arena.getBoundingClientRect();
      const splash    = document.createElement("div");
      splash.textContent = splashEmoji || "💥";
      splash.style.cssText = `
        position:absolute;
        left:${rect.left - arenaRect.left + rect.width/2 - 20}px;
        top:${rect.top  - arenaRect.top  + rect.height/2 - 20}px;
        font-size:40px;pointer-events:none;
        animation:splashAnim 0.4s ease forwards;z-index:10;
      `;
      arena.appendChild(splash);
      setTimeout(() => splash.remove(), 400);

      // combo badge
      if (combo > 1) {
        const badge = document.createElement("div");
        badge.textContent = combo === 3 ? "🔥 x3 COMBO!" : "⚡ x2";
        badge.style.cssText = `
          position:absolute;
          left:${rect.left - arenaRect.left}px;
          top:${rect.top  - arenaRect.top  - 24}px;
          font-size:13px;font-weight:700;white-space:nowrap;
          color:${combo >= 3 ? "var(--gold)" : "var(--sage)"};
          pointer-events:none;animation:floatUp 0.6s ease forwards;z-index:11;
        `;
        arena.appendChild(badge);
        setTimeout(() => badge.remove(), 600);
      }

      obj.remove();
      spawnDelay = Math.max(500, 1200 - (combo - 1) * 200 - score * 4);
    }

    obj.addEventListener("click", onTap);
    obj.addEventListener("touchstart", onTap, { passive: true });

    setTimeout(() => {
      if (obj.parentNode) {
        obj.remove();
        comboStreak = 0; combo = 1;
        comboEl.textContent = "x1";
        comboEl.style.color = "var(--charcoal)";
      }
    }, speed * 1000 + 200);
  }

  function startSpawning() {
    spawnObject();
    spawnInterval = setInterval(() => {
      if (!running) return;
      spawnObject();
      clearInterval(spawnInterval);
      if (running) spawnInterval = setInterval(() => { if (running) spawnObject(); }, spawnDelay);
    }, spawnDelay);
  }

  function endGame() {
    running = false;
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    activeTimer = null;
    arena.querySelectorAll("div").forEach(el => el.remove());

    const finalPts = Math.max(score, 5);
    resultEl.innerHTML = `
      <strong>Ai prins ${score} ${emoji}!</strong><br>
      Ai câștigat <span style="color:var(--gold);font-weight:700;">${finalPts} puncte</span>${isDoublePointsDay() ? " (x2 azi!)" : ""} 🎉
    `;
    addPoints(currentUser.uid, finalPts, dayKey);
  }

  function startGame() {
    startBtn.style.display = "none";
    score = 0; combo = 1; comboStreak = 0; running = true;
    timeLeft = GAME_DURATION_SEC; spawnDelay = 1200;
    scoreEl.textContent = "0"; comboEl.textContent = "x1"; resultEl.innerHTML = "";

    requestAnimationFrame(() => requestAnimationFrame(() => { timerBar.style.width = "0%"; }));

    timerInterval = setInterval(() => { timeLeft--; if (timeLeft <= 0) endGame(); }, 1000);
    activeTimer   = timerInterval;
    startSpawning();
  }

  startBtn.addEventListener("click", startGame);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 2: QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function renderQuiz(dayKey) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main   = document.getElementById("main-content");
  const double = isDoublePointsDay();

  if (alreadyPlayed) {
    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Provocarea Zilei</p>
        <h2 style="font-family:'Playfair Display',serif;">Quiz BistroCuza16</h2>
        <div class="played-badge" style="margin-top:12px;">✅ Ai răspuns la quiz azi — revino mâine!</div>
      </div>
    `;
    return;
  }

  const selected  = shuffle(QUIZ_QUESTIONS).slice(0, 5);
  let currentIdx  = 0;
  let totalPts    = 0;

  function renderQuestion() {
    const q      = selected[currentIdx];
    const optHtml = q.opts.map((opt, i) =>
      `<button class="quiz-opt-btn" data-idx="${i}">${opt}</button>`
    ).join("");

    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Întrebarea ${currentIdx + 1} din ${selected.length}${double ? ' · ⭐ Dublu puncte!' : ''}</p>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">${optHtml}</div>
        <div id="quiz-feedback"></div>
        <button class="btn btn-primary" id="quiz-next-btn" style="display:none;">
          ${currentIdx < selected.length - 1 ? "Următoarea întrebare →" : "Finalizează quizul"}
        </button>
      </div>
    `;

    document.querySelectorAll(".quiz-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen  = parseInt(btn.dataset.idx, 10);
        const correct = chosen === q.correct;

        document.querySelectorAll(".quiz-opt-btn").forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.idx, 10) === q.correct) b.classList.add("correct");
        });
        if (!correct) btn.classList.add("wrong");

        const pts = correct ? 10 : 2;
        totalPts += pts;

        document.getElementById("quiz-feedback").innerHTML = `
          ${correct ? "✅ <strong>Corect!</strong>" : "❌ <strong>Răspuns greșit.</strong>"}
          +${pts} puncte${double ? ' (x2 se aplică la final)' : ''}<br>
          <span style="color:var(--sage);font-size:13px;">${q.explanation}</span>
        `;
        document.getElementById("quiz-next-btn").style.display = "block";
      });
    });

    document.getElementById("quiz-next-btn").addEventListener("click", () => {
      currentIdx++;
      if (currentIdx < selected.length) {
        renderQuestion();
      } else {
        addPoints(currentUser.uid, totalPts, dayKey);
        const finalDisplay = double ? totalPts * 2 : totalPts;
        main.innerHTML = `
          <div class="card" style="text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">🎯</div>
            <p class="eyebrow">Quiz completat!</p>
            <h2 style="font-family:'Playfair Display',serif;">Felicitări!</h2>
            <p class="subtitle">Ai obținut <strong style="color:var(--gold)">${finalDisplay} puncte</strong> din ${selected.length * (double ? 20 : 10)} posibile.</p>
            ${double ? `<p style="font-size:13px;color:var(--gold);font-weight:600;">⭐ Dublu puncte aplicat!</p>` : ""}
            <p style="font-size:13px;color:var(--sage);margin-top:12px;">Revino mâine pentru o nouă provocare!</p>
          </div>
        `;
      }
    });
  }

  renderQuestion();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 3: STAFF / MENU HUNT
// ═══════════════════════════════════════════════════════════════════════════════
async function renderWeeklyHunt(dayKey, isMenuDay) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main    = document.getElementById("main-content");
  const title   = isMenuDay ? "Menu Hunt 🍽️" : "Staff Hunt 🕵️";
  const eyebrow = isMenuDay ? "Vânătoarea de meniu" : "Vânătoarea de personal";

  if (alreadyPlayed) {
    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">${eyebrow}</p>
        <h2 style="font-family:'Playfair Display',serif;">${title}</h2>
        <div class="played-badge" style="margin-top:12px;">✅ Ai jucat azi — revino ${isMenuDay ? 'luni' : 'mâine'}!</div>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">${eyebrow}</p>
      <h2 style="font-family:'Playfair Display',serif;">${title}</h2>
      <p style="color:var(--sage);font-size:14px;margin-top:8px;">Se încarcă provocarea săptămânii...</p>
    </div>
  `;

  let huntData = null;
  try {
    const huntKey = isMenuDay ? "menuHunt" : "staffHunt";
    const snap    = await getDoc(doc(db, "config", huntKey));
    if (snap.exists()) huntData = snap.data();
  } catch (err) {
    console.error("Eroare la citirea hunt:", err);
  }

  if (!huntData || !huntData.question) {
    main.innerHTML = `
      <div class="card" style="text-align:center;">
        <p class="eyebrow">${eyebrow}</p>
        <div style="font-size:48px;margin:16px 0;">⏳</div>
        <h2 style="font-family:'Playfair Display',serif;">${title}</h2>
        <p style="color:var(--sage);font-size:14px;line-height:1.6;margin-top:8px;">
          Provocarea de azi nu a fost setată încă.<br>
          Revino mai târziu sau întreabă echipa Cuza16!
        </p>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">${eyebrow}</p>
      <h2 style="font-family:'Playfair Display',serif;margin-bottom:6px;">${title}</h2>
      ${isMenuDay
        ? `<p style="font-size:13px;color:var(--sage);line-height:1.5;margin-bottom:16px;">🍽️ Uită-te la meniu sau întreabă ospătarul pentru a găsi răspunsul!</p>`
        : `<p style="font-size:13px;color:var(--sage);line-height:1.5;margin-bottom:16px;">🕵️ Privește în jur în local pentru a găsi răspunsul!</p>`
      }
      <div class="hunt-clue">${huntData.question}</div>
      ${huntData.hint ? `
        <div style="background:#FFF8E7;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:var(--charcoal);line-height:1.5;">
          💡 <strong>Indiciu:</strong> ${huntData.hint}
        </div>
      ` : ""}
      <div class="hunt-answer-wrap">
        <input type="text" id="hunt-answer" placeholder="Scrie răspunsul aici..." autocomplete="off">
      </div>
      <button class="btn btn-primary" id="hunt-submit-btn" style="margin-top:10px;">Trimite răspunsul</button>
      <div id="hunt-feedback" style="margin-top:12px;min-height:20px;"></div>
    </div>
  `;

  const answerInput = document.getElementById("hunt-answer");
  const feedbackEl  = document.getElementById("hunt-feedback");
  const submitBtn   = document.getElementById("hunt-submit-btn");
  let answered = false;

  function submitAnswer() {
    if (answered) return;
    const raw = answerInput.value.trim().toLowerCase();
    if (!raw) { feedbackEl.innerHTML = `<span style="color:red;">Scrie un răspuns înainte să trimiți.</span>`; return; }

    const correctAnswers = (huntData.answers || [huntData.answer || ""]).map(a => a.toLowerCase().trim());
    const isCorrect      = correctAnswers.some(a => raw === a || raw.includes(a) || a.includes(raw));

    answered = true;
    submitBtn.disabled   = true;
    answerInput.disabled = true;

    const pts = isCorrect ? 20 : 5;
    feedbackEl.innerHTML = `
      ${isCorrect
        ? `✅ <strong>Corect! Bravo!</strong> +${pts} puncte 🎉`
        : `❌ <strong>Răspuns incorect.</strong> +${pts} puncte pentru participare.<br>
           <span style="font-size:13px;color:var(--sage);">Răspunsul corect era: <strong>${huntData.answers?.[0] || huntData.answer || "—"}</strong></span>`
      }<br>
      <span style="font-size:13px;color:var(--sage);margin-top:4px;display:block;">${huntData.explanation || ""}</span>
    `;
    addPoints(currentUser.uid, pts, dayKey);
  }

  submitBtn.addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECRAN LUNI — preview Vault
// ═══════════════════════════════════════════════════════════════════════════════
function renderMondayVaultPreview() {
  const main          = document.getElementById("main-content");
  const alreadyOpened = userData.vaultOpenedThisWeek === true;
  const days          = Object.keys(userData.daysPlayed || {}).length;

  main.innerHTML = `
    <div class="card" style="text-align:center;">
      <p class="eyebrow">Este Luni!</p>
      <h2 style="font-family:'Playfair Display',serif;margin-bottom:6px;">Ziua Vault-ului 🔐</h2>
      <p class="subtitle">
        ${alreadyOpened
          ? "Ai deschis deja vault-ul această săptămână. Revino săptămâna viitoare!"
          : "Astăzi poți deschide Vault-ul și câștiga o recompensă secretă!"
        }
      </p>
      ${alreadyOpened
        ? `<div class="played-badge" style="margin-top:16px;">🔓 Vault deschis această săptămână</div>`
        : `<a href="vault.html" class="btn btn-gold" style="display:block;text-align:center;text-decoration:none;margin-top:20px;">Deschide Vault-ul →</a>`
      }
    </div>
    <div class="card">
      <p class="eyebrow" style="margin-bottom:10px;">Sumarul tău săptămânal</p>
      <div style="display:flex;gap:12px;">
        <div style="flex:1;text-align:center;padding:14px;background:var(--sand);border-radius:12px;">
          <div style="font-size:26px;font-weight:700;color:var(--gold);font-family:'Playfair Display',serif;">${userData.totalWallet || 0}</div>
          <div style="font-size:10px;color:var(--sage);margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Total Portofel</div>
        </div>
        <div style="flex:1;text-align:center;padding:14px;background:var(--sand);border-radius:12px;">
          <div style="font-size:26px;font-weight:700;color:var(--gold);font-family:'Playfair Display',serif;">${userData.weeklyScore || 0}</div>
          <div style="font-size:10px;color:var(--sage);margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Scor Săptămânal</div>
        </div>
        <div style="flex:1;text-align:center;padding:14px;background:var(--sand);border-radius:12px;">
          <div style="font-size:26px;font-weight:700;color:var(--gold);font-family:'Playfair Display',serif;">${days}</div>
          <div style="font-size:10px;color:var(--sage);margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Zile Jucate</div>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
function routeToDay() {
  const day    = getDayOfWeek();
  const dayKey = getDayKey();

  document.getElementById("loading-state")?.remove();

  switch (day) {
    case 1: renderMondayVaultPreview(); break;
    case 2: renderCatchGame("☕", "Prinde Cappuccino-urile! ☕", dayKey, "💦"); break;
    case 3: renderQuiz(dayKey); break;
    case 4: renderCatchGame("🥚", "Sparge Ouăle! 🥚", dayKey, "🍳"); break;
    case 5: renderQuiz(dayKey); break;
    case 6: renderWeeklyHunt(dayKey, false); break;
    case 0: renderWeeklyHunt(dayKey, true); break;
    default:
      document.getElementById("main-content").innerHTML =
        `<div class="card"><p>Revino în curând!</p></div>`;
  }

  setTimeout(renderStreakBar, 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIȚIALIZARE + TEST BAR
// ═══════════════════════════════════════════════════════════════════════════════
let initialized = false;

onAuthStateChanged(auth, async (user) => {
  if (initialized) return;
  if (!user) { window.location.href = "index.html"; return; }
  initialized = true;
  currentUser = user;

  userData = await loadUserData(user.uid);
  if (!userData) {
    document.getElementById("main-content").innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
        <h2>Eroare la încărcare</h2>
        <p style="color:var(--sage);">Nu am putut încărca profilul tău. Verifică conexiunea și reîncarcă pagina.</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="window.location.reload()">Reîncarcă</button>
      </div>
    `;
    return;
  }

  weekId = await checkWeeklyReset(user.uid, userData);
  if (!userData.currentWeekId) {
    userData.currentWeekId = weekId;
    try { await updateDoc(doc(db, "users", user.uid), { currentWeekId: weekId }); } catch(e) {}
  }

  updateScoreHeader(userData);

  // ── TEST BAR — șterge acest bloc înainte de lansare ──────────────────────
  const testBar = document.createElement("div");
  testBar.style.cssText = `
    position:fixed;bottom:70px;left:0;right:0;z-index:9999;
    background:rgba(20,20,20,0.95);padding:8px 12px;
    display:flex;gap:6px;justify-content:center;flex-wrap:wrap;
    border-top:1px solid #444;
  `;
  const days = [["L",1],["Ma",2],["Mi",3],["J",4],["V",5],["S",6],["D",0]];
  const forced = localStorage.getItem("testDay");
  testBar.innerHTML = days.map(([label, d]) => `
    <button onclick="localStorage.setItem('testDay','${d}');location.reload();"
      style="
        background:${forced === String(d) ? '#E8C47A' : '#333'};
        color:${forced === String(d) ? '#000' : '#fff'};
        border:none;border-radius:8px;padding:6px 14px;
        font-size:13px;font-weight:700;cursor:pointer;
      ">${label}</button>
  `).join("") + `
    <button onclick="localStorage.removeItem('testDay');location.reload();"
      style="background:#c0392b;color:#fff;border:none;border-radius:8px;
      padding:6px 14px;font-size:13px;font-weight:700;cursor:pointer;">
      REAL
    </button>
  `;
  document.body.appendChild(testBar);
  // ── SFÂRȘIT TEST BAR ──────────────────────────────────────────────────────

  routeToDay();
});
