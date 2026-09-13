// SERENE BEAUTIFUL JAPAN & JC CULINARY APPLICATION ENGINE

let currentUser = null;
let currentTheme = 'sakura';
let bgmPlaying = false;
let currentTrackIdx = 0;

// Quiz Index
let quizIndex = 0;
let quizScore = 0;

// Auto-Refresh Polling State
let _pollingIntervalId = null;
let _lastMemoriesFingerprint = null; // { count, newestId }
let _lastNotesFingerprint = null;    // { count, newestId }

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCustomCursor();
  initScrollReveal();
  initSakuraPetals();
  initAuth();
  renderMangaGallery();
  renderCharacterRoster();
  renderSubwayTimeline();
  renderEmaNotes();
  renderQuiz();
  initPlaylistPlayer();

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ==========================================================================
   1. MOBILE NAVIGATION DRAWER ENGINE
   ========================================================================== */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileNavMenu');
  if (!menu) return;

  if (menu.classList.contains('closed')) {
    menu.classList.remove('closed');
    menu.classList.add('open');
  } else {
    menu.classList.remove('open');
    menu.classList.add('closed');
  }
}

/* ==========================================================================
   2. AUTHENTICATION & RESPONSIVE USER NAV (DESKTOP & MOBILE DRAWER)
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

  const matched = AUTHORIZED_ACCOUNTS.find(a => a.email.toLowerCase() === emailInput);
  if (!matched) {
    alert("Username / Email tidak terdaftar! Silakan periksa kembali kredensial Anda.");
    return;
  }

  const expectedPass = getUserPassword(matched.email);
  if (passInput !== expectedPass) {
    alert("Password salah! Silakan periksa kembali password Anda.");
    return;
  }

  currentUser = matched;
  localStorage.setItem('nihongo_logged_in_user', JSON.stringify(currentUser));
  closeModal('loginModal');
  renderUserNav();
  renderMangaGallery();
  renderEmaNotes();
  startAutoRefresh();
  playWebAudioSound('victory');
  triggerConfetti();
}

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin Logout dari akun JC Culinary?")) {
    currentUser = null;
    localStorage.removeItem('nihongo_logged_in_user');
    stopAutoRefresh();
    renderUserNav();
    renderMangaGallery();
    renderEmaNotes();
    playWebAudioSound('click');
    alert("Logout Berhasil! Akun telah terkeluar. Akses Galeri Kenangan & Papan Pesan kini dikunci kembali.");
  }
}

function openChangePasswordModal() {
  if (!currentUser) return;
  const label = document.getElementById('changePassUserLabel');
  if (label) label.innerText = `Akun Aktif: ${currentUser.email}`;
  openModal('changePasswordModal');
}

async function handleChangePassword(e) {
  e.preventDefault();
  if (!currentUser) return;

  const oldPass = document.getElementById('oldPasswordInput').value.trim();
  const newPass = document.getElementById('newPasswordInput').value.trim();
  const currentExpected = getUserPassword(currentUser.email);

  if (oldPass !== currentExpected) {
    alert("Password lama salah!");
    return;
  }

  if (newPass.length < 4) {
    alert("Password baru minimal 4 karakter!");
    return;
  }

  // Simpan ke server database jika online
  try {
    await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, oldPassword: oldPass, newPassword: newPass })
    });
  } catch (err) {
    console.log('Password server sync offline');
  }

  const map = getUserPasswordMap();
  map[currentUser.email] = newPass;
  saveUserPasswordMap(map);

  closeModal('changePasswordModal');
  alert(`Password untuk ${currentUser.email} berhasil diperbarui di Database Server!`);
  playWebAudioSound('victory');
}

function initAuth() {
  const saved = localStorage.getItem('nihongo_logged_in_user');
  if (saved) {
    try { currentUser = JSON.parse(saved); } catch(e) {}
  }
  renderUserNav();
  if (currentUser) startAutoRefresh();
}

function renderUserNav() {
  const desktopNav = document.getElementById('userNavContainer');
  const mobileNav = document.getElementById('mobileUserNavContainer');

  const isSuperAdmin = currentUser && currentUser.isAdmin;

  if (currentUser) {
    document.body.classList.add('is-logged-in');

    const htmlDesktop = `
      <div class="flex items-center gap-1.5 bg-slate-900 border border-rose-400/60 rounded-xl px-2.5 py-1 text-[11px] font-mono shadow-md shrink-0">
        <span class="text-rose-300 font-bold truncate max-w-[100px] sm:max-w-[120px]">${currentUser.name} ${isSuperAdmin ? '(Admin)' : ''}</span>
        <button onclick="openChangePasswordModal()" class="text-amber-300 font-bold hover:text-amber-200 px-0.5" title="Ganti Password">Password</button>
        <button onclick="handleLogout()" class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-2.5 py-1 rounded-lg text-[11px] uppercase shadow transition-all shrink-0 flex items-center gap-1">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Logout
        </button>
      </div>
    `;
    const htmlMobile = `
      <div class="flex flex-col gap-2 p-3 bg-slate-900 border border-rose-400/50 rounded-xl text-xs font-mono">
        <div class="flex justify-between items-center">
          <span class="text-rose-300 font-bold">${currentUser.name} ${isSuperAdmin ? '(Admin)' : ''}</span>
          <span class="text-[10px] text-amber-300 uppercase">${currentUser.email}</span>
        </div>
        <div class="flex gap-2 pt-1 border-t border-slate-800">
          <button onclick="openChangePasswordModal(); toggleMobileMenu();" class="flex-1 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-[11px] text-center">Ganti Password</button>
          <button onclick="handleLogout(); toggleMobileMenu();" class="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[11px] text-center flex items-center justify-center gap-1">Logout</button>
        </div>
      </div>
    `;
    if (desktopNav) desktopNav.innerHTML = htmlDesktop;
    if (mobileNav) mobileNav.innerHTML = htmlMobile;
  } else {
    document.body.classList.remove('is-logged-in');

    const htmlDesktop = `
      <button onclick="openModal('loginModal')" class="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider border border-white/80 shadow hover:bg-rose-500 transition-all flex items-center gap-1">
        <i data-lucide="log-in" class="w-3 h-3"></i> Login
      </button>
    `;
    const htmlMobile = `
      <button onclick="openModal('loginModal'); toggleMobileMenu();" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border border-white shadow-md flex items-center justify-center gap-2">
        <i data-lucide="log-in" class="w-4 h-4"></i> Login Akun JC
      </button>
    `;
    if (desktopNav) desktopNav.innerHTML = htmlDesktop;
    if (mobileNav) mobileNav.innerHTML = htmlMobile;
  }

  // DYNAMIC LOCK EMOJI UPDATES FOR SECTION BADGES & MOBILE MENU LINKS (LOCK DISAPPEARS WHEN LOGGED IN)
  const galleryBadge = document.getElementById('gallerySectionBadge');
  if (galleryBadge) {
    galleryBadge.innerHTML = currentUser ? 'SCENIC MEMORIES' : '🔒 SCENIC MEMORIES';
  }

  const emaBadge = document.getElementById('emaSectionBadge');
  if (emaBadge) {
    emaBadge.innerHTML = currentUser ? 'WOODEN EMA WISH BOARD & PESAN' : '🔒 WOODEN EMA WISH BOARD & PESAN';
  }

  const mobileNavLinks = document.getElementById('mobileNavLinks');
  if (mobileNavLinks) {
    const lock = currentUser ? '' : '🔒 ';
    mobileNavLinks.innerHTML = `
      <a href="#gallery" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">${lock}Galeri Kenangan</a>
      <a href="#members" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">Anggota Club</a>
      <a href="#timeline" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">Garis Waktu</a>
      <a href="#omikuji" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">Penyemangat Bagimu</a>
      <a href="#quiz" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">Kuis Nihongo</a>
      <a href="#memoryWall" onclick="toggleMobileMenu()" class="hover:text-rose-400 py-2 border-b border-white/5 flex items-center gap-2">${lock}Papan Ema & Pesan</a>
    `;
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();

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
   3. WASHI PAPER GALLERY & SERVER DATABASE SYNC WITH DOWNLOAD FEATURE
   ========================================================================== */
