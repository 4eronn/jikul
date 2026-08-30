// ==========================================================================
// KONFIGURASI FIREBASE — GANTI DENGAN MILIK PROJECT FIREBASE KAMU SENDIRI
// Cara dapetin nilai ini ada di panduan yang dikirim bersama file ini.
// ==========================================================================
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_KAMU",
  authDomain: "GANTI.firebaseapp.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
