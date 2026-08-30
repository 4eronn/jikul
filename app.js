// SERENE BEAUTIFUL JAPAN APPLICATION ENGINE (LOCKED GALLERY, AUTH ACCOUNTS & MAIL SUPER ADMIN PRIVILEGES)

let currentUser = null;
let currentTheme = 'sakura';
let bgmPlaying = false;
let currentTrackIdx = 0;

// Quiz Index
let quizIndex = 0;
let quizScore = 0;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCustomCursor();
  initScrollReveal();
  initSakuraPetals();
  initAuth();
  subscribeMemoriesRealtime();
  renderCharacterRoster();
  renderSubwayTimeline();
  renderEmaNotes();
  initPlaylistPlayer();

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ==========================================================================
   1. AUTHENTICATION (9 @JIKUL.ID ACCOUNTS, PASSWORD & SUPER ADMIN)
   ========================================================================== */
function getUserPasswordMap() {
  return JSON.parse(localStorage.getItem('nihongo_passwords') || '{}');
}

function saveUserPasswordMap(map) {
  localStorage.setItem('nihongo_passwords', JSON.stringify(map));
}

function getUserPassword(email) {
  const map = getUserPasswordMap();
  return map[email] || DEFAULT_PASSWORD;
}

function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('loginUsername').value.trim().toLowerCase();
  const passInput = document.getElementById('loginPassword').value.trim();

  // Find account in AUTHORIZED_ACCOUNTS
  const matched = AUTHORIZED_ACCOUNTS.find(a => a.email.toLowerCase() === emailInput);
  if (!matched) {
    alert("❌ Email tidak terdaftar dalam anggota Nihongo Club! Gunakan email @jikul.id (contoh: ilma@jikul.id, mail@jikul.id)");
    return;
  }

  const expectedPass = getUserPassword(matched.email);
  if (passInput !== expectedPass) {
    alert("❌ Password salah! Default password adalah 112233.");
    return;
  }

  currentUser = matched;
  localStorage.setItem('nihongo_logged_in_user', JSON.stringify(currentUser));
  closeModal('loginModal');
  renderUserNav();
  renderMangaGallery();
  renderEmaNotes();
  playWebAudioSound('victory');
  triggerConfetti();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('nihongo_logged_in_user');
  renderUserNav();
  renderMangaGallery();
  renderEmaNotes();
  playWebAudioSound('click');
}

function openChangePasswordModal() {
  if (!currentUser) return;
  const label = document.getElementById('changePassUserLabel');
  if (label) label.innerText = `Akun Active: ${currentUser.email}`;
  openModal('changePasswordModal');
}

function handleChangePassword(e) {
  e.preventDefault();
  if (!currentUser) return;

  const oldPass = document.getElementById('oldPasswordInput').value.trim();
  const newPass = document.getElementById('newPasswordInput').value.trim();
  const currentExpected = getUserPassword(currentUser.email);

  if (oldPass !== currentExpected) {
    alert("❌ Password lama salah!");
    return;
  }

  if (newPass.length < 4) {
    alert("❌ Password baru minimal 4 karakter!");
    return;
  }

  const map = getUserPasswordMap();
  map[currentUser.email] = newPass;
  saveUserPasswordMap(map);

  closeModal('changePasswordModal');
  alert(`✅ Password untuk ${currentUser.email} berhasil diperbarui! Silakan gunakan password baru ini di login berikutnya.`);
  playWebAudioSound('victory');
}

function initAuth() {
  const saved = localStorage.getItem('nihongo_logged_in_user');
  if (saved) {
    try { currentUser = JSON.parse(saved); } catch(e) {}
  }
  renderUserNav();
}

