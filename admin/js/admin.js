// ===== 1. Konfigurasi Firebase Web =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ===== 2. Fungsi generate token random =====
function generateTokenId(length = 20) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ===== 3. Fungsi untuk generate & simpan token =====
async function createToken() {
  const customerName = document.getElementById("customerName").value.trim();
  if (!customerName) {
    alert("Nama customer wajib diisi!");
    return;
  }

  const tokenId = generateTokenId();
  const inviteLink = `https://miraiy1.github.io/wedding22/tab1.html?token=${tokenId}`;

  const docRef = doc(db, "tokens", tokenId);

  await setDoc(docRef, {
    status: "unused",
    createdAt: serverTimestamp(),
    assignedTo: customerName,
    currentTab: 1,
    inviteLink: inviteLink,
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

  // pesan untuk customer
  const customerMessage = `Halo ${customerName},\nSilakan lengkapi formulir undangan pernikahan pada link berikut:\n${inviteLink}`;

  // tampilkan hasil
  const resultDiv = document.getElementById("result");
  const copyBtn = document.getElementById("copyBtn");
  const copyFullBtn = document.getElementById("copyFullBtn");

  resultDiv.style.display = "block";
  copyBtn.style.display = "inline-block";
  copyFullBtn.style.display = "inline-block";

  resultDiv.innerHTML = `
    <p><b>Token berhasil dibuat untuk:</b> ${customerName}</p>
    <p><b>Token ID:</b> ${tokenId}</p>
    <hr>
    <p><b>Teks untuk Customer:</b></p>
    <pre style="white-space:pre-wrap">${customerMessage}</pre>
  `;

  // simpan ke dataset tombol copy
  copyBtn.dataset.link = inviteLink;
  copyFullBtn.dataset.message = customerMessage;
}

// ===== 4. Fungsi copy link =====
document.getElementById("copyBtn").addEventListener("click", function () {
  const link = this.dataset.link;
  if (link) {
    navigator.clipboard.writeText(link).then(() => {
      alert("✅ Link berhasil dicopy!");
    });
  }
});

// ===== 5. Fungsi copy pesan lengkap =====
document.getElementById("copyFullBtn").addEventListener("click", function () {
  const message = this.dataset.message;
  if (message) {
    navigator.clipboard.writeText(message).then(() => {
      alert("✅ Pesan lengkap berhasil dicopy!");
    });
  }
});

window.createToken = createToken;
