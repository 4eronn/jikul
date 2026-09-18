/* ============================================================= JAPANESE CULINARY ARCHIVE APP SCRIPT */

/* 1. In-Memory State */
const AppState = {
  isAuth: false,
  currentUserEmail: '',
  kotowazaIndex: 0,
  isPlayingAudio: false,
  failedLoginCount: 0,
  
  kotowazaList: [
    { kanji: "七転び八起き", romaji: "Nanakorobi yaoki", makna: "Jatuh tujuh kali, bangkit delapan kali. Kalau hari ini capek belajar Kanji, besok kita obati dengan semangkok ramen panas." },
    { kanji: "一期一会", romaji: "Ichigo ichie", makna: "Satu kali, satu pertemuan. Hargai setiap detik nongkrong bareng sahabat, karena obrolan seru di kedai malam ini takkan pernah terulang sama." },
    { kanji: "継続は力なり", romaji: "Keizoku wa chikara nari", makna: "Konsistensi adalah kekuatan. Rutin berburu kedai ramen setiap minggu membuat persaudaraan kita makin tak terpisahkan." },
    { kanji: "笑う門には福来る", romaji: "Warau kado ni wa fuku kitaru", makna: "Kebahagiaan selalu datang ke meja yang dipenuhi tawa. Nongkrong sambil makan kenyang adalah obat stres paling ampuh." },
    { kanji: "和敬清寂", romaji: "Wakei seijaku", makna: "Harmoni, rasa hormat, kemurnian, dan ketenangan jiwa. Nikmati setiap seruputan kuah hangat dengan penuh rasa syukur." },
    { kanji: "温故知新", romaji: "Onko chishin", makna: "Mengenal masa lalu untuk menemukan hal baru. Dari langganan ramen legendaris sampai street food viral terbaru, gas kita coba!" },
    { kanji: "石の上にも三年", romaji: "Ishi no ue ni mo sannen", makna: "Duduk di atas batu dingin pun akan hangat setelah tiga tahun. Rela antre panjang 1 jam demi semangkok ramen terenak di kota." },
    { kanji: "十人十色", romaji: "Juu nin to iro", makna: "Sepuluh orang, sepuluh warna. Ada yang suka kuah pedas, kuah shoyu, atau cuma numpang beli es krim — semua tetap satu keluarga." },
    { kanji: "雨降って地固まる", romaji: "Ame futte ji katamaru", makna: "Setelah hujan turun, tanah menjadi kokoh. Kehujanan bareng pas naik motor nyari makan malam justru jadi cerita paling berkesan." },
    { kanji: "切磋琢磨", romaji: "Sessa takuma", makna: "Saling mengasah dan mendukung satu sama lain. Belajar bareng, main bareng, jajan bareng, sukses pun bareng-bareng." },
    { kanji: "能ある鷹は爪を隠す", romaji: "Nou aru taka wa tsume wo kakusu", makna: "Elang berbakat menyembunyikan cakarnya. Kelihatannya cuma hobi nongkrong, tapi pas ujian bahasa Jepang nilainya tetap aman!" },
    { kanji: "塵も積もれば山となる", romaji: "Chiri mo tsumoreba yama to naru", makna: "Debu yang menumpuk bisa jadi gunung. Tabungan receh uang saku kalau dikumpulin bisa buat makan yakiniku all-you-can-eat." },
    { kanji: "初志貫徹", romaji: "Shoshi kantetsu", makna: "Teguh pada niat awal. Dari awal janjian makan ramen jam 7 malam, pantang pulang sebelum perut kenyang dan hati senang." },
    { kanji: "明日は明日の風が吹く", romaji: "Ashita wa ashita no kaze ga fuku", makna: "Besok angin hari esok yang berhembus. Jangan pusingkan tugas hari ini, mari makan gyoza dan bersenang-senang dulu." },
    { kanji: "案ずるより産むが易し", romaji: "Anzuru yori umu ga yasashi", makna: "Mencobanya lebih mudah daripada mengkhawatirkannya. Takut kepedasan makan ramen level 5? Gass coba bareng-bareng!" },
    { kanji: "初心忘るべからず", romaji: "Shoshin wasuru bekarazu", makna: "Jangan lupakan niat awalan. Ingat awal mula kita ketemu di kelas bahasa Jepang yang canggung tapi sekarang akrab banget." },
    { kanji: "千里の道も一歩から", romaji: "Senri no michi mo ippo kara", makna: "Perjalanan seribu mil dimulai dari satu langkah pertama. Dari jajan takoyaki 10 ribuan sampai rencana trip bareng ke Tokyo." },
    { kanji: "日進月歩", romaji: "Nisshin geppo", makna: "Kemajuan hari demi hari, bulan demi bulan. Kosakata bahasa Jepang nambah dikit, tapi daftar kedai ramen langganan nambah banyak." },
    { kanji: "自業自得", romaji: "Jigou jitoku", makna: "Menuai apa yang ditanam. Siapa suruh minta tambah cabe 10 sendok ke mangkok ramen, sekarang kepedesan sendiri." },
    { kanji: "花より団子", romaji: "Hana yori dango", makna: "Lebih memilih dango (makanan) daripada bunga. Daripada cuma foto estetik, yang paling penting ramennya habis tak bersisa." },
    { kanji: "井の中の蛙大海を知らず", romaji: "I no naka no kawazu taikai wo shirazu", makna: "Katak dalam tempurung. Jangan cuma makan di satu kedai, ayo jelajahi seluruh kuliner Jepang di pelosok kota!" },
    { kanji: "百聞は一見に如かず", romaji: "Hyakubun wa ikken ni shikazu", makna: "Mendengar seratus kali tak sebanding melihat sekali. Katanya ramen ini enak banget? Ayo buktikan langsung malam ini!" },
    { kanji: "禍を転じて福と為す", romaji: "Wazawai wo tenjite fuku to nasu", makna: "Mengubah musibah jadi berkah. Kedai ramen pertama tutup? Untung pindah ke kedai kedua yang ternyata jauh lebih enak." },
    { kanji: "猿も木から落ちる", romaji: "Saru mo ki kara ochiru", makna: "Monyet pun bisa jatuh dari pohon. Master pembuat ramen pun sesekali bisa keasinan, nikmati saja momennya." },
    { kanji: "光陰矢の如し", romaji: "Kouin ya no gotoshi", makna: "Waktu berlalu secepat anak panah. Tak terasa kebersamaan di circle Japanese Culinary ini sudah melewati begitu banyak cerita." },
    { kanji: "一山越えてまた一山", romaji: "Hito yama koete mata hito yama", makna: "Melewati satu gunung, bertemu gunung lain. Habis pusing ujian semester, langsung dihadang tantangan ramen porsi jumbo." },
    { kanji: "一石二鳥", romaji: "Isseki nichou", makna: "Sekali lempar satu batu dapat dua burung. Nongkrong asik sambil latihan pelafalan bahasa Jepang bareng kawan circle." },
    { kanji: "急がば回れ", romaji: "Isogaba maware", makna: "Bila tergesa-gesa, ambillah jalan memutar. Tiup dulu kuah ramen yang mendidih biar lidah gak melepuh saat menyeruput." },
    { kanji: "自画自賛", romaji: "Jiga jisan", makna: "Memuji karya sendiri. Merasa racikan saus takoyaki buatan sendiri paling juara di antara teman-teman." },
    { kanji: "臥薪嘗胆", romaji: "Gashin shoutan", makna: "Berjuang pantang menyerah demi tujuan mulia. Rela jalan kaki malam-malam demi mencari ramen buka 24 jam." }
  ],

  galleryList: [
    { title: "First Ramen Hunt di Kedai Sudut Kota", cat: "RAMEN ADVENTURE", date: "14 Okt 2024", desc: "Pertama kali satu circle kumpul lengkap habis kelas bahasa Jepang. Semua sepakat pesen kuah pedas level maksimal, berakhir pesan es teh manis 3 pitcher!", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=900&auto=format&fit=crop" },
    { title: "Takoyaki Party & Belajar Kanji Bareng", cat: "CIRCLE HANGOUT", date: "02 Nov 2024", desc: "Niat awal belajar tata bahasa buat ujian JLPT, tapi begitu panggangan takoyaki dinyalain, mejanya penuh saus dan mayones.", img: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=900&auto=format&fit=crop" },
    { title: "Night Trip: Berburu Kedai Ramen Hidden Gem", cat: "NIGHT RIDE", date: "20 Des 2024", desc: "Konvoi motor jam 11 malam kehujanan demi nyobain kedai ramen kecil di dalam gang sempit. Kuah hangatnya bener-bener gak ada tandingannya.", img: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=900&auto=format&fit=crop" },
    { title: "Momen Split Bill Paling Ngakak", cat: "MEMORIES", date: "15 Jan 2025", desc: "Debat receh ngitung uang kembalian 2 ribu rupiah selama 20 menit di parkiran kedai ramen sampai kasirnya ikutan tertawa.", img: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=900&auto=format&fit=crop" },
    { title: "Gyoza Crispy Challenge", cat: "FOOD BATTLE", date: "08 Feb 2025", desc: "Alex nantang Kevin lomba makan 30 pcs gyoza garing dalam 5 menit. Yasha jadi wasit sambil nyeruput matcha dingin.", img: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=900&auto=format&fit=crop" },
    { title: "Kompak Gagal Diet Berjamaah", cat: "UNFILTERED", date: "22 Mar 2025", desc: "Pagi hari di grup chat sepakat mulai diet sehat, jam 7 malam Ilma ngirim foto promo ramen buy 1 get 1, langsung gas kumpul.", img: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=900&auto=format&fit=crop" },
    { title: "Study Night: Buku & Udon Bareng", cat: "STUDY NIGHT", date: "10 Apr 2025", desc: "Ngerjain tugas kampus bareng-bareng di kedai udon favorit. Deadlinenya serentak jadi malah pada nyasar ngobrol soal anime sambil slurp udon panas.", img: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=900&auto=format&fit=crop" },
    { title: "Anniversary Circle: Satu Tahun Nongkrong", cat: "ANNIVERSARY", date: "28 Apr 2025", desc: "Tepat setahun circle Japanese Culinary terbentuk! Beli kue matcha, pesen ramen favorit masing-masing, dan bikin tulisan 1 TAHUN dari sumpit bekas.", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=900&auto=format&fit=crop" },
    { title: "Dessert Hunt: Mochi & Es Krim Matcha", cat: "DESSERT HUNT", date: "15 Mei 2025", desc: "Shafira yang kompor banget ngajakin dessert hopping setelah ramen. Icip 5 kedai manis dalam satu malam, dari mochi buatan tangan sampai parfait matcha estetik.", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=900&auto=format&fit=crop" },
    { title: "Ramen Level 10: Who Survives?", cat: "GROUP CHALLENGE", date: "07 Jun 2025", desc: "Challenge brutal: siapa yang tahan makan ramen level kepedasan tertinggi tanpa minta es. Zahwa menang telak, Kevin menyerah di suap ke-3, Kevin minta maaf ke lambungnya.", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=900&auto=format&fit=crop" },
    { title: "Random Walk: Nemu Kedai Soba Tersembunyi", cat: "RANDOM WALK", date: "22 Jul 2025", desc: "Iseng jalan kaki tanpa tujuan setelah kumpul sore. Nyasar masuk gang kecil dan nemuin kedai soba rumahan yang udah buka 20 tahun tapi belum terkenal sama sekali.", img: "https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=900&auto=format&fit=crop" },
    { title: "Farewell & See You Again, Mbak Ilma!", cat: "FAREWELL PARTY", date: "05 Sep 2025", desc: "Ilma dapat beasiswa ke Tokyo untuk satu semester. Circle ngadain farewell makan malam spesial, semua pada nangis di foto terakhir tapi tetep gelak saat tagihan datang.", img: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?q=80&w=900&auto=format&fit=crop" }
  ],

  messages: [
    { id: 1, name: "Yasha", role: "Ketua Circle", tag: "Ramen & Jajan", time: "12 Mar 2026, 20:15", content: "Circle ter-gokil seumur hidup! Niat awal bikin klub bahasa Jepang biar pinter, ujung-ujungnya malah hafal seluruh menu kedai ramen se-kota." },
    { id: 2, name: "Alex", role: "Wakil Ketua", tag: "Nostalgia", time: "10 Mar 2026, 18:40", content: "Gak bakal lupa momen motoran malam-malam kehujanan cuma buat nyari kuah tonkotsu pedas. Solid terus buat Japanese Culinary!" },
    { id: 3, name: "Ilma", role: "Bendahara Circle", tag: "Kocak", time: "08 Mar 2026, 21:05", content: "Sebagai bendahara, tugas terberatku bukan ngitung uang kas, tapi nagih split bill ramen kalian yang selalu pura-pura lupa kembalian wkwk." },
    { id: 4, name: "Mail", role: "Ketua Divisi", tag: "Terima Kasih", time: "05 Mar 2026, 19:22", content: "Makasih udah jadi tempat pulang paling nyaman. Walaupun kita sering gabut, kebersamaan sama kalian adalah kenangan terindah." },
    { id: 5, name: "Sigit", role: "Ketua Nikuma", tag: "Ramen & Jajan", time: "01 Mar 2026, 22:10", content: "Siapapun yang nemu kedai ramen baru, wajib drop titik maps di grup! Jangan makan sendirian tanpa ngajak squad!" }
  ]
};

/* 2. Parallax Intro Background (3D Depth pada Background Saja, Tulisan Tetap Stabil) */
function initIntro3DTilt() {
  const introPortal = document.getElementById('intro-portal');
  const bgEl = document.getElementById('intro-bg-el');

  if (!introPortal || !bgEl) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let animId = null;
  let isPortalActive = true;

  introPortal.addEventListener('mousemove', (e) => {
    if (!isPortalActive) return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    targetX = (e.clientX / w - 0.5) * 2;
    targetY = (e.clientY / h - 0.5) * 2;
  }, { passive: true });

  introPortal.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function renderTilt() {
    if (!isPortalActive) return;
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Hanya layer background yang bergeser untuk depth 3D, tulisan tetap diam & stabil
    bgEl.style.transform = `scale(1.06) translate(${currentX * -18}px, ${currentY * -18}px)`;

    animId = requestAnimationFrame(renderTilt);
  }

  animId = requestAnimationFrame(renderTilt);

  window.addEventListener('portalDismissed', () => {
    isPortalActive = false;
    if (animId) cancelAnimationFrame(animId);
  });
}

/* 3. Audio Controller & Custom Skip Logic (04:57 -> 08:58) */
const SKIP_START = 297; // 4 minutes 57 seconds = 297s
const SKIP_TARGET = 538; // 8 minutes 58 seconds = 538s

function initAudioEngine() {
  const audio = document.getElementById('bgm-audio');
  const timerEl = document.getElementById('music-timer');
  if (!audio) return;

  audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    
    // Automatic Skip: When reaching 4:57, jump straight to 8:58
    if (current >= SKIP_START && current < SKIP_TARGET) {
      audio.currentTime = SKIP_TARGET;
      showToast("⏭️ Melewati bagian musik (04:57 ➔ 08:58)...", "info");
    }

    if (timerEl) {
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60);
      const formatted = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      timerEl.innerText = `${formatted} (Skip: 04:57 ➔ 08:58)`;
    }
  });
}

function enterExperience() {
  window.dispatchEvent(new CustomEvent('portalDismissed'));
  const portal = document.getElementById('intro-portal');
  if (portal) {
    portal.classList.add('portal-hidden');
    setTimeout(() => {
      portal.style.display = 'none';
    }, 900);
  }

  playAudio();
  showToast("Selamat datang di Japanese Culinary! 🌸 Menikmati musik BGM...");
  triggerMascotReaction("Ikuzo! Mari berburu ramen! 🍜");
}

function playAudio() {
  const audio = document.getElementById('bgm-audio');
  const waves = document.getElementById('music-waves-el');
  const icon = document.getElementById('music-icon');
  if (!audio) return;

  audio.play().then(() => {
    AppState.isPlayingAudio = true;
    if (waves) waves.classList.remove('paused');
    if (icon) icon.className = 'fa-solid fa-pause';
  }).catch(e => {
    console.log('Audio autoplay prevented or waiting user gesture:', e);
  });
}

function toggleAudio() {
  const audio = document.getElementById('bgm-audio');
  const waves = document.getElementById('music-waves-el');
  const icon = document.getElementById('music-icon');
  if (!audio) return;

  if (AppState.isPlayingAudio) {
    audio.pause();
    AppState.isPlayingAudio = false;
    if (waves) waves.classList.add('paused');
    if (icon) icon.className = 'fa-solid fa-play';
    showToast("Musik dijeda.");
  } else {
    audio.play().then(() => {
      AppState.isPlayingAudio = true;
      if (waves) waves.classList.remove('paused');
      if (icon) icon.className = 'fa-solid fa-pause';
      showToast("Memutar YOASOBI Piano BGM...");
    });
  }
}

/* 4. Stationary Chibi Companion (Diam di Pojok, Tetap Animasi & Interaktif) */
let chibiBubbleTimer = null;

const chibiQuotes = [
  "Yo! Nongkrong santai di circle kita~ 🎶",
  "Ramen enak di mana lagi ya? 🍜",
  "Circle Japanese Culinary paling solid! 😎",
  "Scroll santai aja gais, ceritanya seru! ✨",
  "Nongkrong & jajan bareng ter-asik! ⛩️",
  "Swag tapi tetep wibu~ 🔥",
  "Konnichiwa minna-san! 👋",
  "Gass jelajahi semua kenangan kita! 🚀"
];

function initChibiCompanion() {
  const companion = document.getElementById('chibi-companion');
  if (!companion) return;

  // Dialog bubble ramah sesekali tanpa berpindah posisi
  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() > 0.55) {
      const quote = chibiQuotes[Math.floor(Math.random() * chibiQuotes.length)];
      showChibiBubble(quote, 3200);
    }
  }, 8000);
}
const initChibiRoamer = initChibiCompanion;

function showChibiBubble(text, duration = 3000) {
  const bubble = document.getElementById('chibi-bubble-el');
  if (!bubble) return;
  bubble.innerText = text;
  bubble.classList.add('show');
  clearTimeout(chibiBubbleTimer);
  chibiBubbleTimer = setTimeout(() => {
    bubble.classList.remove('show');
  }, duration);
}

function petMascot() {
  const companion = document.getElementById('chibi-companion');
  if (!companion) return;
  companion.classList.add('dance');
  const danceQuotes = [
    "Yo! Circle Japanese Culinary no. 1! 😎✨",
    "Aseeek! Asal jangan lupa traktir ramen ya! 🍜",
    "Gaya dulu bos! Swag abis~ 🔥",
    "Kenangan kita bakal abadi selamanya! 💖"
  ];
  const q = danceQuotes[Math.floor(Math.random() * danceQuotes.length)];
  showChibiBubble(q, 3500);
  setTimeout(() => {
    companion.classList.remove('dance');
  }, 900);
}

function triggerMascotReaction(customMsg = null) {
  const companion = document.getElementById('chibi-companion');
  if (!companion) return;

  companion.classList.add('dance');
  if (customMsg) {
    showChibiBubble(customMsg, 3000);
  }

  setTimeout(() => {
    companion.classList.remove('dance');
  }, 900);
}

/* 5. Mascot Facial Expressions & Meme Login Reactions */
function setMascotState(state) {
  const wrap = document.getElementById('login-mascot-wrap-el');
  const imgEl = document.getElementById('login-mascot-img-el');
  const bubble = document.getElementById('mascot-bubble-text');

  if (!wrap || !imgEl) return;

  wrap.classList.remove('mascot-state-fail1', 'mascot-state-fail2', 'mascot-state-success');

  if (state === 'idle') {
    imgEl.src = 'mascot-cutout.png';
    if (bubble) {
      bubble.style.display = 'block';
      bubble.innerText = "Yo! Masuk akun circle ya 😎";
    }
  } else if (state === 'fail1') {
    // 1st Fail -> Gambar 1: Bebek teriak ledakan nuklir
    wrap.classList.add('mascot-state-fail1');
    imgEl.src = 'login-fail-1.png';
    if (bubble) bubble.style.display = 'none';
  } else if (state === 'fail2') {
    // 2nd Fail -> Gambar 2: Hamster cangkir kopi ledakan nuklir
    wrap.classList.add('mascot-state-fail2');
    imgEl.src = 'login-fail-2.png';
    if (bubble) bubble.style.display = 'none';
  } else if (state === 'success') {
    // Success -> Gambar 3: Hamster bentuk hati
    wrap.classList.add('mascot-state-success');
    imgEl.src = 'login-success.png';
    if (bubble) bubble.style.display = 'none';
  }
}

/* 6. Three.js Ambient Sunlight Particles */
let scene, camera, renderer, emberGroup;
let targetMX = 0, targetMY = 0, curMX = 0, curMY = 0, curScroll = 0, targetScroll = 0;

function initForest3D() {
  const canvas = document.getElementById('gl');
  const forestBg = document.getElementById('forest-bg-el');
  if (!canvas || typeof THREE === 'undefined') return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a2618, 0.005);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 28;
  camera.position.y = 2;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambLight = new THREE.AmbientLight(0x10b981, 1.2);
  scene.add(ambLight);

  const sunLight = new THREE.PointLight(0xfef08a, 2.8, 60);
  sunLight.position.set(0, 16, 6);
  scene.add(sunLight);

  emberGroup = new THREE.Group();
  const embGeom = new THREE.SphereGeometry(0.06, 8, 8);
  const embMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 });

  for (let i = 0; i < 75; i++) {
    const m = new THREE.Mesh(embGeom, embMat);
    m.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35);
    m.userData = { vy: 0.008 + Math.random() * 0.014, vx: (Math.random() - 0.5) * 0.006 };
    emberGroup.add(m);
  }
  scene.add(emberGroup);

  window.addEventListener('mousemove', (e) => {
    targetMX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
    if (forestBg) {
      forestBg.style.transform = `scale(1.04) translate(${targetMX * -12}px, ${targetMY * -12}px)`;
    }
  });

  window.addEventListener('scroll', () => {
    targetScroll = window.scrollY * 0.0025;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    curMX += (targetMX - curMX) * 0.05;
    curMY += (targetMY - curMY) * 0.05;
    curScroll += (targetScroll - curScroll) * 0.08;

    camera.position.x = curMX * 1.8;
    camera.position.y = 2 - curMY * 1.2 - curScroll;
    camera.lookAt(0, -curScroll * 0.5, -14);

    if (emberGroup) {
      emberGroup.children.forEach(em => {
        em.position.y += em.userData.vy;
        em.position.x += em.userData.vx;
        if (em.position.y > 22) em.position.y = -18;
      });
    }

    renderer.render(scene, camera);
  }
  renderLoop();
}

/* 7. Reveal System */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-rv]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('rv-in');
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

/* 8. Toast */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!t || !msgEl) return;
  msgEl.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* 9. Kotowaza Logic */
