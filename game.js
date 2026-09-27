// game.js — BistroCuza16 Game

import {
  auth, db, onAuthStateChanged, signOut,
  doc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase-config.js";

// ── Constante ─────────────────────────────────────────────────────────────────
const TAP_DURATION_SEC  = 15;
const TAP_POINTS_PER_TAP = 1;

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
    q: "Câte preparate de mic dejun are Cuza16 în meniu?",
    opts: ["7", "8", "9", "10"],
    correct: 2,
    explanation: "Cuza16 are 9 preparate de mic dejun."
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
    q: "Fettuccine with Beef Tenderloin costă:",
    opts: ["72 RON", "78 RON", "82 RON", "88 RON"],
    correct: 2,
    explanation: "Fettuccine with Beef Tenderloin costă 82 RON."
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
];

// ── Indicii Scavenger Hunt ────────────────────────────────────────────────────
const HUNT_CLUES = [
  {
    clue: "🔍 Cuza16 își descrie filosofia printr-un motto de trei fraze. Care este primul cuvânt din motoul lor?",
    answers: ["real"],
    hint: "Gândește-te la autenticitate — mâncarea lor nu este artificială.",
    explanation: "Mottoul Cuza16 începe cu \"Real\" — \"Real food • Good coffee • Slow moments\"."
  },
  {
    clue: "🔍 Cuza16 servește brunch în fiecare zi. La ce oră se deschide localul?",
    answers: ["8", "8:00", "opt", "ora 8"],
    hint: "Este o oră bună de dimineață — perfect pentru un mic dejun liniștit.",
    explanation: "Cuza16 deschide la 8:00 în fiecare zi a săptămânii."
  },
  {
    clue: "🔍 Ce preparat iconic se află atât în meniul de Breakfast, cât și în cel de Brunch la Cuza16?",
    answers: ["eggs benedict", "benedict"],
    hint: "Este un ou poșat pe pâine prăjită cu sos Hollandaise.",
    explanation: "Eggs Benedict (60 RON) este singurul preparat care apare atât la mic dejun cât și la brunch."
  },
  {
    clue: "🔍 Care este prețul celui mai scump preparat de pe meniu? Scrie doar cifra în RON.",
    answers: ["92", "92 ron", "92 lei"],
    hint: "Este un preparat care combină un ou cu o bucată de carne premium.",
    explanation: "Egg and Steak costă 92 RON și este cel mai scump preparat de pe meniu."
  },
  {
    clue: "🔍 Ce ingredient japonez apare în numele unui preparat exclusiv din meniul de Breakfast?",
    answers: ["yuzu"],
    hint: "Este un citric aromatic din Japonia, cu gust între lămâie și grepfrut.",
    explanation: "Yuzu apare în \"Eggs Royale Yuzu\" — un preparat premium la 62 RON."
  },
  {
    clue: "🔍 Cuza16 oferă un desert artizanal care combină o pâine cu banane cu o cremă de culoare verde. Cum se numește crema?",
    answers: ["matcha", "matcha cream"],
    hint: "Este o pudră de ceai verde japonez folosită des în patiserie.",
    explanation: "Homemade Banana Bread and Matcha Cream (48 RON) combină pâinea cu banane cu crema de matcha."
  },
  {
    clue: "🔍 Care preparat de pe meniu are origine coreeană și conține brisket și kimchi?",
    answers: ["kimchi brisket melt", "kimchi brisket", "brisket melt"],
    hint: "Kimchi este un ingredient fermentat tradițional coreean.",
    explanation: "Kimchi Brisket Melt (82 RON) este preparatul fusion coreean de pe meniu."
  },
  {
    clue: "🔍 Câte ore pe zi este deschis Cuza16? (de la deschidere până la închidere)",
    answers: ["9", "nouă", "9 ore"],
    hint: "Localul deschide la 8:00 și închide la 17:00.",
    explanation: "Cuza16 este deschis 9 ore pe zi — de la 8:00 la 17:00."
  },
  {
    clue: "🔍 Ce tip de paste mari (scurte și tubulare) se află pe meniu la Cuza16?",
    answers: ["paccheri"],
    hint: "Sunt paste italiene mari, asemănătoare cu rigatoni dar mai late.",
    explanation: "Paccheri with Red Sauce (56 RON) este preparatul cu paste tubulare mari de pe meniu."
  },
  {
    clue: "🔍 Care preparat turcesc tradițional (ouă în sos de iaurt cu unt) se găsește pe meniu?",
    answers: ["turkish eggs", "oua turcesti", "ouă turcești"],
    hint: "Se mai numește și Çılbır — un preparat clasic din bucătăria otomană.",
    explanation: "Turkish Eggs (45 RON) este preparatul tradițional turcesc de pe meniu."
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

function getDayOfWeek() {
  return new Date().getDay(); // 0=Duminică, 1=Luni...6=Sâmbătă
}

function showModal(content) {
  document.getElementById("modal-sheet").innerHTML = content;
  document.getElementById("modal-overlay").style.display = "flex";
}

function hideModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  try {
    await updateDoc(doc(db, "users", uid), {
      totalWallet:             increment(points),
      weeklyScore:             increment(points),
      currentWeekId:           weekId,
      lastInteractionDate:     dayKey,
      [`daysPlayed.${dayKey}`]: true,
      weeklyInteractionsCount: increment(1),
    });
    userData.totalWallet = (userData.totalWallet || 0) + points;
    userData.weeklyScore = (userData.weeklyScore  || 0) + points;
    updateScoreHeader(userData);
  } catch (err) {
    console.error("Eroare la salvarea punctelor:", err);
  }
}

// ── Reset săptămânal ──────────────────────────────────────────────────────────
async function checkWeeklyReset(uid, data) {
  const newWeekId = getWeekId();
  if (data.currentWeekId && data.currentWeekId !== newWeekId) {
    try {
      await updateDoc(doc(db, "users", uid), {
        weeklyScore:             0,
        currentWeekId:           newWeekId,
        weeklyInteractionsCount: 0,
        vaultOpenedThisWeek:     false,
      });
    } catch (err) {
      console.error("Eroare la reset săptămânal:", err);
    }
    data.weeklyScore             = 0;
    data.currentWeekId           = newWeekId;
    data.weeklyInteractionsCount = 0;
    data.vaultOpenedThisWeek     = false;
  }
  return newWeekId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 1: TAP-TAP
// ═══════════════════════════════════════════════════════════════════════════════
function renderTapGame(emoji, label, dayKey) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main = document.getElementById("main-content");

  main.innerHTML = `
    <div class="card">
      <p class="eyebrow">${label}</p>
      <h1>Jocul ${label}</h1>
      <p class="subtitle">Apasă cât mai rapid pe ${emoji} timp de ${TAP_DURATION_SEC} secunde!</p>
      <div id="tap-area">
        <div id="tap-target">${emoji}</div>
        <div id="tap-count">0</div>
        <div id="tap-timer">Pregătit?</div>
        <div id="tap-progress"><div id="tap-progress-bar" style="width:100%;"></div></div>
      </div>
      <div id="tap-result"></div>
      ${alreadyPlayed
        ? `<div class="played-badge">✅ Ai jucat deja azi — revino mâine!</div>`
        : `<button class="btn btn-primary" id="tap-start-btn">Pornește jocul</button>`
      }
    </div>
  `;

  if (alreadyPlayed) return;

  let tapCount     = 0;
  let running      = false;
  let timeLeft     = TAP_DURATION_SEC;
  let timerInterval = null;

  const targetEl = document.getElementById("tap-target");
  const countEl  = document.getElementById("tap-count");
  const timerEl  = document.getElementById("tap-timer");
  const barEl    = document.getElementById("tap-progress-bar");
  const resultEl = document.getElementById("tap-result");
  const startBtn = document.getElementById("tap-start-btn");

  function endGame() {
    running = false;
    clearInterval(timerInterval);
    activeTimer = null;
    targetEl.style.pointerEvents = "none";
    timerEl.textContent = "Timp expirat!";
    barEl.style.width   = "0%";

    const pts = Math.max(tapCount * TAP_POINTS_PER_TAP, 5);
    resultEl.innerHTML = `
      <strong>Ai apăsat de ${tapCount} ori!</strong><br>
      Ai câștigat <span style="color:var(--gold);font-weight:700;">${pts} puncte</span>. 🎉
    `;
    addPoints(currentUser.uid, pts, dayKey);
  }

  function startGame() {
    startBtn.style.display = "none";
    tapCount  = 0;
    timeLeft  = TAP_DURATION_SEC;
    running   = true;
    countEl.textContent          = "0";
    timerEl.textContent          = `${timeLeft}s`;
    barEl.style.transition       = `width ${TAP_DURATION_SEC}s linear`;
    barEl.style.width            = "0%";
    targetEl.style.pointerEvents = "auto";
    resultEl.innerHTML           = "";

    if (activeTimer) clearInterval(activeTimer);
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
    activeTimer = timerInterval;
  }

  startBtn.addEventListener("click", startGame);

  targetEl.addEventListener("click", () => {
    if (!running) return;
    tapCount++;
    countEl.textContent = tapCount;
    targetEl.classList.remove("pop");
    void targetEl.offsetWidth;
    targetEl.classList.add("pop");
    setTimeout(() => targetEl.classList.remove("pop"), 150);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 2: QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function renderQuiz(dayKey) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main = document.getElementById("main-content");

  if (alreadyPlayed) {
    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Provocarea Zilei</p>
        <h1>Quiz BistroCuza16</h1>
        <div class="played-badge" style="margin-top:12px;">✅ Ai răspuns la quiz azi — revino mâine!</div>
      </div>
    `;
    return;
  }

  const selected  = shuffle(QUIZ_QUESTIONS).slice(0, 5);
  let currentIdx  = 0;
  let totalPts    = 0;

  function renderQuestion() {
    const q = selected[currentIdx];
    const optHtml = q.opts.map((opt, i) =>
      `<button class="quiz-opt-btn" data-idx="${i}">${opt}</button>`
    ).join("");

    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Întrebarea ${currentIdx + 1} din ${selected.length}</p>
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
          +${pts} puncte<br>
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
        main.innerHTML = `
          <div class="card" style="text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">🎯</div>
            <p class="eyebrow">Quiz completat!</p>
            <h1>Felicitări!</h1>
            <p class="subtitle">Ai obținut <strong style="color:var(--gold)">${totalPts} puncte</strong> din ${selected.length * 10} posibile.</p>
            <p style="font-size:13px;color:var(--sage);margin-top:12px;">Revino mâine pentru o nouă provocare!</p>
          </div>
        `;
      }
    });
  }

  renderQuestion();
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI-JOC 3: SCAVENGER HUNT
// ═══════════════════════════════════════════════════════════════════════════════
function renderScavengerHunt(dayKey) {
  const alreadyPlayed = userData.daysPlayed?.[dayKey] === true;
  const main = document.getElementById("main-content");

  if (alreadyPlayed) {
    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Scavenger Hunt</p>
        <h1>Vânătoarea de indicii</h1>
        <div class="played-badge" style="margin-top:12px;">✅ Ai jucat Scavenger Hunt azi — revino mâine!</div>
      </div>
    `;
    return;
  }

  const selected = shuffle(HUNT_CLUES).slice(0, 3);
  let currentIdx = 0;
  let totalPts   = 0;
  let hints      = 0;

  function renderClue() {
    const clue = selected[currentIdx];
    hints = 0;

    main.innerHTML = `
      <div class="card">
        <p class="eyebrow">Indiciu ${currentIdx + 1} din ${selected.length}</p>
        <div class="hunt-clue">${clue.clue}</div>
        <div class="hunt-answer-wrap">
          <input type="text" id="hunt-answer" placeholder="Scrie răspunsul..." autocomplete="off">
        </div>
        <button class="btn btn-secondary" id="hunt-hint-btn" style="margin-top:10px;width:100%;">💡 Arată indiciu (−2 pct)</button>
        <button class="btn btn-primary" id="hunt-submit-btn">Trimite răspunsul</button>
        <div id="hunt-feedback"></div>
        <button class="btn btn-primary" id="hunt-next-btn" style="display:none;">
          ${currentIdx < selected.length - 1 ? "Următorul indiciu →" : "Finalizează vânătoarea"}
        </button>
      </div>
    `;

    const answerInput = document.getElementById("hunt-answer");
    const feedbackEl  = document.getElementById("hunt-feedback");
    const nextBtn     = document.getElementById("hunt-next-btn");
    const submitBtn   = document.getElementById("hunt-submit-btn");
    const hintBtn     = document.getElementById("hunt-hint-btn");
    let answered = false;

    hintBtn.addEventListener("click", () => {
      if (answered || hints > 0) return;
      hints++;
      hintBtn.disabled    = true;
      hintBtn.textContent = `💡 ${clue.hint}`;
      hintBtn.style.background = "#FFF8E7";
      hintBtn.style.color      = "var(--charcoal)";
    });

    function submitAnswer() {
      if (answered) return;
      const raw     = answerInput.value.trim().toLowerCase();
      const correct = clue.answers.some(a => raw === a.toLowerCase() || raw.includes(a.toLowerCase()));
      answered = true;
      submitBtn.disabled   = true;
      answerInput.disabled = true;

      const pts = correct ? Math.max(15 - hints * 2, 5) : 3;
      totalPts += pts;

      feedbackEl.innerHTML = `
        ${correct ? "✅ <strong>Răspuns corect!</strong>" : "❌ <strong>Răspuns greșit.</strong>"}
        +${pts} puncte<br>
        <span style="color:var(--sage);font-size:13px;">${clue.explanation}</span>
      `;
      nextBtn.style.display = "block";
    }

    submitBtn.addEventListener("click", submitAnswer);
    answerInput.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });

    nextBtn.addEventListener("click", () => {
      currentIdx++;
      if (currentIdx < selected.length) {
        renderClue();
      } else {
        addPoints(currentUser.uid, totalPts, dayKey);
        main.innerHTML = `
          <div class="card" style="text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">🔍</div>
            <p class="eyebrow">Scavenger Hunt completat!</p>
            <h1>Excelent!</h1>
            <p class="subtitle">Ai obținut <strong style="color:var(--gold)">${totalPts} puncte</strong> din această vânătoare de indicii!</p>
            <p style="font-size:13px;color:var(--sage);margin-top:12px;">Revino mâine pentru o nouă provocare!</p>
          </div>
        `;
      }
    });
  }

  renderClue();
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECRAN LUNI — preview Vault
// ═══════════════════════════════════════════════════════════════════════════════
function renderMondayVaultPreview() {
  const main = document.getElementById("main-content");
  const alreadyOpened = userData.vaultOpenedThisWeek === true;

  main.innerHTML = `
    <div class="card" style="text-align:center;">
      <p class="eyebrow">Este Luni!</p>
      <h1>Ziua Vault-ului 🔐</h1>
      <p class="subtitle">
        ${alreadyOpened
          ? "Ai deschis deja vault-ul această săptămână. Revino săptămâna viitoare!"
          : "Astăzi poți deschide Vault-ul și câștiga o recompensă secretă. Mergi la secțiunea Vault!"
        }
      </p>
      ${alreadyOpened
        ? `<div class="played-badge" style="margin-top:16px;">🔓 Vault deschis această săptămână</div>`
        : `<a href="vault.html" class="btn btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:20px;">Deschide Vault-ul →</a>`
      }
    </div>
    <div class="card">
      <p class="eyebrow">Scoruri săptămâna aceasta</p>
      <h1>Sumarul tău</h1>
      <div style="display:flex;gap:16px;margin-top:4px;">
        <div style="flex:1;text-align:center;padding:16px;background:var(--sand);border-radius:12px;">
          <div style="font-size:28px;font-weight:700;color:var(--gold);">${userData.totalWallet || 0}</div>
          <div style="font-size:11px;color:var(--sage);margin-top:4px;">Total Portofel</div>
        </div>
        <div style="flex:1;text-align:center;padding:16px;background:var(--sand);border-radius:12px;">
          <div style="font-size:28px;font-weight:700;color:var(--gold);">${userData.weeklyScore || 0}</div>
          <div style="font-size:11px;color:var(--sage);margin-top:4px;">Scor Săptămânal</div>
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
    case 1: renderMondayVaultPreview();                    break; // Luni
    case 2: renderTapGame("☕", "Cappuccino Tap", dayKey); break; // Marți
    case 3: renderQuiz(dayKey);                            break; // Miercuri
    case 4: renderTapGame("🍳", "Ouă Benedict Tap", dayKey); break; // Joi
    case 5: renderScavengerHunt(dayKey);                   break; // Vineri
    case 6: renderQuiz(dayKey);                            break; // Sâmbătă
    case 0: renderQuiz(dayKey);                            break; // Duminică
    default:
      document.getElementById("main-content").innerHTML =
        `<div class="card"><p>Zi necunoscută — revino în curând!</p></div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIȚIALIZARE
// ═══════════════════════════════════════════════════════════════════════════════
let initialized = false;

onAuthStateChanged(auth, async (user) => {
  if (initialized) return;
  if (!user) {
    window.location.href = "index.html";
    return;
  }
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
    try {
      await updateDoc(doc(db, "users", user.uid), { currentWeekId: weekId });
    } catch (err) {
      console.error("Eroare setare weekId:", err);
    }
  }

  updateScoreHeader(userData);
  routeToDay();
});