function renderUserNav() {
  const c = document.getElementById('userNavContainer');
  if (!c) return;

  if (currentUser) {
    const isSuperAdmin = currentUser.email === 'mail@jikul.id' || currentUser.isAdmin;
    c.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-900 border border-rose-400 rounded-2xl px-3 py-1.5 text-xs font-mono shadow-lg">
        <span class="text-rose-300 font-bold">${currentUser.name} ${isSuperAdmin ? '👑 (Admin)' : ''}</span>
        <button onclick="openChangePasswordModal()" class="text-amber-300 font-bold hover:underline px-1" title="Ganti Password">🔑 Ubah Pass</button>
        <button onclick="handleLogout()" class="text-pink-400 font-bold hover:underline px-1">Logout</button>
      </div>
    `;
  } else {
    c.innerHTML = `
      <button onclick="openModal('loginModal')" class="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border border-white shadow-md hover:bg-rose-500 transition-all">Login</button>
    `;
  }

  // Render Upload Button in Gallery section if logged in
  const upContainer = document.getElementById('uploadGalleryBtnContainer');
  if (upContainer) {
    if (currentUser) {
      upContainer.innerHTML = `
        <button onclick="openModal('uploadModal')" class="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border border-white shadow-lg flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i> Unggah Momen Baru
        </button>
      `;
    } else {
      upContainer.innerHTML = `
        <button onclick="openModal('loginModal')" class="px-5 py-2.5 rounded-xl bg-slate-800 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-400/50 shadow-lg flex items-center gap-2">
          Login untuk Unggah
        </button>
      `;
    }
  }
}

/* ==========================================================================
   2. WASHI PAPER GALLERY (LOCKED UNTIL LOGIN & MAIL SUPER ADMIN DELETE)
   SEKARANG SINKRON REAL-TIME ANTAR SEMUA AKUN VIA FIREBASE FIRESTORE
   ========================================================================== */
let liveMemories = []; // cache data terbaru dari Firestore, dipakai semua fungsi render

function subscribeMemoriesRealtime() {
  if (typeof db === 'undefined') {
    console.warn('Firestore belum dikonfigurasi. Isi firebase-config.js terlebih dahulu.');
    liveMemories = [...GALLERY_DATA];
    renderMangaGallery();
    return;
  }

  db.collection('memories').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    const custom = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    liveMemories = [...custom, ...GALLERY_DATA];
    renderMangaGallery();
  }, (err) => {
    console.error('Gagal memuat galeri real-time:', err);
    liveMemories = [...GALLERY_DATA];
    renderMangaGallery();
  });
}

function getAllMemories() {
  return liveMemories.length ? liveMemories : [...GALLERY_DATA];
}

function renderMangaGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (!currentUser) {
    // LOCKED BANNER VIEW
    grid.innerHTML = `
      <div class="col-span-full p-12 rounded-3xl bg-slate-900/90 border-2 border-rose-500/50 text-center max-w-2xl mx-auto shadow-2xl">
        <div class="text-6xl mb-4 animate-pulse">🔒</div>
        <h3 class="text-2xl font-display font-extrabold text-white mb-2 font-jp">Galeri Kenangan Terkunci</h3>
        <p class="text-xs text-rose-300 mb-6 font-mono leading-relaxed">
          Foto & kenangan indah anggota Japanese Language Club dikunci demi privasi.<br />
          Silakan login dengan akun email @jikul.id Anda untuk melihat galeri kenangan!
        </p>
        <button onclick="openModal('loginModal')" class="px-8 py-3.5 rounded-2xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border-2 border-white shadow-xl hover:scale-105 transition-all">
          Login Akun Club Sekarang
        </button>
      </div>
    `;
    return;
  }

  const isMailAdmin = currentUser.email === 'mail@jikul.id' || currentUser.isAdmin;
  const memories = getAllMemories();

  grid.innerHTML = memories.map(item => `
    <div class="washi-panel p-4 rounded-2xl cursor-pointer group relative">
      ${isMailAdmin ? `
        <button onclick="event.stopPropagation(); deleteMemoryItem('${item.id}')" class="absolute top-2 right-2 z-30 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-1" title="Hapus Foto (Super Admin Mail)">
          🗑️ Hapus
        </button>
      ` : ''}

      <div class="relative w-full h-52 rounded-xl overflow-hidden bg-black mb-3 border border-rose-500/30">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute top-2 left-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-rose-300 text-[10px] font-bold uppercase border border-rose-500/40">
          ${item.category}
        </div>
        <button onclick="event.stopPropagation(); downloadMemoryImage('${item.image}', '${(item.title || 'foto').replace(/'/g, "")}')" class="absolute bottom-2 right-2 z-30 w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-rose-500/40 text-rose-200 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors" title="Download Foto">
          <i data-lucide="download" class="w-4 h-4"></i>
        </button>
      </div>

      <h4 class="font-extrabold text-base text-white line-clamp-1 mb-1 font-jp">${item.title}</h4>
      <p class="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">${item.description}</p>

      <div class="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
        <span class="text-rose-300 font-bold">Oleh ${item.uploader}</span>
        <button onclick="event.stopPropagation(); likeMemory('${item.id}')" class="text-amber-400 font-bold hover:scale-125 transition-transform">
          ❤️ ${item.likes || 0}
        </button>
      </div>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Download foto galeri — bekerja untuk foto base64 (upload lokal) maupun URL dari internet
async function downloadMemoryImage(src, filename) {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'nihongo-club-memory';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback kalau fetch gagal karena CORS (foto dari domain luar tanpa izin CORS)
    window.open(src, '_blank');
  }
}

function deleteMemoryItem(id) {
  if (!currentUser || currentUser.email !== 'mail@jikul.id') {
    alert("❌ Hanya akun mail@jikul.id yang memiliki hak akses menghapus galeri!");
    return;
  }

  const isCustom = liveMemories.some(m => m.id === id) && GALLERY_DATA.findIndex(g => g.id === id) === -1;

  if (confirm("Apakah Anda yakin ingin menghapus foto kenangan ini?")) {
    if (isCustom && typeof db !== 'undefined') {
      db.collection('memories').doc(id).delete().catch(err => console.error(err));
      // onSnapshot akan otomatis update tampilan di semua akun
    } else {
      const defaultIdx = GALLERY_DATA.findIndex(g => g.id === id);
      if (defaultIdx !== -1) GALLERY_DATA.splice(defaultIdx, 1);
      renderMangaGallery();
    }
    playWebAudioSound('click');
  }
}

function checkAuthAndOpenUpload() {
  if (!currentUser) {
    alert("Silakan login akun @jikul.id Anda terlebih dahulu untuk mengunggah momen!");
    openModal('loginModal');
    return;
  }
  openModal('uploadModal');
}

function handleUploadMemory(e) {
  e.preventDefault();
  if (!currentUser) return;

  const title = document.getElementById('upTitle').value;
  const category = document.getElementById('upCategory').value;
  const date = document.getElementById('upDate').value;
  const url = document.getElementById('upImage').value;
  const file = document.getElementById('upFile').files[0];
  const uploader = document.getElementById('upUploader').value;
  const description = document.getElementById('upDescription').value;

  const saveMemory = async (imgSrc) => {
    const newItem = {
      title,
      category,
      date,
      location: "Japanese Club",
      image: imgSrc || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
      description,
      uploader: uploader || currentUser.name,
      likes: 1,
      createdAt: Date.now()
    };

    if (typeof db === 'undefined') {
      alert('❌ Firestore belum dikonfigurasi (lihat firebase-config.js), upload tidak akan tersimpan permanen atau tersinkron ke akun lain.');
      closeModal('uploadModal');
      return;
    }

    try {
      await db.collection('memories').add(newItem);
      // onSnapshot otomatis me-refresh galeri di akun ini DAN semua akun lain yang sedang online
      closeModal('uploadModal');
      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('❌ Gagal mengunggah momen. Coba lagi (kemungkinan foto terlalu besar, gunakan foto di bawah 1MB).');
    }
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => saveMemory(evt.target.result);
    reader.readAsDataURL(file);
  } else {
    saveMemory(url);
  }
}

function likeMemory(id) {
  const isCustom = GALLERY_DATA.findIndex(g => g.id === id) === -1;

  if (isCustom && typeof db !== 'undefined') {
    const target = liveMemories.find(m => m.id === id);
    const newLikes = (target ? target.likes || 0 : 0) + 1;
    db.collection('memories').doc(id).update({ likes: newLikes }).catch(err => console.error(err));
    // onSnapshot otomatis update likes di semua akun
  } else {
    const target = GALLERY_DATA.find(m => m.id === id);
    if (target) {
      target.likes = (target.likes || 0) + 1;
      renderMangaGallery();
    }
  }
  playWebAudioSound('like');
  triggerConfetti();
}

/* ==========================================================================
   3. WOODEN EMA WISH BOARD (MAIL SUPER ADMIN DELETE PRIVILEGES)
   ========================================================================== */
function renderEmaNotes() {
  const grid = document.getElementById('notesGrid');
  if (!grid) return;

  const isMailAdmin = currentUser && (currentUser.email === 'mail@jikul.id' || currentUser.isAdmin);
  const customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
  const notes = [...customNotes, ...NOTES_DATA];

  grid.innerHTML = notes.map(n => `
    <div class="ema-wooden-plaque p-6 text-center relative">
      ${isMailAdmin ? `
        <button onclick="event.stopPropagation(); deleteEmaNote('${n.id}')" class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold shadow hover:bg-red-700 transition-colors" title="Hapus Ema Note (Super Admin Mail)">
          🗑️ Hapus
        </button>
      ` : ''}

      <span class="text-3xl block mb-2">${n.stamp || '⛩️'}</span>
      <p class="text-xs text-slate-200 italic mb-4 leading-relaxed font-jp">"${n.content}"</p>
      <div class="pt-2 border-t border-amber-800/60 text-[11px] font-mono text-amber-400 font-bold">
        — ${n.author}
      </div>
    </div>
  `).join('');
}

function deleteEmaNote(id) {
  if (!currentUser || currentUser.email !== 'mail@jikul.id') {
    alert("❌ Hanya akun mail@jikul.id yang memiliki hak akses menghapus pesan Ema!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus pesan Ema ini?")) {
    let customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
    customNotes = customNotes.filter(n => n.id !== id);
    localStorage.setItem('nihongo_custom_notes', JSON.stringify(customNotes));

    const defaultIdx = NOTES_DATA.findIndex(n => n.id === id);
    if (defaultIdx !== -1) {
      NOTES_DATA.splice(defaultIdx, 1);
    }

    renderEmaNotes();
    playWebAudioSound('click');
  }
}

function checkAuthAndOpenNoteModal() {
  if (!currentUser) {
    alert("Silakan login akun @jikul.id Anda terlebih dahulu untuk menggantung harapan Ema!");
    openModal('loginModal');
    return;
  }
  openModal('noteModal');
}

function handleAddNote(e) {
  e.preventDefault();
  if (!currentUser) return;

  const author = document.getElementById('noteAuthor').value;
  const content = document.getElementById('noteContent').value;
  const stamps = ['🌸', '⛩️', '🏮', '🍡', '🍙'];
  const stamp = stamps[Math.floor(Math.random() * stamps.length)];

  const newNote = {
    id: "ema_" + Date.now(),
    author: author || currentUser.name,
    content,
    stamp,
    date: new Date().toLocaleDateString('id-ID')
  };

  const customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
  customNotes.unshift(newNote);
  localStorage.setItem('nihongo_custom_notes', JSON.stringify(customNotes));

  closeModal('noteModal');
  renderEmaNotes();
  triggerConfetti();
}

/* ==========================================================================
   4. SHOJI DOORS INTRO, VOICE WELCOME, 2-SECOND DELAY & BGM UNMUTE
   ========================================================================== */
function openShojiDoors() {
  document.body.classList.add('shoji-open');
  playWebAudioSound('enter');

  primeBgmAudio();

  speakJapaneseWelcome(() => {
    console.log('[Audio] Suara sambutan selesai. Memberikan jeda 2 detik...');
    setTimeout(() => {
      unmuteBgmAudio();
    }, 2000);
  });

  setTimeout(() => {
    const doorL = document.getElementById('shojiDoorLeft');
    const doorR = document.getElementById('shojiDoorRight');
    if (doorL) doorL.style.display = 'none';
    if (doorR) doorR.style.display = 'none';
  }, 1200);
}

function primeBgmAudio() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;
  bgm.muted = true;
  bgm.loop = true;
  bgm.volume = 0.5;
  bgm.play().catch(e => console.log(e));
}