function renderKotowaza(idx) {
  AppState.kotowazaIndex = idx;
  const item = AppState.kotowazaList[idx];
  document.getElementById('kw-index').innerText = (idx + 1);
  document.getElementById('kw-kanji').innerText = item.kanji;
  document.getElementById('kw-romaji').innerText = item.romaji;
  document.getElementById('kw-meaning').innerText = `"${item.makna}"`;
}

function shuffleKotowaza() {
  let next;
  do {
    next = Math.floor(Math.random() * AppState.kotowazaList.length);
  } while (next === AppState.kotowazaIndex && AppState.kotowazaList.length > 1);
  renderKotowaza(next);
  showToast("Pepatah baru dimuat!");
  triggerMascotReaction("Pepatah keren! 📜");
}

function copyKotowaza() {
  const item = AppState.kotowazaList[AppState.kotowazaIndex];
  navigator.clipboard.writeText(`${item.kanji} (${item.romaji}) - "${item.makna}"`).then(() => {
    showToast("Pepatah disalin ke clipboard!");
    triggerMascotReaction("Tersalin! ✨");
  });
}

/* 10. Gallery */
function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;
  container.innerHTML = '';
  AppState.galleryList.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'kage-card gallery-item';
    card.onclick = () => openLightbox(photo);
    card.innerHTML = `
      <div style="position:relative; overflow:hidden;">
        <img src="${photo.img}" alt="${photo.title}">
        <span style="position:absolute; top:12px; left:12px; font-size:9px; font-weight:600; letter-spacing:.15em; background:rgba(4,10,6,0.85); padding:4px 8px; border-radius:6px; color:var(--gold); border:1px solid var(--line-gold);">${photo.cat}</span>
        <span style="position:absolute; bottom:12px; right:12px; font-size:11px; color:#ddd; background:rgba(0,0,0,0.6); padding:2px 8px; border-radius:4px;">${photo.date}</span>
      </div>
      <div style="padding:20px;">
        <h4 style="font-family:'Instrument Serif',serif; font-size:20px; margin:0 0 6px; color:#fff;">${photo.title}</h4>
        <p style="font-size:12.5px; color:var(--bone-dim); margin:0 0 14px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${photo.desc}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--gold); border-top:1px solid var(--line-gold); padding-top:10px;">
          <span><i class="fa-solid fa-expand"></i> Buka Foto</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openLightbox(photo) {
  document.getElementById('lightbox-img-wrap').innerHTML = `<img src="${photo.img}" style="width:100%; height:auto; max-height:55vh; object-fit:contain; display:block; margin:0 auto;">`;
  document.getElementById('lb-cat').innerText = photo.cat;
  document.getElementById('lb-date').innerText = photo.date;
  document.getElementById('lb-title').innerText = photo.title;
  document.getElementById('lb-desc').innerText = photo.desc;
  document.getElementById('lightbox-modal').classList.add('open');
  triggerMascotReaction("Momen seru! 📸");
}

function closeLightbox() {
  document.getElementById('lightbox-modal').classList.remove('open');
}

/* 11. Guestbook */
function renderMessages() {
  const stream = document.getElementById('messages-stream');
  if (!stream) return;
  document.getElementById('msg-count').innerText = AppState.messages.length;
  stream.innerHTML = '';
  AppState.messages.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'kage-card';
    card.style.cssText = 'padding:22px; border-radius:16px;';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#a51d2d,#4e0710); display:flex; align-items:center; justify-content:center; font-weight:bold; color:var(--gold); font-size:13px;">${msg.name.charAt(0)}</div>
          <div>
            <h5 style="font-family:'Instrument Serif',serif; font-size:18px; margin:0; color:#fff;">${msg.name}</h5>
            <span style="font-size:11px; color:var(--muted);">${msg.role}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid var(--line-gold); color:var(--bone-dim);">${msg.tag}</span>
          <div style="font-size:10px; color:var(--muted); margin-top:2px;">${msg.time}</div>
        </div>
      </div>
      <p style="font-size:13.5px; color:var(--bone); line-height:1.65; margin:0; background:rgba(4,10,6,0.6); padding:12px 16px; border-radius:10px; border:1px solid var(--line-gold);">
        "${msg.content}"
      </p>
    `;
    stream.appendChild(card);
  });
}

