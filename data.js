// ENRICHED DATA STORE FOR NIHONGO CLUB & JC CULINARY WITH AUTH ACCOUNTS & SUPER ADMIN PRIVILEGES

const AUTHORIZED_ACCOUNTS = [
  { email: "jikul@gmail.com", name: "JC Culinary", isAdmin: true },
  { email: "admin@jikul.id", name: "Mail Admin", isAdmin: true },
  { email: "ilma@jikul.id", name: "Ilma Member", isAdmin: false }
];

const DEFAULT_PASSWORD = "112233";

const PLAYLIST_DATA = [
  {
    id: "p1",
    title: "Memories (One Piece 1st Closing)",
    artist: "Maki Otsuki",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "Chiisana koro ni wa takaramono deshita... (Dahulu kala, itu adalah harta karun...)" },
      { time: 10, text: "Natsukashii memoria... (Kenangan yang penuh kerinduan...)" },
      { time: 22, text: "Ano koro no watashi ni aitai... (Ingin rasanya bertemu diriku di masa lalu...)" },
      { time: 35, text: "Furi kaeru to itsumo anata ga ita... (Saat ku menoleh, kau selalu ada...)" },
      { time: 48, text: "Kizuna wa eien ni tsuzukuyo... (Ikatan persahabatan ini berlanjut selamanya...)" },
      { time: 65, text: "Mirai e no tobira wo akete... (Membuka pintu menuju masa depan...)" }
    ]
  },
  {
    id: "p2",
    title: "Kizuna no Kiseki (Demon Slayer)",
    artist: "MAN WITH A MISSION x milet",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "Yami wo harai tobimatsu wo kakagete... (Usir kegelapan dan kobarkan obor...)" },
      { time: 15, text: "Kizuna ga tsumugu mirai e... (Menuju masa depan yang dirajai ikatan...)" }
    ]
  },
  {
    id: "p3",
    title: "Sparkle (Your Name / Kimi no Na wa)",
    artist: "RADWIMPS",
    src: "bgm.mp3",
    lyrics: [
      { time: 0, text: "Mada kono sekai ni wa... (Di dunia yang masih belum kau sentuh...)" },
      { time: 15, text: "Futari no aida wo toori sugita kaze... (Angin yang berhembus di antara kita berdua...)" }
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
    roleBadge: "Sensei / Pembimbing",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    favoriteAnime: "Natsume Yuujinchou",
    quote: "言語を学ぶことは、新しい魂を得ることである。",
    stats: { kanji: 99, anime: 85 },
    voiceLine: "みんな、頑張ってください！",
    badgeIcon: "Cultural Mentor",
    instagram: "@tanaka_sensei"
  },
  {
    id: 2,
    name: "Mail JC",
    kanjiName: "メイル (管理者)",
    romaji: "Mail JC",
    role: "Pengurus",
    roleBadge: "Ketua Divisi",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    favoriteAnime: "One Piece / Jujutsu Kaisen",
    quote: "Kekuasaan penuh menjaga keindahan dan ketertiban kenangan JC Culinary.",
    stats: { kanji: 95, anime: 99 },
    voiceLine: "任せてください！",
    badgeIcon: "Admin Manager",
    instagram: "@mail_jc"
  },
  {
    id: 3,
    name: "Ilma JC",
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
    instagram: "@ilma_jc"
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
  },
  {
    id: "g3",
    title: "JC Culinary & Japanese Food Gathering",
    category: "hangout",
    date: "2025-12-10",
    location: "JC Culinary Corner",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
    description: "Nikmatnya ramen dan takoyaki hangat buatan tim JC Culinary saat gathering akhir tahun!",
    uploader: "JC Culinary",
    likes: 58
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
  },
  {
    stationCode: "JC-03",
    stationName: "Shibuya Station (渋谷駅)",
    date: "November 2024",
    title: "JC Culinary & Cultural Night (料理祭)",
    description: "Malam kuliner khas Jepang bersama anggota dan tamu kehormatan.",
    tag: "Kuliner & Budaya"
  }
];

