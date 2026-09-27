// auth-page.js — BistroCuza16 Game
// UI controller pentru formularele de login / register / reset de pe index.html

import { loginUser, registerUser, resetPassword } from "./auth.js";
import { auth, onAuthStateChanged } from "./firebase-config.js";

// ── Redirecționare dacă deja autentificat ────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "game.html";
});

// ── Referințe DOM ────────────────────────────────────────────────────────────
const loginForm    = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const resetForm    = document.getElementById("reset-form");
const alertBox     = document.getElementById("alert-box");

function showForm(formEl) {
  [loginForm, registerForm, resetForm].forEach(f => f.style.display = "none");
  formEl.style.display = "block";
  alertBox.innerHTML = "";
}

// ── Navigare între formulare ─────────────────────────────────────────────────
document.getElementById("show-register").addEventListener("click", () => showForm(registerForm));
document.getElementById("show-login").addEventListener("click",    () => showForm(loginForm));
document.getElementById("show-reset").addEventListener("click",    () => showForm(resetForm));
document.getElementById("back-to-login").addEventListener("click", () => showForm(loginForm));

// ── Alertă ──────────────────────────────────────────────────────────────────
function showAlert(msg, type = "error") {
  alertBox.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? "Se procesează..." : btn.dataset.label;
}

// Salvăm labelul inițial al fiecărui buton
document.querySelectorAll(".btn-primary").forEach(btn => {
  btn.dataset.label = btn.textContent;
});

// ── Mesaje de eroare Firebase → Romanian ────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":   "Adresa de email este deja folosită de un alt cont.",
    "auth/invalid-email":          "Adresa de email nu este validă.",
    "auth/user-not-found":         "Nu există un cont cu această adresă de email.",
    "auth/wrong-password":         "Parola este incorectă.",
    "auth/invalid-credential":     "Email sau parolă incorectă.",
    "auth/weak-password":          "Parola trebuie să aibă cel puțin 6 caractere.",
    "auth/too-many-requests":      "Prea multe încercări. Încearcă din nou mai târziu.",
    "auth/network-request-failed": "Eroare de conexiune. Verifică internetul.",
  };
  return map[code] || "A apărut o eroare. Încearcă din nou.";
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
document.getElementById("login-btn").addEventListener("click", async () => {
  const btn      = document.getElementById("login-btn");
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) { showAlert("Completează toate câmpurile."); return; }

  setLoading(btn, true);
  try {
    await loginUser(email, password);
    // onAuthStateChanged va redirecționa automat
  } catch (err) {
    showAlert(friendlyError(err.code));
    setLoading(btn, false);
  }
});

// Enter key pe câmpul de parolă declanșează login
document.getElementById("login-password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("login-btn").click();
});

// ── REGISTER ─────────────────────────────────────────────────────────────────
document.getElementById("register-btn").addEventListener("click", async () => {
  const btn       = document.getElementById("register-btn");
  const name      = document.getElementById("reg-name").value.trim();
  const email     = document.getElementById("reg-email").value.trim();
  const yearVal   = document.getElementById("reg-year").value.trim();
  const password  = document.getElementById("reg-password").value;

  if (!name || !email || !password) { showAlert("Completează toate câmpurile obligatorii."); return; }

  const birthYear = parseInt(yearVal, 10);
  if (yearVal && (isNaN(birthYear) || birthYear < 1920 || birthYear > 2015)) {
    showAlert("Introdu un an de naștere valid (ex: 1995)."); return;
  }

  if (password.length < 6) { showAlert("Parola trebuie să aibă cel puțin 6 caractere."); return; }

  setLoading(btn, true);
  try {
    const { memberCode } = await registerUser(email, password, name, birthYear || null);
    showAlert(
      `🎉 Cont creat cu succes! Codul tău de membru este <strong>${memberCode}</strong>. Bine ai venit la Cuza16!`,
      "success"
    );
    setTimeout(() => (window.location.href = "game.html"), 2500);
  } catch (err) {
    showAlert(err.message?.startsWith("Trebuie") ? err.message : friendlyError(err.code));
    setLoading(btn, false);
  }
});

// ── RESET PAROLĂ ─────────────────────────────────────────────────────────────
document.getElementById("reset-btn").addEventListener("click", async () => {
  const btn   = document.getElementById("reset-btn");
  const email = document.getElementById("reset-email").value.trim();

  if (!email) { showAlert("Introdu adresa de email."); return; }

  setLoading(btn, true);
  try {
    await resetPassword(email);
    showAlert(
      "📧 Email de resetare trimis! Verifică inbox-ul (și folderul Spam).",
      "success"
    );
    setTimeout(() => showForm(loginForm), 3000);
  } catch (err) {
    showAlert(friendlyError(err.code));
    setLoading(btn, false);
  }
});