function unmuteBgmAudio() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;
  bgm.muted = false;
  bgm.volume = 0.5;
  bgm.loop = true;

  if (bgm.paused) {
    bgm.play().then(() => {
      bgmPlaying = true;
      updatePlaylistPlayBtn();
    }).catch(e => console.log(e));
  } else {
    bgmPlaying = true;
    updatePlaylistPlayBtn();
  }
}

function speakJapaneseWelcome(onFinishedCallback) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("いらっしゃいませ！日本語クラブへようこそ！");
    u.lang = 'ja-JP';
    u.rate = 0.9;

    let hasFinished = false;
    const finishHandler = () => {
      if (!hasFinished) {
        hasFinished = true;
        if (typeof onFinishedCallback === 'function') {
          onFinishedCallback();
        }
      }
    };

    u.onend = finishHandler;
    u.onerror = finishHandler;
    setTimeout(finishHandler, 2800);
    window.speechSynthesis.speak(u);
  } else {
    if (typeof onFinishedCallback === 'function') onFinishedCallback();
  }
}

/* TOP HEADER PLAYLIST PLAYER */
function initPlaylistPlayer() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;

  renderPlaylistDropdown();

  bgm.ontimeupdate = () => {
    updateMiniLyrics(bgm.currentTime);
  };

  bgm.onended = () => {
    currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST_DATA.length;
    loadAndPlayTrack(currentTrackIdx);
  };
}

