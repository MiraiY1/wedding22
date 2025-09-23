// ===== 1. Konfigurasi Firebase Web =====
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TODO: ganti pake firebaseConfig project kamu
const firebaseConfig = {
  apiKey: "AIzaSyCEqdh8gPO9Kq5Q36fAklOnfdTqdtW_i3o",
  authDomain: "weddingweb-8afc6.firebaseapp.com",
  projectId: "weddingweb-8afc6",
  storageBucket: "weddingweb-8afc6.firebasestorage.app",
  messagingSenderId: "549415648844",
  appId: "1:549415648844:web:c55bf084cd15b21a673ee9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== 2. Auto Delete =====
const AUTO_DELETE_MINUTES = 5;

// ===== 3. Helper Fungsi =====
function generateTokenId(length = 20) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDuration(createdAt) {
  if (!createdAt) return "-";
  const createdMs = createdAt.toMillis ? createdAt.toMillis() : new Date(createdAt).getTime();
  const diffMinutes = Math.floor((Date.now() - createdMs) / (1000 * 60));
  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  const minutes = diffMinutes % 60;
  return `${days}h ${hours}j ${minutes}m`;
}

function shouldDelete(createdAt) {
  if (!createdAt) return false;
  const createdMs = createdAt.toMillis ? createdAt.toMillis() : new Date(createdAt).getTime();
  const ageMs = Date.now() - createdMs;
  console.log("Umur token (detik):", Math.floor(ageMs / 1000));
  return ageMs >= AUTO_DELETE_MINUTES * 60 * 1000;
}

// ===== 4. Generate Token =====
async function createToken() {
  const customerName = document.getElementById("customerName").value.trim();
  if (!customerName) {
    alert("Nama customer wajib diisi!");
    return;
  }

  const tokenId = generateTokenId();
  const inviteLink = `https://miraiy1.github.io/wedding22/tab1.html?token=${tokenId}`;

  await setDoc(doc(db, "tokens", tokenId), {
    status: "unused",
    createdAt: serverTimestamp(),
    assignedTo: customerName,
    currentTab: 1,
    inviteLink,
    tab1: {},
    tab2: {},
    tab3: {},
    tab4: {
      fotoLink: null,
      fotoPria: null,
      fotoWanita: null,
      fotoGaleri: [],
      cover: null,
      slideshow: [],
      lovestory: null
    }
  });

  // tampilkan pesan
  const resultDiv = document.getElementById("result");
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `
    <p><b>Token berhasil dibuat untuk:</b> ${customerName}</p>
    <p><b>Token ID:</b> ${tokenId}</p>
    <p><b>Teks untuk customer:</b><br>
    Silahkan lengkapi formulir dibawah ini:<br>
    <a href="${inviteLink}" target="_blank">${inviteLink}</a></p>
  `;

  const copyBtn = document.getElementById("copyBtn");
  copyBtn.style.display = "inline-block";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(`Silahkan lengkapi formulir dibawah ini:\n${inviteLink}`);
    alert("Pesan berhasil disalin!");
  };
}

window.createToken = createToken;

// ===== 5. Daftar Token (Realtime) =====
const tableBody = document.getElementById("tokenTableBody");

onSnapshot(collection(db, "tokens"), async (snapshot) => {
  tableBody.innerHTML = "";
  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();

    // auto hapus
    if (shouldDelete(data.createdAt)) {
      await deleteDoc(doc(db, "tokens", docSnap.id));
      return;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.assignedTo || "-"}</td>
      <td>${data.status || "-"}</td>
      <td>${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "-"}</td>
      <td>${formatDuration(data.createdAt)}</td>
      <td><button class="deleteBtn" data-id="${docSnap.id}">Hapus</button></td>
    `;
    tableBody.appendChild(tr);
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Yakin mau hapus token ini?")) {
        await deleteDoc(doc(db, "tokens", id));
      }
    };
  });
});
