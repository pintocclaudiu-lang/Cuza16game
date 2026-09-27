// leaderboard.js — BistroCuza16 Game

import {
  auth, db, onAuthStateChanged,
  doc, getDoc, collection, query, orderBy, limit, getDocs
} from "./firebase-config.js";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function medalEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function getWeekLabel() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0) ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
  return `${fmt(monday)} – ${fmt(sunday)}.${sunday.getFullYear()}`;
}

function renderRow(rank, user, isCurrentUser) {
  const medal = medalEmoji(rank);
  const highlightClass = isCurrentUser ? "rank-row-self" : "";
  const rankDisplay    = medal ? medal : `#${rank}`;

  return `
    <div class="rank-row ${highlightClass}">
      <span class="rank-number">${rankDisplay}</span>
      <div class="rank-avatar">${initials(user.displayName)}</div>
      <span class="rank-name">${isCurrentUser ? "Tu ✨" : (user.displayName || "Anonim")}</span>
      <span class="rank-points">${user.weeklyScore || 0} pct</span>
    </div>
  `;
}

async function loadLeaderboard(currentUid, userData) {
  const loadingEl  = document.getElementById("loading-state");
  const listEl     = document.getElementById("rank-list");
  const emptyEl    = document.getElementById("empty-state");
  const topLabelEl = document.getElementById("top-label");

  try {
    // Sortăm pe weeklyScore descrescător, top 20
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("weeklyScore", "desc"), limit(20));
    const snap = await getDocs(q);

    const users = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      if ((d.weeklyScore || 0) > 0) {
        users.push({ uid: docSnap.id, ...d });
      }
    });

    loadingEl.style.display = "none";

    if (users.length === 0) {
      emptyEl.style.display = "block";
      return;
    }

    topLabelEl.style.display = "block";
    listEl.style.display     = "flex";
    listEl.innerHTML = users
      .map((user, idx) => renderRow(idx + 1, user, user.uid === currentUid))
      .join("");

    // Dacă utilizatorul curent nu e în top 20, îl adăugăm separat
    const inTop = users.some(u => u.uid === currentUid);
    if (!inTop && userData && (userData.weeklyScore || 0) > 0) {
      // Calculăm aproximativ rangul — facem un query count
      listEl.innerHTML += `
        <div style="text-align:center;padding:12px;font-size:12px;color:var(--sage);">• • •</div>
      `;
      listEl.innerHTML += renderRow("~", userData, true);
    }

  } catch (err) {
    console.error("Eroare clasament:", err);
    loadingEl.style.display = "none";
    emptyEl.style.display   = "block";
    emptyEl.querySelector("p").textContent = "Clasamentul nu s-a putut încărca. Încearcă din nou.";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "index.html"; return; }

  // Header scoruri
  const snap = await getDoc(doc(db, "users", user.uid));
  const userData = snap.exists() ? snap.data() : {};
  document.getElementById("total-wallet").textContent  = (userData.totalWallet || 0) + " pct";
  document.getElementById("weekly-score").textContent  = (userData.weeklyScore  || 0) + " pct";
  document.getElementById("week-label").textContent    = getWeekLabel();

  await loadLeaderboard(user.uid, userData);
});