function handleMessageSubmit(e) {
  e.preventDefault();
  if (!AppState.isAuth) {
    openLoginModal();
    return;
  }
  const name = document.getElementById('msg-name').value.trim();
  const role = document.getElementById('msg-role').value.trim();
  const tag = document.getElementById('msg-tag').value;
  const content = document.getElementById('msg-content').value.trim();

  const now = new Date();
  const formattedTime = now.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) + ', ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  AppState.messages.unshift({ id: Date.now(), name, role, tag, time: formattedTime, content });
  renderMessages();
  document.getElementById('msg-content').value = '';
  showToast("Cerita kenangan berhasil dikirim!");
  triggerMascotReaction("Pesan terkirim! 💌");
}

/* 12. Account Authentication & Interactive Meme Reactions */
function openLoginModal() {
  document.getElementById('login-modal').classList.add('open');
  setMascotState('idle');
  const userInput = document.getElementById('login-username');
  if (userInput) userInput.focus();
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('open');
  const errBox = document.getElementById('login-error');
  if (errBox) errBox.style.display = 'none';
  setMascotState('idle');
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('login-password');
  const icon = document.getElementById('toggle-pwd-icon');
  if (!pwdInput) return;

  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    pwdInput.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

function handleQuickGalleryClick() {
  document.getElementById('galeri').scrollIntoView({ behavior: 'smooth' });
  if (!AppState.isAuth) {
    setTimeout(openLoginModal, 500);
  }
}

async function handleAccountLoginSubmit(e) {
  if (e) e.preventDefault();

  const userEl = document.getElementById('login-username');
  const passEl = document.getElementById('login-password');
  const errBox = document.getElementById('login-error');
  const errText = document.getElementById('login-error-text');

  const username = userEl ? userEl.value.trim().toLowerCase() : '';
  const password = passEl ? passEl.value : '';

  if (!username || !password) {
    if (errBox) {
      errBox.style.display = 'block';
      if (errText) errText.innerText = 'Harap isi username dan password.';
    }
    return;
  }

  // Akun terverifikasi circle
  const allowedUsers = ['jikul@jc.co.id', 'jikul', 'jculinary', 'jculinary@gmail.com', 'jculinary06@gmail.com'];
  const isValidAuth = allowedUsers.includes(username) && (password === 'japaneseculinary');

  if (isValidAuth) {
    // LOGIN BERHASIL
    AppState.isAuth = true;
    AppState.currentUserEmail = username;
    AppState.failedLoginCount = 0;

    // Simpan ke storage client agar sinkron ke dashboard & tidak ter-reset
    try {
      sessionStorage.setItem('jc_auth_email', username);
      localStorage.setItem('jc_auth_email', username);
    } catch (_) {}

    // Sinkronisasi session ke backend API jika tersedia
    try {
      fetch('/api/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).catch(() => {});
    } catch (_) {}

    // Reaksi Sukses -> Gambar 3 (Hamster Heart Hands)
    setMascotState('success');
    if (errBox) errBox.style.display = 'none';

    showToast("Login Berhasil! Selamat datang Circle Member! 🫶");
    triggerMascotReaction("Yaaay! Selamat datang di circle! 🎉");

    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';

    setTimeout(() => {
      closeLoginModal();
      updateAuthUI();
      // Scroll halus ke galeri arsip
      const galeriEl = document.getElementById('galeri');
      if (galeriEl) galeriEl.scrollIntoView({ behavior: 'smooth' });
    }, 1200);

  } else {
    // LOGIN GAGAL
    AppState.failedLoginCount++;
    if (errBox) {
      errBox.style.display = 'block';
      if (AppState.failedLoginCount === 1) {
        if (errText) errText.innerText = 'Username atau password salah. Cek kembali akun circle kamu.';
      } else {
        if (errText) errText.innerText = 'Akses Ditolak! Akun circle: jikul@jc.co.id | Password: japaneseculinary';
      }
    }

    if (AppState.failedLoginCount === 1) {
      // Gagal 1x -> Gambar 1: Bebek teriak ledakan nuklir
      setMascotState('fail1');
    } else {
      // Gagal 2x atau lebih -> Gambar 2: Hamster cangkir kopi ledakan nuklir
      setMascotState('fail2');
    }
  }
}

// Cek sesi yang sedang aktif dari server (/api/check-session) atau local storage
async function checkExistingSession() {
  let authenticated = false;
  try {
    const res = await fetch('/api/check-session');
    const data = await res.json();
    if (data.authenticated && data.user) {
      authenticated = true;
      AppState.isAuth = true;
      AppState.currentUserEmail = data.user.email || 'jikul@jc.co.id';
      try {
        sessionStorage.setItem('jc_auth_email', AppState.currentUserEmail);
        localStorage.setItem('jc_auth_email', AppState.currentUserEmail);
      } catch (_) {}
      updateAuthUI();
    }
  } catch (err) {
    // API server tidak berjalan (mode static lokal)
  }

  if (!authenticated) {
    const local = sessionStorage.getItem('jc_auth_email') || localStorage.getItem('jc_auth_email');
    if (local) {
      AppState.isAuth = true;
      AppState.currentUserEmail = local;
      updateAuthUI();
    }
  }
}

async function handleLogout() {
  try {
    await fetch('/api/logout');
  } catch (e) {
    console.log('Logout fetch error:', e);
  }
  try {
    sessionStorage.removeItem('jc_auth_email');
    localStorage.removeItem('jc_auth_email');
  } catch (_) {}
  AppState.isAuth = false;
  AppState.currentUserEmail = '';
  AppState.failedLoginCount = 0;
  updateAuthUI();
  showToast("Anda telah keluar sesi.");
  triggerMascotReaction("Sampai jumpa lagi! 👋");
}

function updateAuthUI() {
  const actions = document.getElementById('auth-actions');
  const lockedGallery = document.getElementById('gallery-locked');
  const unlockedGallery = document.getElementById('gallery-unlocked');
  const navBadge = document.getElementById('nav-lock-badge');
  const lockedMsgForm = document.getElementById('msg-form-locked');
  const unlockedMsgForm = document.getElementById('msg-form-unlocked');

  if (AppState.isAuth) {
    if (actions) {
      actions.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <a href="dashboard.html" class="kage-btn-secondary" style="padding:6px 12px; font-size:11.5px; border-color:#34d399; color:#34d399;">
            <i class="fa-solid fa-gauge-high"></i> VIP Dashboard
          </a>
          <button onclick="handleLogout()" class="kage-btn-secondary" style="padding:6px 12px; font-size:11px;">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar
          </button>
        </div>
      `;
    }
    if (lockedGallery) lockedGallery.style.display = 'none';
    if (unlockedGallery) unlockedGallery.style.display = 'block';
    if (navBadge) {
      navBadge.style.background = '#064e3b';
      navBadge.style.borderColor = '#34d399';
      navBadge.innerText = 'Terbuka';
    }

    if (lockedMsgForm) lockedMsgForm.style.display = 'none';
    if (unlockedMsgForm) unlockedMsgForm.style.display = 'block';
    renderGallery();
  } else {
    if (actions) {
      actions.innerHTML = `
        <button onclick="openLoginModal()" class="kage-btn-primary" style="padding:8px 16px; font-size:12px;">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk Akun
        </button>
      `;
    }
    if (lockedGallery) lockedGallery.style.display = 'block';
    if (unlockedGallery) unlockedGallery.style.display = 'none';
    if (navBadge) {
      navBadge.style.background = '#4e0710';
      navBadge.style.borderColor = 'rgba(212,175,55,0.4)';
      navBadge.innerText = 'Terkunci';
    }

    if (lockedMsgForm) lockedMsgForm.style.display = 'block';
    if (unlockedMsgForm) unlockedMsgForm.style.display = 'none';
  }
}

// Tutup modal jika klik di luar box dialog
window.addEventListener('click', (e) => {
  const loginModal = document.getElementById('login-modal');
  if (e.target === loginModal) closeLoginModal();
  const lbModal = document.getElementById('lightbox-modal');
  if (e.target === lbModal) closeLightbox();
});

/* 13. Initialization */
window.addEventListener('DOMContentLoaded', () => {
  initIntro3DTilt();
  initAudioEngine();
  initChibiCompanion();
  initForest3D();
  initScrollReveal();
  renderKotowaza(Math.floor(Math.random() * AppState.kotowazaList.length));
  renderMessages();
  updateAuthUI();
  checkExistingSession();
});