let serverMemoriesList = null;
let serverNotesList = null;

async function fetchMemoriesFromServer() {
  try {
    const res = await fetch('/api/memories');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverMemoriesList = json.data;
        return serverMemoriesList;
      }
    }
  } catch (err) {
    console.log('[Offline / File Mode] Using local storage for memories');
  }
  return null;
}

async function getAllMemories() {
  if (serverMemoriesList !== null) {
    return serverMemoriesList;
  }
  const fromServer = await fetchMemoriesFromServer();
  if (fromServer) return fromServer;

  const custom = JSON.parse(localStorage.getItem('nihongo_custom_memories') || '[]');
  return [...custom, ...GALLERY_DATA];
}

async function renderMangaGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  if (!currentUser) {
    // LOCKED BANNER VIEW (SHOWS LOCK EMOJI WHEN NOT LOGGED IN)
    grid.innerHTML = `
      <div class="col-span-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border-2 border-rose-500/50 text-center max-w-2xl mx-auto shadow-2xl">
        <div class="text-5xl sm:text-6xl mb-4 animate-pulse">🔒</div>
        <h3 class="text-xl sm:text-2xl font-display font-extrabold text-white mb-2 font-jp">Galeri Kenangan Terkunci</h3>
        <p class="text-xs text-rose-300 mb-6 font-mono leading-relaxed">
          Foto & kenangan indah anggota JC Culinary dikunci demi privasi.<br />
          Silakan login dengan akun Anda untuk mengakses galeri!
        </p>
        <button onclick="openModal('loginModal')" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border-2 border-white shadow-xl hover:scale-105 transition-all">
          Login Akun Sekarang
        </button>
      </div>
    `;
    return;
  }

  const isMailAdmin = currentUser.isAdmin;
  const memories = await getAllMemories();

  grid.innerHTML = memories.map(item => `
    <div class="washi-panel p-4 rounded-2xl cursor-pointer group relative flex flex-col justify-between">
      ${isMailAdmin ? `
        <button onclick="event.stopPropagation(); deleteMemoryItem('${item.id}')" class="absolute top-2 right-2 z-30 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-1" title="Hapus Foto">
          Hapus
        </button>
      ` : ''}

      <div>
        <div class="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-black mb-3 border border-rose-500/30">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute top-2 left-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-rose-300 text-[10px] font-bold uppercase border border-rose-500/40">
            ${item.category}
          </div>
        </div>

        <h4 class="font-extrabold text-base text-white line-clamp-1 mb-1 font-jp">${item.title}</h4>
        <p class="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">${item.description || ''}</p>
      </div>

      <div class="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10 gap-2">
        <span class="text-rose-300 font-bold truncate max-w-[90px] sm:max-w-[110px]">Oleh ${item.uploader}</span>
        
        <div class="flex items-center gap-2 shrink-0">
          <!-- FITUR UNDUH GAMBAR -->
          <button onclick="event.stopPropagation(); downloadMemoryImage('${item.image}', '${item.title.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 hover:text-black hover:bg-amber-400 border border-amber-400/50 text-[10px] font-bold shadow flex items-center gap-1 transition-all" title="Unduh Foto Ini">
            <i data-lucide="download" class="w-3 h-3"></i> Unduh
          </button>

          <!-- SUKA / LIKE -->
          <button onclick="event.stopPropagation(); likeMemory('${item.id}')" class="text-rose-400 font-bold hover:scale-110 transition-transform flex items-center gap-1">
            ❤️ ${item.likes || 0}
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* FITUR DOWNLOAD GAMBAR DARI GALERI */
async function downloadMemoryImage(imageSrc, imageTitle) {
  try {
    playWebAudioSound('click');
    const cleanName = (imageTitle || 'foto_kenangan_jc')
      .replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff -]/g, '')
      .trim() || 'jc_memory';

    // 1. Jika URL Base64 Data atau path server lokal (/uploads/...)
    if (imageSrc.startsWith('data:image/') || imageSrc.startsWith('/uploads/') || imageSrc.startsWith('./')) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `${cleanName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerConfetti();
      return;
    }

    // 2. Jika URL Gambar Eksternal, ambil sebagai Blob agar browser langsung mengunduh
    const response = await fetch(imageSrc, { mode: 'cors' }).catch(() => null);
    if (response && response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cleanName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      triggerConfetti();
    } else {
      // 3. Fallback Canvas untuk Cross-Origin image download
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = `${cleanName}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
              triggerConfetti();
            } else {
              window.open(imageSrc, '_blank');
            }
          }, 'image/jpeg', 0.95);
        } catch (e) {
          window.open(imageSrc, '_blank');
        }
      };
      img.onerror = () => {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.target = '_blank';
        link.download = `${cleanName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = imageSrc;
    }
  } catch (err) {
    console.error('Download error:', err);
    window.open(imageSrc, '_blank');
  }
}

