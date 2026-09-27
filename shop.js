// shop.js — BistroCuza16 Game

import {
  auth, db, onAuthStateChanged,
  doc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase-config.js";

const SHOP_ITEMS = [
  { id: "espresso",        emoji: "☕",  name: "Espresso gratuit",   desc: "Un espresso dublu la alegere",                cost: 50,  badge: null },
  { id: "cappuccino",      emoji: "🍵",  name: "Cappuccino gratuit", desc: "Cappuccino sau flat white",                   cost: 60,  badge: "Popular" },
  { id: "granola",         emoji: "🥣",  name: "Granola Bowl",       desc: "Un Granola Bowl (42 RON) inclus",             cost: 80,  badge: null },
  { id: "avocado_toast",   emoji: "🥑",  name: "Avocado Toast",      desc: "Un Avocado Toast (55 RON) inclus",            cost: 100, badge: null },
  { id: "discount_10",     emoji: "🏷️", name: "10% reducere",       desc: "La orice comandă, valabilă 7 zile",           cost: 40,  badge: null },
  { id: "eggs_benedict",   emoji: "🍳",  name: "Eggs Benedict",      desc: "Eggs Benedict (60 RON) inclus",               cost: 110, badge: "Premium" },
  { id: "dessert",         emoji: "🍌",  name: "Desert artizanal",   desc: "Banana Bread cu Matcha Cream sau înghețată",  cost: 70,  badge: null },
  { id: "combo_coffee_toast", emoji: "🎁", name: "Combo Café",       desc: "Cappuccino + Avocado Toast la preț special",  cost: 140, badge: "Ofertă" },
];

let currentUser = null;
let userData    = null;

function genCode(itemId) {
  const ts = Date.now().toString(36).toUpperCase();
  return `C16-${itemId.toUpperCase().slice(0, 4)}-${ts.slice(-5)}`;
}

function showModal(html) {
  document.getElementById("modal-sheet").innerHTML = html;
  document.getElementById("modal-overlay").style.display = "flex";
}

function hideModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function updateWalletDisplay() {
  const pts = userData.totalWallet || 0;
  document.getElementById("total-wallet").textContent   = pts + " pct";
  document.getElementById("wallet-display").textContent = pts + " pct";
}

function renderShop() {
  const grid = document.getElementById("shop-grid");
  const pts  = userData.totalWallet || 0;

  grid.innerHTML = SHOP_ITEMS.map(item => {
    const canBuy = pts >= item.cost;
    return `
      <div class="shop-item ${canBuy ? '' : 'disabled'}" data-id="${item.id}">
        ${item.badge ? `<div class="shop-item-badge">${item.badge}</div>` : ''}
        <div class="shop-item-emoji">${item.emoji}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-price">${item.cost} pct</div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".shop-item:not(.disabled)").forEach(el => {
    el.addEventListener("click", () => {
      const item = SHOP_ITEMS.find(i => i.id === el.dataset.id);
      if (item) openConfirmModal(item);
    });
  });
}

function openConfirmModal(item) {
  showModal(`
    <div class="modal-confirm">
      <span class="modal-confirm-emoji">${item.emoji}</span>
      <h2>${item.name}</h2>
      <p>${item.desc}<br><br>
         Costul acestei recompense este <strong style="color:var(--gold)">${item.cost} puncte</strong>.<br>
         Ai <strong>${userData.totalWallet || 0} puncte</strong> în portofel.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-btn">Anulează</button>
        <button class="btn btn-primary"   id="confirm-buy-btn">Confirmă</button>
      </div>
    </div>
  `);
  document.getElementById("cancel-btn").addEventListener("click", hideModal);
  document.getElementById("confirm-buy-btn").addEventListener("click", () => purchaseItem(item));
}

async function purchaseItem(item) {
  const btn = document.getElementById("confirm-buy-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Se procesează..."; }

  let freshPts = userData.totalWallet || 0;
  try {
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    if (snap.exists()) freshPts = snap.data().totalWallet || 0;
  } catch (err) {
    console.error("Eroare la citirea punctelor:", err);
  }

  if (freshPts < item.cost) {
    showModal(`
      <div class="modal-confirm">
        <span class="modal-confirm-emoji">😔</span>
        <h2>Puncte insuficiente</h2>
        <p>Nu ai suficiente puncte pentru această recompensă.<br>Continuă să joci pentru a acumula mai multe!</p>
        <button class="btn btn-primary" onclick="document.getElementById('modal-overlay').style.display='none'" style="width:100%;margin-top:8px;">Înțeles</button>
      </div>
    `);
    return;
  }

  const code          = genCode(item.id);
  const redemptionKey = `redemptions.${code}`;

  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      totalWallet: increment(-item.cost),
      [redemptionKey]: {
        item:       item.id,
        label:      item.name,
        cost:       item.cost,
        code:       code,
        redeemedAt: serverTimestamp(),
        used:       false,
      }
    });
  } catch (err) {
    console.error("Eroare la cumpărare:", err);
    showModal(`
      <div class="modal-confirm">
        <span class="modal-confirm-emoji">⚠️</span>
        <h2>Eroare de conexiune</h2>
        <p>Nu s-a putut procesa recompensa. Verifică conexiunea și încearcă din nou.</p>
        <button class="btn btn-primary" onclick="document.getElementById('modal-overlay').style.display='none'" style="width:100%;margin-top:8px;">Închide</button>
      </div>
    `);
    return;
  }

  userData.totalWallet = (userData.totalWallet || 0) - item.cost;
  updateWalletDisplay();
  renderShop();

  showModal(`
    <div class="modal-success">
      <div class="success-emoji">🎉</div>
      <h2>Recompensă obținută!</h2>
      <p>Codul tău de răscumpărare:</p>
      <div class="redemption-code">${code}</div>
      <p>Prezintă acest cod la casă pentru a beneficia de <strong>${item.name}</strong>.<br>
         Codul este valabil 30 de zile și poate fi folosit o singură dată.</p>
      <button class="btn btn-primary" id="close-success-btn" style="width:100%;margin-top:16px;">Am înțeles, mulțumesc!</button>
    </div>
  `);
  document.getElementById("close-success-btn").addEventListener("click", hideModal);
}

// ── INIȚIALIZARE ──────────────────────────────────────────────────────────────
let initialized = false;

onAuthStateChanged(auth, async (user) => {
  if (initialized) return;
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  initialized = true;
  currentUser = user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    window.location.href = "index.html";
    return;
  }
  userData = snap.data();

  document.getElementById("loading-state").style.display = "none";
  document.getElementById("shop-content").style.display  = "block";
  document.getElementById("weekly-score").textContent     = (userData.weeklyScore || 0) + " pct";

  updateWalletDisplay();
  renderShop();

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-overlay")) hideModal();
  });
});
