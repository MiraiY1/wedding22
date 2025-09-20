import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// ====== Firebase Config ======
const firebaseConfig = {
  apiKey: "AIzaSyCEqdh8gPO9Kq5Q36fAklOnfdTqdtW_i3o",
  authDomain: "weddingweb-8afc6.firebaseapp.com",
  projectId: "weddingweb-8afc6",
  storageBucket: "weddingweb-8afc6.appspot.com",
  messagingSenderId: "549415648844",
  appId: "1:549415648844:web:c55bf084cd15b21a673ee9"
};

// ====== Init ======
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ====== Cloudinary Config ======
const CLOUD_NAME = "dki0qa4vr";
const UPLOAD_PRESET = "wedding_foto";

// Upload ke Cloudinary
export async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message || "Upload gagal");
  return { url: data.secure_url, publicId: data.public_id };
}

// Delete di Cloudinary → ⚠️ harus via backend
export async function deleteFromCloudinary(publicId) {
  console.warn("Delete harus via backend. publicId:", publicId);
  return { result: "not_implemented" };
}

// Cek token
export async function checkToken(tokenId) {
  const ref = doc(db, "tokens", tokenId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return { valid: false, reason: "Token tidak ditemukan" };

  const data = snap.data();
  if (data.status !== "unused") {
    return { valid: false, reason: "Token sudah digunakan" };
  }

  return { valid: true, data };
}

// Update currentTab
export async function updateCurrentTab(tokenId, tabNumber, statusString = null) {
  const ref = doc(db, "tokens", tokenId);
  const dataToUpdate = { currentTab: tabNumber };
  if (typeof statusString === "string") dataToUpdate.status = statusString;
  await updateDoc(ref, dataToUpdate);
  console.log(`✅ currentTab diupdate ke ${tabNumber}`);
}

// Save data tab (merge)
export async function saveTabData(tokenId, tabName, formData) {
  const ref = doc(db, "tokens", tokenId);
  const snap = await getDoc(ref);

  let existing = {};
  if (snap.exists() && snap.data()[tabName]) existing = snap.data()[tabName];

  await updateDoc(ref, {
    [tabName]: { ...existing, ...formData }
  });

  console.log(`✅ Data ${tabName} berhasil diupdate`, formData);
}