async function deleteMemoryItem(id) {
  if (!currentUser || !currentUser.isAdmin) {
    alert("Hanya Admin yang memiliki hak akses menghapus galeri!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus foto kenangan ini?")) {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Server delete offline fallback');
    }

    let custom = JSON.parse(localStorage.getItem('nihongo_custom_memories') || '[]');
    custom = custom.filter(m => m.id !== id);
    localStorage.setItem('nihongo_custom_memories', JSON.stringify(custom));

    const defaultIdx = GALLERY_DATA.findIndex(g => g.id === id);
    if (defaultIdx !== -1) {
      GALLERY_DATA.splice(defaultIdx, 1);
    }

    serverMemoriesList = null;
    await renderMangaGallery();
    playWebAudioSound('click');
  }
}

async function handleUploadMemory(e) {
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
      id: "mem_" + Date.now(),
      title,
      category,
      date,
      location: "JC Culinary",
      image: imgSrc || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
      description,
      uploader: uploader || currentUser.name,
      likes: 1
    };

    // 1. Simpan ke Database Server via API
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          newItem.image = json.data.image || newItem.image;
        }
      }
    } catch (err) {
      console.log('[Offline Fallback] Tersimpan di local storage');
    }

    // 2. Simpan cadangan ke localStorage
    const custom = JSON.parse(localStorage.getItem('nihongo_custom_memories') || '[]');
    custom.unshift(newItem);
    localStorage.setItem('nihongo_custom_memories', JSON.stringify(custom));

    serverMemoriesList = null;
    closeModal('uploadModal');
    await renderMangaGallery();
    triggerConfetti();
    playWebAudioSound('victory');
    alert("🌸 Momen kenangan baru berhasil diunggah dan disimpan ke Database Server!");
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => saveMemory(evt.target.result);
    reader.readAsDataURL(file);
  } else {
    saveMemory(url);
  }
}