function updateMiniLyrics(currentTime) {
  const track = PLAYLIST_DATA[currentTrackIdx];
  const lyricsEl = document.getElementById('miniLyricDisplay');
  if (!track || !track.lyrics || !lyricsEl) return;

  let activeLyric = track.lyrics[0].text;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeLyric = track.lyrics[i].text;
    }
  }
  lyricsEl.innerText = activeLyric;
}

function renderPlaylistDropdown() {
  const listEl = document.getElementById('playlistTrackList');
  if (!listEl) return;

  listEl.innerHTML = PLAYLIST_DATA.map((t, idx) => `
    <button onclick="selectPlaylistTrack(${idx})" class="w-full text-left p-2 rounded-xl hover:bg-rose-500/20 text-slate-200 transition-colors flex items-center justify-between ${currentTrackIdx === idx ? 'bg-rose-600/20 text-rose-300 font-bold border border-rose-500/40' : ''}">
      <span class="truncate max-w-[170px]">${idx + 1}. ${t.title}</span>
      <span class="text-[10px] font-mono text-slate-400">${t.artist}</span>
    </button>
  `).join('');
}

/* ==========================================================================
   MOBILE HAMBURGER MENU (NAV LINKS + THEME SWITCHER UNTUK LAYAR KECIL)
   ========================================================================== */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;
  menu.classList.toggle('hidden');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.add('hidden');
}

