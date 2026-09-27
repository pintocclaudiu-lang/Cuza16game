// auth.js — BistroCuza16 Game

import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc, setDoc, serverTimestamp,
  runTransaction
} from "./firebase-config.js";

// Generează cod secvențial C16-0001, C16-0002...
async function generateMemberCode() {
  const counterRef = doc(db, "counters", "members");
  let newCode = "C16-0001";
  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let nextNum = 1;
    if (counterSnap.exists()) {
      nextNum = (counterSnap.data().count || 0) + 1;
      transaction.update(counterRef, { count: nextNum });
    } else {
      transaction.set(counterRef, { count: 1 });
    }
    newCode = "C16-" + String(nextNum).padStart(4, "0");
  });
  return newCode;
}

// Înregistrare — returnează { user, memberCode }
export async function registerUser(email, password, name, birthYear) {
  if (birthYear) {
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 16) {
      throw new Error("Trebuie să ai cel puțin 16 ani pentru a participa.");
    }
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const memberCode = await generateMemberCode();

  await setDoc(doc(db, "users", cred.user.uid), {
    email:                  email,
    displayName:            name,
    memberCode:             memberCode,
    createdAt:              serverTimestamp(),
    birthYear:              birthYear || null,
    totalWallet:            0,
    weeklyScore:            0,
    currentWeekId:          "",
    weeklyInteractionsCount: 0,
    hasWonRandomDraw:       false,
    vaultOpenedThisWeek:    false,
    lastInteractionDate:    "",
    daysPlayed:             {},
    vaultHistory:           {},
    redemptions:            {}
  });

  // CHEIE: signOut imediat după creare — elimină loop-ul infinit
  await signOut(auth);

  return { user: cred.user, memberCode };
}

// Login
export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Resetare parolă
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}