async function likeMemory(id) {
  try {
    await fetch(`/api/memories/${id}/like`, { method: 'POST' });
  } catch (e) {
    console.log('Like offline fallback');
  }

  const custom = JSON.parse(localStorage.getItem('nihongo_custom_memories') || '[]');
  let target = (serverMemoriesList && serverMemoriesList.find(m => m.id === id)) ||
               custom.find(m => m.id === id) || 
               GALLERY_DATA.find(m => m.id === id);

  if (target) {
    target.likes = (target.likes || 0) + 1;
    if (custom.some(m => m.id === id)) {
      localStorage.setItem('nihongo_custom_memories', JSON.stringify(custom));
    }
  }

  serverMemoriesList = null;
  await renderMangaGallery();
  playWebAudioSound('like');
  triggerConfetti();
}

/* ==========================================================================
   4. WOODEN EMA WISH BOARD & PESAN (DATABASE SERVER SYNC)
   ========================================================================== */
async function fetchNotesFromServer() {
  try {
    const res = await fetch('/api/notes');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverNotesList = json.data;
        return serverNotesList;
      }
    }
  } catch (err) {
    console.log('[Offline / File Mode] Using local storage for notes');
  }
  return null;
}

async function getAllNotes() {
  if (serverNotesList !== null) {
    return serverNotesList;
  }
  const fromServer = await fetchNotesFromServer();
  if (fromServer) return fromServer;

  const customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
  return [...customNotes, ...NOTES_DATA];
}