function togglePlaylistDropdown() {
  const dd = document.getElementById('playlistDropdown');
  if (dd) dd.classList.toggle('hidden');
}

function selectPlaylistTrack(idx) {
  currentTrackIdx = idx;
  loadAndPlayTrack(currentTrackIdx);
  renderPlaylistDropdown();
  const dd = document.getElementById('playlistDropdown');
  if (dd) dd.classList.add('hidden');
}

function loadAndPlayTrack(idx) {
  const track = PLAYLIST_DATA[idx];
  const bgm = document.getElementById('bgmAudio');
  const titleEl = document.getElementById('playlistTrackTitle');
  if (!track || !bgm) return;

  if (titleEl) titleEl.innerText = `${track.title} - ${track.artist}`;
  bgm.src = track.src;
  bgm.volume = 0.5;
  bgm.muted = false;
  bgm.loop = true;
  bgm.load();
  bgm.play().then(() => {
    bgmPlaying = true;
    updatePlaylistPlayBtn();
  }).catch(e => console.log(e));
}

function togglePlayTrack() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;

  if (bgmPlaying) {
    bgm.pause();
    bgmPlaying = false;
  } else {
    bgm.volume = 0.5;
    bgm.muted = false;
    bgm.loop = true;
    bgm.play().then(() => {
      bgmPlaying = true;
    }).catch(e => console.log(e));
    bgmPlaying = true;
  }
  updatePlaylistPlayBtn();
}

