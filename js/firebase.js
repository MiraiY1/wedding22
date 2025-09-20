// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ====== Firebase Configuration ======
const firebaseConfig = {
  apiKey: "AIzaSyCEqdh8gPO9Kq5Q36fAklOnfdTqdtW_i3o",
  authDomain: "weddingweb-8afc6.firebaseapp.com",
  projectId: "weddingweb-8afc6",
  storageBucket: "weddingweb-8afc6.firebasestorage.app",
  messagingSenderId: "549415648844",
  appId: "1:549415648844:web:c55bf084cd15b21a673ee9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ====== Cek Token ======
export async function checkToken(tokenId) {
  try {
    const ref = doc(db, "tokens", tokenId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { valid: false, reason: "Token tidak ditemukan" };
    }

    const data = snap.data();
    if (data.status !== "unused") {
      return { valid: false, reason: "Token sudah digunakan" };
    }

    return { valid: true, data };
  } catch (error) {
    console.error("Error checkToken:", error);
    return { valid: false, reason: "Terjadi kesalahan saat mengecek token" };
  }
}

// ====== Update Tab & Status ======
export async function updateCurrentTab(tokenId, tabNumber, status) {
  try {
    const ref = doc(db, "tokens", tokenId);

    const dataToUpdate = { currentTab: tabNumber };
    if (status) {
      dataToUpdate.status = status; // update status jika diberikan
    }

    await updateDoc(ref, dataToUpdate);
    console.log(`Token ${tokenId} updated:`, dataToUpdate);
  } catch (error) {
    console.error("Error updateCurrentTab:", error);
    throw error; // lempar ke pemanggil agar bisa ditangani
  }
}