async function renderEmaNotes() {
  const grid = document.getElementById('notesGrid');
  if (!grid) return;

  if (!currentUser) {
    // LOCKED BANNER VIEW FOR PESAN SECTION (SHOWS LOCK EMOJI WHEN NOT LOGGED IN)
    grid.innerHTML = `
      <div class="col-span-full p-8 sm:p-12 rounded-3xl bg-slate-900/90 border-2 border-amber-500/50 text-center max-w-2xl mx-auto shadow-2xl">
        <div class="text-5xl sm:text-6xl mb-4 animate-pulse">🔒</div>
        <h3 class="text-xl sm:text-2xl font-display font-extrabold text-white mb-2 font-jp">Papan Pesan & Ema Terkunci</h3>
        <p class="text-xs text-amber-300 mb-6 font-mono leading-relaxed">
          Pesan harapan & kenangan di Papan Ema dikunci demi privasi.<br />
          Silakan login dengan akun Anda untuk membaca dan menulis pesan!
        </p>
        <button onclick="openModal('loginModal')" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider border-2 border-white shadow-xl hover:scale-105 transition-all">
          Login untuk Mengakses Pesan
        </button>
      </div>
    `;
    return;
  }

  const isMailAdmin = currentUser && currentUser.isAdmin;
  const notes = await getAllNotes();

  grid.innerHTML = notes.map(n => `
    <div class="ema-wooden-plaque p-6 text-center relative">
      ${isMailAdmin ? `
        <button onclick="event.stopPropagation(); deleteEmaNote('${n.id}')" class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold shadow hover:bg-red-700 transition-colors" title="Hapus Ema Note">
          Hapus
        </button>
      ` : ''}

      <p class="text-xs text-slate-200 italic mb-4 leading-relaxed font-jp mt-2">"${n.content}"</p>
      <div class="pt-2 border-t border-amber-800/60 text-[11px] font-mono text-amber-400 font-bold">
        — ${n.author}
      </div>
    </div>
  `).join('');
}

async function deleteEmaNote(id) {
  if (!currentUser || !currentUser.isAdmin) {
    alert("Hanya Admin yang memiliki hak akses menghapus pesan Ema!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus pesan Ema ini?")) {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Server delete offline fallback');
    }

    let customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
    customNotes = customNotes.filter(n => n.id !== id);
    localStorage.setItem('nihongo_custom_notes', JSON.stringify(customNotes));

    const defaultIdx = NOTES_DATA.findIndex(n => n.id === id);
    if (defaultIdx !== -1) {
      NOTES_DATA.splice(defaultIdx, 1);
    }

    serverNotesList = null;
    await renderEmaNotes();
    playWebAudioSound('click');
  }
}

function checkAuthAndOpenNoteModal() {
  if (!currentUser) {
    alert("Silakan login ke akun Anda terlebih dahulu untuk mengakses dan menulis pesan!");
    openModal('loginModal');
    return;
  }
  openModal('noteModal');
}

async function handleAddNote(e) {
  e.preventDefault();
  if (!currentUser) return;

  const author = document.getElementById('noteAuthor').value;
  const content = document.getElementById('noteContent').value;

  const newNote = {
    id: "ema_" + Date.now(),
    author: author || currentUser.name,
    content,
    color: "amber",
    date: new Date().toLocaleDateString('id-ID')
  };

  // 1. Kirim ke Database Server via API
  try {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });
  } catch (err) {
    console.log('[Offline Fallback] Tersimpan di local storage');
  }

  // 2. Simpan cadangan ke localStorage
  const customNotes = JSON.parse(localStorage.getItem('nihongo_custom_notes') || '[]');
  customNotes.unshift(newNote);
  localStorage.setItem('nihongo_custom_notes', JSON.stringify(customNotes));

  serverNotesList = null;
  closeModal('noteModal');
  await renderEmaNotes();
  triggerConfetti();
  playWebAudioSound('victory');
  alert("🎋 Pesan Ema Anda berhasil digantung dan disimpan ke Database Server!");
}