function updatePlaylistPlayBtn() {
  const btn = document.getElementById('playlistPlayBtn');
  if (!btn) return;
  btn.innerHTML = bgmPlaying ? '<i data-lucide="pause" class="w-4 h-4"></i>' : '<i data-lucide="play" class="w-4 h-4"></i>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* CUSTOM CURSOR & SCROLL REVEAL */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* THEME SWITCHER & SAKURA ENGINE */
function initTheme() {
  const saved = localStorage.getItem('nihongo_theme') || 'sakura';
  setTheme(saved);
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('nihongo_theme', theme);
  playWebAudioSound('click');
}

function initSakuraPetals() {
  const canvas = document.getElementById('sakuraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 5,
      speedY: Math.random() * 1.0 + 0.4,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * 360,
      spin: Math.random() * 0.04 - 0.02,
      opacity: Math.random() * 0.65 + 0.35
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const isShrine = currentTheme === 'shrine';

    for (let p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.spin;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      if (isShrine) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ff7597';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-p.size / 2, -p.size, -p.size, p.size / 3, 0, p.size);
        ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size, 0, 0);
        ctx.fill();
      }

      ctx.restore();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* MEMBER ROSTER CARDS */
function renderCharacterRoster() {
  const grid = document.getElementById('membersGrid');
  if (!grid) return;

  grid.innerHTML = MEMBER_DATA.map(m => `
    <div class="flip-card cursor-pointer" onclick="toggleCardFlip(this)">
      <div class="flip-card-inner">
        <div class="flip-card-front p-6 flex flex-col items-center justify-center">
          <div class="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-rose-400 mb-4 shadow-lg shadow-rose-500/30">
            <img src="${m.avatar}" alt="${m.name}" class="w-full h-full object-cover" />
          </div>
          <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase mb-2">
            ${m.roleBadge}
          </span>
          <h4 class="font-extrabold text-xl text-white mb-1 font-display">${m.name}</h4>
          <span class="text-xs font-jp text-rose-300 font-bold">${m.kanjiName}</span>
          <span class="mt-4 text-[10px] font-mono text-slate-400">💡 Sentuh untuk Flip 3D</span>
        </div>

        <div class="flip-card-back text-left">
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs font-jp text-rose-300 font-bold">${m.kanjiName}</span>
              <span class="text-[10px] font-mono text-slate-400">PROFILE CARD</span>
            </div>
            <p class="text-xs text-slate-200 italic mb-4">"${m.quote}"</p>
            <div class="space-y-2 text-[11px] font-mono mb-4 bg-black/60 p-3 rounded-xl border border-white/10">
              <div>
                <div class="flex justify-between text-slate-300 mb-1">
                  <span>Kanji Level</span>
                  <span class="text-rose-400 font-bold">${m.stats.kanji}%</span>
                </div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-rose-500 h-full" style="width: ${m.stats.kanji}%"></div>
                </div>
              </div>
            </div>
          </div>

          <button onclick="event.stopPropagation(); speakMemberVoice('${m.voiceLine.replace(/'/g, "\\'")}')" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md">
            🔊 Suara Karakter
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCardFlip(cardEl) {
  cardEl.classList.toggle('flipped');
  playWebAudioSound('flip');
}

function speakMemberVoice(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  }
}

/* OMIKUJI FORTUNE */
function drawOmikuji() {
  const fortunes = OMIKUJI_FORTUNES;
  const picked = fortunes[Math.floor(Math.random() * fortunes.length)];

  const card = document.getElementById('omikujiResultCard');
  const title = document.getElementById('omikujiTitle');
  const quote = document.getElementById('omikujiQuote');
  const color = document.getElementById('omikujiColor');
  const item = document.getElementById('omikujiItem');

  if (card && title && quote) {
    title.innerText = picked.title;
    quote.innerText = `"${picked.quote}"`;
    if (color) color.innerText = picked.luckyColor;
    if (item) item.innerText = picked.luckyItem;

    card.classList.remove('hidden');
    playWebAudioSound('victory');
    triggerConfetti();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("おめでとうございます！" + picked.title);
      u.lang = 'ja-JP';
      window.speechSynthesis.speak(u);
    }
  }
}

/* WEB AUDIO SOUND EFFECTS */
function playWebAudioSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'enter') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.6);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'victory') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.15);
      osc.frequency.setValueAtTime(783.99, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch(e) {}
}

/* TIMELINE */
function renderSubwayTimeline() {
  const container = document.getElementById('timelineList');
  if (!container) return;

  container.innerHTML = SUBWAY_TIMELINE.map(s => `
    <div class="subway-station glass-card p-5 sm:p-6 rounded-2xl border border-rose-500/30">
      <div class="flex flex-wrap items-center gap-2 justify-between mb-2">
        <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold shrink-0">${s.stationCode}</span>
        <span class="text-xs font-jp text-rose-300 font-bold text-right">${s.stationName}</span>
      </div>
      <h3 class="text-base sm:text-lg font-bold text-white mb-2">${s.title}</h3>
      <p class="text-xs text-slate-300 leading-relaxed">${s.description}</p>
    </div>
  `).join('');
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }
}
