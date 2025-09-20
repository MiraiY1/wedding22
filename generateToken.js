import admin from "firebase-admin";
import fs from "fs";

// 1. Load service account
const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json"));

// 2. Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 3. Fungsi buat bikin token baru + link
async function createToken(customerName = "") {
  // Buat dokumen baru dengan ID otomatis
  const docRef = await db.collection("tokens").add({
    status: "unused",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    assignedTo: customerName
  });

  // Ambil ID dokumen sebagai token
  const tokenId = docRef.id;

  // Bikin link undangan
  const link = `https://namadomainmu.com/tab1.html?token=${tokenId}`;

  // Update dokumen dengan link
  await docRef.update({
    inviteLink: link
  });

  console.log("✅ Token baru dibuat untuk:", customerName);
  console.log("🔗 Link undangan tersimpan di Firestore:", link);

  return { tokenId, link };
}

// 4. Jalankan
(async () => {
  await createToken("Rusdi");
})();