/* ==========================================================================
   5. SHOJI DOORS INTRO, VOICE WELCOME, 2-SECOND DELAY & BGM UNMUTE
   ========================================================================== */
function openShojiDoors() {
  const introContainer = document.getElementById('shojiIntroContainer');
  if (introContainer) {
    introContainer.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    introContainer.style.opacity = '0';
    introContainer.style.transform = 'scale(0.95)';
    introContainer.style.pointerEvents = 'none';
    setTimeout(() => {
      introContainer.style.display = 'none';
    }, 600);
  }

  playWebAudioSound('enter');

  speakJapaneseWelcome(() => {
    console.log('[Audio] Ucapan selamat datang selesai. Menunggu jeda 2 detik sebelum memutar musik...');
    setTimeout(() => {
      unmuteBgmAudio();
    }, 2000);
  });
}

function primeBgmAudio() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;
  bgm.volume = 0.5;
  bgm.muted = false;
  bgm.loop = true;
  bgm.play().then(() => {
    bgmPlaying = true;
    updatePlaylistPlayBtn();
  }).catch(e => console.log("BGM play error:", e));
}

function unmuteBgmAudio() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;
  bgm.muted = false;
  bgm.volume = 0.5;
  bgm.loop = true;

  bgm.play().then(() => {
    bgmPlaying = true;
    updatePlaylistPlayBtn();
  }).catch(e => console.log("BGM play error:", e));
}

function speakJapaneseWelcome(onFinishedCallback) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("いらっしゃいませ！JC・クリナリーへようこそ！");
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

/* ==========================================================================
   6. TOP HEADER PLAYLIST PLAYER
   ========================================================================== */
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
  btn.innerHTML = bgmPlaying ? '<i data-lucide="pause" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>' : '<i data-lucide="play" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ==========================================================================
   7. TOUCH DEVICE & CUSTOM CURSOR ENGINE
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    return;
  }

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
  const particleCount = window.innerWidth < 640 ? 20 : 40;

  for (let i = 0; i < particleCount; i++) {
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
          <div class="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-rose-400 mb-3 sm:mb-4 shadow-lg shadow-rose-500/30">
            <img src="${m.avatar}" alt="${m.name}" class="w-full h-full object-cover" />
          </div>
          <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase mb-2">
            ${m.roleBadge}
          </span>
          <h4 class="font-extrabold text-lg sm:text-xl text-white mb-1 font-display">${m.name}</h4>
          <span class="text-xs font-jp text-rose-300 font-bold">${m.kanjiName}</span>
          <span class="mt-3 sm:mt-4 text-[10px] font-mono text-slate-400">Sentuh untuk Flip 3D</span>
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
            Suara Karakter
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

/* PENYEMANGAT BAGIMU (MOTIVATIONAL QUOTES) */
function drawOmikuji() {
  const fortunes = OMIKUJI_FORTUNES;
  const picked = fortunes[Math.floor(Math.random() * fortunes.length)];

  const card = document.getElementById('omikujiResultCard');
  const title = document.getElementById('omikujiTitle');
  const romaji = document.getElementById('omikujiRomaji');
  const quote = document.getElementById('omikujiQuote');
  const color = document.getElementById('omikujiColor');
  const item = document.getElementById('omikujiItem');

  if (card && title && quote) {
    title.innerText = picked.title;
    if (romaji) romaji.innerText = picked.romaji || "";
    quote.innerText = `"${picked.quote}"`;
    if (color) color.innerText = picked.luckyColor;
    if (item) item.innerText = picked.luckyItem;

    card.classList.remove('hidden');
    playWebAudioSound('victory');
    triggerConfetti();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(picked.title);
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
    } else if (type === 'like') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch(e) {}
}

/* TIMELINE */
function renderSubwayTimeline() {
  const container = document.getElementById('timelineList');
  if (!container) return;

  container.innerHTML = SUBWAY_TIMELINE.map(s => `
    <div class="subway-station glass-card p-5 sm:p-6 rounded-2xl border border-rose-500/30">
      <div class="flex items-center justify-between mb-2">
        <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">${s.stationCode}</span>
        <span class="text-xs font-jp text-rose-300 font-bold">${s.stationName}</span>
      </div>
      <h3 class="text-base sm:text-lg font-bold text-white mb-2">${s.title}</h3>
      <p class="text-xs text-slate-300 leading-relaxed">${s.description}</p>
    </div>
  `).join('');
}

/* ==========================================================================
   8. NIHONGO CLUB TRIVIA QUIZ
   ========================================================================== */
function renderQuiz() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  if (quizIndex >= QUIZ_QUESTIONS.length) {
    renderQuizResult(container);
    return;
  }

  const q = QUIZ_QUESTIONS[quizIndex];
  container.innerHTML = `
    <div class="flex items-center justify-between mb-4 text-xs font-mono text-slate-400">
      <span>Soal ${quizIndex + 1} / ${QUIZ_QUESTIONS.length}</span>
      <span>Skor: <strong class="text-amber-300">${quizScore}</strong></span>
    </div>
    <h3 class="text-base sm:text-lg font-bold text-white mb-5">${q.question}</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="quizOptions">
      ${q.options.map((opt, idx) => `
        <button onclick="answerQuiz(${idx})" class="quiz-option-btn text-left px-4 py-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs sm:text-sm text-slate-200 hover:border-rose-400 hover:bg-rose-500/10 transition-all">
          ${opt}
        </button>
      `).join('')}
    </div>
    <div id="quizFeedback" class="hidden mt-5 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed"></div>
  `;
}

