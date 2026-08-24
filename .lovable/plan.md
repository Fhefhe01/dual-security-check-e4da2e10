# Bikin $KOPICAT Terasa "Pump"

Tujuan: halaman terasa energik, kontras tinggi, dan langsung memancing aksi (buy/share) — tanpa mengubah fungsi yang sudah jalan (live stats, RugCheck, game).

## Arah visual yang dipakai
- Palet: **Coffee Neon** — dasar cokelat sangat gelap, aksen oranye/amber menyala, plus warna "green candle" khusus untuk angka naik.
- Tipografi tetap Bungee + Space Grotesk (sudah cocok), tapi hero dibuat jauh lebih besar dan padat.
- Intensitas animasi: tinggi tapi terkendali (tetap hormati `prefers-reduced-motion`).

## Perubahan per bagian

### 1. Hero
- Headline raksasa (sampai ~7xl di desktop) dengan aksen oranye menyala dan sedikit efek glow/stroke.
- **Angka besar di depan**: market cap / price live ditampilkan dalam ukuran display besar, dengan indikator naik/turun berwarna.
- Tombol **BUY ON PUMP.FUN** dibuat dominan: lebih besar, glow berdenyut, sedikit "shake" saat hover.
- Maskot kucing diperbesar, dengan glow radial di belakang dan gerak melayang halus.
- Background hero: gradasi radial oranye + pola grid halus + beberapa bintik cahaya.

### 2. Ticker berjalan
Marquee tipis di bawah header: `$KOPICAT • MC $x • ☕ PUMP IT • BUTT-BUTTON THEORY •` yang mengambil angka dari live stats.

### 3. Bagian statistik & bonding curve
- Kartu angka pakai efek "pop" tebal (border + hard shadow) dan angka beranimasi naik (count-up).
- Progress bonding curve: bar bergaris bergerak + label persentase besar.

### 4. Sisa halaman
- Judul section diberi label kecil bergaya "sticker" dan garis pemisah aksen.
- Kartu lore/tokenomics/meme dapat efek hover: sedikit terangkat + border menyala.
- Setiap section muncul dengan animasi masuk saat di-scroll (fade + slide pendek).
- Sticky bottom bar di mobile: tombol BUY + copy CA agar selalu terjangkau.

### 5. Mobile
Ukuran font dan padding disesuaikan supaya tetap mencolok tanpa terpotong; tombol tetap satu baris rapi.

## Catatan teknis
- Token warna baru (`--pump-up`, `--pump-down`, glow, gradient, shadow) ditambahkan di `src/styles.css` pada `:root` + `@theme inline`; komponen tetap memakai token semantik, bukan warna hardcode.
- Animasi (marquee, pulse-glow, float, reveal, striped-progress) ditulis sebagai `@utility` + `@keyframes` di `src/styles.css`, dibungkus guard `prefers-reduced-motion`.
- `src/routes/index.tsx`: perubahan hanya pada layout/presentasi — hook data (`useQuery` live stats), RugCheck, dan link tetap seperti sekarang.
- Count-up dan scroll reveal dibuat sebagai komponen kecil di `src/components/` (IntersectionObserver, tanpa dependency baru).
- Tidak ada perubahan backend, tidak ada paket baru.
