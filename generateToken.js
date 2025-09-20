import admin from "firebase-admin";
import fs from "fs";
import crypto from "crypto";

// 1. Load service account
const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));

// 2. Init Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// 3. Fungsi untuk generate random token (panjang default = 20 karakter)
function generateTokenId(length = 20) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString("hex") // ubah ke hex string
    .slice(0, length);
}

// 4. Fungsi buat bikin token baru + link
async function createToken(customerName = "") {
  // Generate token manual
  const tokenId = generateTokenId();

  // Buat link undangan langsung
  const inviteLink = `https://miraiy1.github.io/wedding22/tab1.html?token=${tokenId}`;

  // Buat dokumen dengan ID = tokenId
  const docRef = db.collection("tokens").doc(tokenId);

  // Simpan data awal
  await docRef.set({
    status: "unused", // unused | used | expired (opsional)
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    assignedTo: customerName,
    currentTab: 1,
    inviteLink: inviteLink,
    tab1: {}, // kosong dulu, nanti diisi dari tab1.html
    tab2: {},
    tab3: {},
    tab4: {}
  });

  console.log("✅ Token baru dibuat untuk:", customerName);
  console.log("🔑 Token ID:", tokenId);
  console.log("🔗 Link undangan:", inviteLink);

  return { tokenId, inviteLink };
}

// 5. Jalankan (contoh)
(async () => {
  await createToken("Rusdi");
  process.exit(0);
})();