function answerQuiz(selectedIdx) {
  const q = QUIZ_QUESTIONS[quizIndex];
  const optionButtons = document.querySelectorAll('#quizOptions .quiz-option-btn');
  const feedback = document.getElementById('quizFeedback');
  const isCorrect = selectedIdx === q.answer;

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    btn.classList.add('pointer-events-none');
    if (idx === q.answer) {
      btn.classList.add('!border-emerald-400', '!bg-emerald-500/20', 'text-emerald-300', 'font-bold');
    } else if (idx === selectedIdx) {
      btn.classList.add('!border-red-400', '!bg-red-500/20', 'text-red-300');
    }
  });

  if (isCorrect) quizScore++;

  if (feedback) {
    feedback.classList.remove('hidden');
    feedback.className = `mt-5 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${isCorrect ? 'bg-emerald-500/10 border-emerald-400 text-emerald-200' : 'bg-red-500/10 border-red-400 text-red-200'}`;
    feedback.innerHTML = `
      <div class="font-bold mb-1">${isCorrect ? 'Benar!' : 'Kurang Tepat'}</div>
      <p>${q.explanation}</p>
      <button onclick="nextQuizQuestion()" class="mt-4 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-rose-500 transition-all">
        ${quizIndex + 1 < QUIZ_QUESTIONS.length ? 'Soal Berikutnya →' : 'Lihat Hasil Akhir →'}
      </button>
    `;
  }

  playWebAudioSound(isCorrect ? 'victory' : 'click');
  if (isCorrect) triggerConfetti();
}

function nextQuizQuestion() {
  quizIndex++;
  renderQuiz();
}

