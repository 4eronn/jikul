// ENRICHED DATA STORE FOR NIHONGO CLUB WITH AUTH ACCOUNTS & SUPER ADMIN PRIVILEGES

const AUTHORIZED_ACCOUNTS = [
  { email: "jikul@gmail.com", name: "JC", isAdmin: false },
];

const DEFAULT_PASSWORD = "112233";

const PLAYLIST_DATA = [
  {
    id: "p1",
    title: "Memories (One Piece 1st Closing)",
    artist: "Maki Otsuki",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "🎶 Chiisana koro ni wa takaramono deshita... (Dahulu kala, itu adalah harta karun...)" },
      { time: 10, text: "🎶 Natsukashii memoria... (Kenangan yang penuh kerinduan...)" },
      { time: 22, text: "🎶 Ano koro no watashi ni aitai... (Ingin rasanya bertemu diriku di masa lalu...)" },
      { time: 35, text: "🎶 Furi kaeru to itsumo anata ga ita... (Saat ku menoleh, kau selalu ada...)" },
      { time: 48, text: "🎶 Kizuna wa eien ni tsuzukuyo... (Ikatan persahabatan ini berlanjut selamanya...)" },
      { time: 65, text: "🎶 Mirai e no tobira wo akete... (Membuka pintu menuju masa depan...)" }
    ]
  },
  {
    id: "p2",
    title: "Kizuna no Kiseki (Demon Slayer)",
    artist: "MAN WITH A MISSION x milet",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "🎶 Yami wo harai tobimatsu wo kakagete... (Usir kegelapan dan kobarkan obor...)" },
      { time: 15, text: "🎶 Kizuna ga tsumugu mirai e... (Menuju masa depan yang dirajai ikatan...)" }
    ]
  },
  {
    id: "p3",
    title: "Sparkle (Your Name / Kimi no Na wa)",
    artist: "RADWIMPS",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "🎶 Mada kono sekai ni wa... (Di dunia yang masih belum kau sentuh...)" },
      { time: 15, text: "🎶 Futari no aida wo toori sugita kaze... (Angin yang berhembus di antara kita berdua...)" }
    ]
  }
];

const MEMBER_DATA = [
  {
    id: 1,
    name: "Dr. Takeshi Tanaka, M.Hum.",
    kanjiName: "田中 健先生",
    romaji: "Tanaka Sensei",
    role: "Dosen PA",
    roleBadge: "⛩️ Sensei / Pembimbing",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    favoriteAnime: "Natsume Yuujinchou",
    quote: "言語を学ぶことは、新しい魂を得ることである。",
    stats: { kanji: 99, anime: 85 },
    voiceLine: "みんな、頑張ってください！",
    badgeIcon: "⛩️ Cultural Mentor",
    instagram: "@tanaka_sensei"
  },
  {
    id: 2,
    name: "Mail",
    kanjiName: "メイル (管理者)",
    romaji: "Mail Jikul",
    role: "Pengurus",
    roleBadge: "Ketua Divisi",
    avatar: "assets/mail.jpeg",
    favoriteAnime: "One Piece / Jujutsu Kaisen",
    quote: "Kekuasaan penuh menjaga keindahan dan ketertiban kenangan Nihongo Club.",
    stats: { kanji: 95, anime: 99 },
    voiceLine: "任せてください！",
    badgeIcon: "⚡ Admin Manager",
    instagram: "@mail_jikul"
  },
  {
    id: 3,
    name: "Ilma Jikul",
    kanjiName: "イルマ",
    romaji: "Ilma",
    role: "Anggota",
    roleBadge: "🌸 Core Member",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    favoriteAnime: "Your Lie in April / K-On!",
    quote: "夢は逃げない、逃げるのはいつも自分だ。",
    stats: { kanji: 88, anime: 98 },
    voiceLine: "一緒に楽しもうね！",
    badgeIcon: "🌸 Sakura Member",
    instagram: "@ilma_jikul"
  }
];

const GALLERY_DATA = [
  {
    id: "g1",
    title: "Festival Bunkasai 2025 — Yukata Parade",
    category: "bunkasai",
    date: "2025-10-15",
    location: "Japanese Garden",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
    description: "Penampilan spektakuler rombongan Nihongo Club di Festival Budaya Bunkasai!",
    uploader: "Ilma",
    likes: 42
  },
  {
    id: "g2",
    title: "Sesi Belajar Bersama (勉強会) — Kanji N3",
    category: "belajar",
    date: "2025-04-20",
    location: "Ruang Kelas Japanese Corner",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
    description: "Diskusi seru tata bahasa (Bunpou) dan cara cepat menghafal Kanji N3.",
    uploader: "Amel",
    likes: 31
  }
];

const SUBWAY_TIMELINE = [
  {
    stationCode: "JC-01",
    stationName: "Akihabara Station (秋葉原駅)",
    date: "September 2022",
    title: "First Gathering & Welcoming New Member (ようこそ!)",
    description: "Pertemuan perdana anggota baru Nihongo Club angkatan 2022.",
    tag: "Awal Perjalanan"
  },
  {
    stationCode: "JC-02",
    stationName: "Harajuku Station (原宿駅)",
    date: "Maret 2023",
    title: "Piknik Musim Semi Hanami (お花見)",
    description: "Piknik pertama di bawah pohon sakura kampus, makan bento bersama.",
    tag: "Kebudayaan"
  }
];

const OMIKUJI_FORTUNES = [
  {
    title: "大吉 (Daikichi - Super Great Luck! 🌟)",
    quote: "Hari ini adalah hari terbaik untuk belajar Kanji baru atau mendaftar ujian JLPT!",
    luckyColor: "Sakura Pink 🌸",
    luckyItem: "Matcha Latte 🍵"
  }
];

const NOTES_DATA = [
  {
    id: "n1",
    author: "Mail (Super Admin)",
    content: "Terima kasih untuk 4 tahun yang luar biasa ini! Mari terus jaga persahabatan dan kecintaan kita pada budaya Jepang. いつまでも友達でいよう！",
    color: "rose",
    stamp: "🌸",
    date: "30 Ags 2026"
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "Apa arti dari semboyan populer bahasa Jepang '一期一会' (Ichigo Ichie)?",
    options: [
      "Setiap pertemuan adalah kesempatan berharga yang tak terulang",
      "Belajar bahasa Jepang sepanjang hayat",
      "Persahabatan sejati sekeras batu karang",
      "Pantang menyerah sebelum tujuan tercapai"
    ],
    answer: 0,
    explanation: "一期一会 (Ichigo Ichie) bermakna merayakan setiap momen pertemuan seolah-olah momen itu hanya terjadi sekali seumur hidup."
  }
];