const OMIKUJI_FORTUNES = [
  {
    title: "七転び八起き",
    romaji: "Nanakorobi Yaoki",
    quote: "Jatuh 7 kali, bangkit 8 kali! Jangan pernah menyerah, setiap kegagalan adalah pelajaran berharga menuju keberhasilanmu.",
    luckyColor: "Semangat Pantang Menyerah",
    luckyItem: "Tekad Baja"
  },
  {
    title: "継続は力なり",
    romaji: "Keizoku wa Chikara nari",
    quote: "Konsistensi adalah kekuatan sejati! Usaha kecil yang kamu lakukan setiap hari akan menjadi hasil yang luar biasa besarnya.",
    luckyColor: "Ketekunan & Fokus",
    luckyItem: "Langkah Konsisten"
  },
  {
    title: "明日は明日の風が吹く",
    romaji: "Ashita wa Ashita no Kaze ga Fuku",
    quote: "Besok angin baru akan berhembus. Jangan biarkan kecemasan hari ini menghapus senyum dan harapan indahmu besok.",
    luckyColor: "Ketenangan Diri",
    luckyItem: "Senyuman Hangat 🌸"
  },
  {
    title: "夢は逃げない、逃げるのはいつも自分だ",
    romaji: "Yume wa nigenai, nigeru no wa itsumo jibun da",
    quote: "Impian tidak pernah lari meninggalkanmu, yang sering berlari adalah diri kita sendiri. Bangkit dan kejar impianmu!",
    luckyColor: "Keyakinan Hati",
    luckyItem: "Keberanian"
  },
  {
    title: "一歩一歩前へ",
    romaji: "Ippo Ippo Mae e",
    quote: "Langkah demi langkah terus maju. Tidak masalah seberapa lambat prosesmu, yang terpenting kamu tidak pernah berhenti.",
    luckyColor: "Progres Berkelanjutan",
    luckyItem: "Harapan Baru"
  },
  {
    title: "一期一会",
    romaji: "Ichigo Ichie",
    quote: "Setiap pertemuan dan kesempatan adalah momen berharga tak terulang. Hargai dan syukuri setiap detik dalam hidupmu.",
    luckyColor: "Rasa Syukur",
    luckyItem: "Ketulusan Hati"
  }
];

const NOTES_DATA = [
  {
    id: "n1",
    author: "Mail (Super Admin)",
    content: "Terima kasih untuk 4 tahun yang luar biasa ini! Mari terus jaga persahabatan dan kecintaan kita pada budaya Jepang. いつまでも友達でいよう！",
    color: "rose",
    date: "30 Ags 2026"
  },
  {
    id: "n2",
    author: "JC Culinary",
    content: "Selamat datang di JC Culinary! Semoga kenangan indah dan sajian penuh cinta senantiasa menyertai setiap langkah kita.",
    color: "amber",
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
  },
  {
    question: "Sistem tulisan yang dipakai untuk kata serapan asing dalam bahasa Jepang disebut?",
    options: ["Hiragana", "Katakana", "Kanji", "Romaji"],
    answer: 1,
    explanation: "Katakana khusus digunakan untuk menulis kata-kata serapan asing, nama negara asing, dan efek suara (onomatope)."
  },
  {
    question: "Level JLPT tertinggi (paling sulit) adalah?",
    options: ["N5", "N3", "N1", "N2"],
    answer: 2,
    explanation: "Semakin kecil angkanya, semakin tinggi levelnya — N1 adalah level JLPT tersulit, sedangkan N5 paling dasar."
  },
  {
    question: "Apa arti dari kata sapaan 'よろしくお願いします' (Yoroshiku Onegaishimasu)?",
    options: [
      "Selamat tinggal untuk selamanya",
      "Mohon bantuan/kerja samanya ke depan",
      "Selamat makan",
      "Maaf sudah mengganggu"
    ],
    answer: 1,
    explanation: "Ungkapan ini dipakai saat berkenalan atau memulai kerja sama, bermakna semacam 'mohon bantuannya ya'."
  },
  {
    question: "Festival budaya sekolah/kampus di Jepang biasa disebut?",
    options: ["Matsuri", "Bunkasai", "Hanami", "Omikuji"],
    answer: 1,
    explanation: "文化祭 (Bunkasai) adalah festival budaya yang biasa diadakan sekolah atau kampus di Jepang, mirip acara yang diadakan Nihongo Club."
  }
];