function renderQuizResult(container) {
  const total = QUIZ_QUESTIONS.length;
  const percent = Math.round((quizScore / total) * 100);
  let verdict = "Terus semangat belajar bahasa & budaya Jepang! 🌸";
  if (percent === 100) verdict = "Sugoi! Nilai sempurna, kamu jagoan! 🌸";
  else if (percent >= 60) verdict = "Yoku dekimashita! Sudah bagus, sedikit lagi sempurna! 🌸";

  container.innerHTML = `
    <div class="text-center">
      <div class="text-5xl mb-3">🌸</div>
      <h3 class="text-xl sm:text-2xl font-display font-extrabold text-white mb-2">Skor Akhir: ${quizScore} / ${total}</h3>
      <p class="text-xs sm:text-sm text-amber-300 font-mono mb-6">${verdict}</p>
      <button onclick="restartQuiz()" class="px-6 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider border-2 border-white shadow-xl hover:scale-105 transition-all">
        Ulangi Kuis
      </button>
    </div>
  `;
  triggerConfetti();
}

function restartQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }
}

/* ==========================================================================
   9. AUTO-REFRESH POLLING ENGINE (GALLERY & EMA BOARD LIVE SYNC)
   ========================================================================== */
const AUTO_REFRESH_INTERVAL_MS = 6000; // 6 detik

function _buildFingerprint(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return { count: 0, newestId: null };
  return { count: dataArray.length, newestId: dataArray[0].id || null };
}

function _fingerprintChanged(oldFp, newFp) {
  if (!oldFp && !newFp) return false;
  if (!oldFp || !newFp) return true;
  return oldFp.count !== newFp.count || oldFp.newestId !== newFp.newestId;
}

function _isModalOpen() {
  const modals = ['uploadModal', 'noteModal', 'loginModal', 'changePasswordModal'];
  return modals.some(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
}

async function _pollForUpdates() {
  if (!currentUser) return;
  if (_isModalOpen()) return; // Jangan ganggu user yang sedang isi form

  try {
    // --- Poll Galeri (Memories) ---
    const memRes = await fetch('/api/memories');
    if (memRes.ok) {
      const memJson = await memRes.json();
      if (memJson && memJson.success && Array.isArray(memJson.data)) {
        const newFp = _buildFingerprint(memJson.data);
        if (_fingerprintChanged(_lastMemoriesFingerprint, newFp)) {
          serverMemoriesList = memJson.data;
          _lastMemoriesFingerprint = newFp;
          await renderMangaGallery();
          console.log('[Auto-Refresh] Galeri diperbarui:', newFp.count, 'item');
        }
      }
    }
  } catch (err) {
    // Server offline, skip silently
  }

  try {
    // --- Poll Papan Ema (Notes) ---
    const noteRes = await fetch('/api/notes');
    if (noteRes.ok) {
      const noteJson = await noteRes.json();
      if (noteJson && noteJson.success && Array.isArray(noteJson.data)) {
        const newFp = _buildFingerprint(noteJson.data);
        if (_fingerprintChanged(_lastNotesFingerprint, newFp)) {
          serverNotesList = noteJson.data;
          _lastNotesFingerprint = newFp;
          await renderEmaNotes();
          console.log('[Auto-Refresh] Papan Ema diperbarui:', newFp.count, 'item');
        }
      }
    }
  } catch (err) {
    // Server offline, skip silently
  }
}

function startAutoRefresh() {
  stopAutoRefresh(); // Cegah duplikat interval
  if (!currentUser) return;

  // Set fingerprint awal dari data yang sudah terload
  if (serverMemoriesList) _lastMemoriesFingerprint = _buildFingerprint(serverMemoriesList);
  if (serverNotesList) _lastNotesFingerprint = _buildFingerprint(serverNotesList);

  _pollingIntervalId = setInterval(_pollForUpdates, AUTO_REFRESH_INTERVAL_MS);
  console.log('[Auto-Refresh] Polling dimulai (setiap', AUTO_REFRESH_INTERVAL_MS / 1000, 'detik)');
}

function stopAutoRefresh() {
  if (_pollingIntervalId) {
    clearInterval(_pollingIntervalId);
    _pollingIntervalId = null;
    console.log('[Auto-Refresh] Polling dihentikan');
  }
}

// Pause polling saat tab tidak aktif, lanjutkan saat aktif kembali
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    if (currentUser) startAutoRefresh();
  }
});
