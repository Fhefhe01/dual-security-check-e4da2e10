# Dual Security Check

implementasikan file zip dan Ubah komponen src/components/RugCheck.tsx supaya menggabungkan DUA sumber data sekaligus (GoPlus Security API + RugCheck.xyz API) yang saling melengkapi, bukan menggantikan satu sama lain. Masing-masing sumber punya keahlian beda: GoPlus kuat di analisis kode kontrak (mint/freeze authority, honeypot), RugCheck.xyz kuat di analisis liquidity lock/burn khusus Solana.

ENDPOINT:

- GoPlus (sudah ada, tetap dipakai): https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses={address}

- RugCheck.xyz (baru, tambahkan): https://api.rugcheck.xyz/v1/tokens/{address}/report (GET, endpoint publik tanpa API key untuk report dasar — kalau ternyata butuh auth/return 401/403 saat testing, catat di komentar kode dan biarkan sumber ini gagal secara graceful tanpa merusak fitur, jangan block seluruh report)

ALUR FETCH:

1. Fetch KEDUA API secara bersamaan pakai Promise.allSettled (bukan berurutan/sequential), supaya kalau salah satu API lambat atau gagal, yang lain tetap bisa dipakai dan tidak saling block.

2. Simpan hasil masing-masing sumber terpisah: goPlusData (bisa null kalau gagal) dan rugCheckData (bisa null kalau gagal).

3. Kalau KEDUA sumber gagal total, baru tampilkan error message ("Couldn't reach the security APIs right now. Please try again in a moment.").

PEMBAGIAN SUMBER DATA PER JENIS PENGECEKAN (utama → cadangan kalau utama kosong/gagal):

1. Mint authority: utama GoPlus (`mintable.status === "1"`), cadangan RugCheck (`token.mintAuthority` ada isinya = masih aktif)

2. Freeze authority: utama GoPlus (`freezable.status === "1"`), cadangan RugCheck (`token.freezeAuthority` ada isinya = masih aktif)

3. Liquidity locked/burned: utama RugCheck (`markets[].lp.lpLockedPct`, atau cari item terkait di `risks[]` RugCheck untuk deskripsi lebih akurat), cadangan GoPlus (`lp_holders` — perbaiki logic-nya supaya juga mendeteksi LP yang dikirim ke burn address Solana "1nc1nerator11111111111111111111111111111111", bukan cuma field is_locked saja)

4. Top holder concentration: utama GoPlus (`holders`, top 10 dijumlahkan persennya), cadangan RugCheck (`topHolders`)

5. Holder count: utama GoPlus (`holder_count`), cadangan RugCheck (`totalHolders` atau `holderCount`)

6. Honeypot/sellability: utama GoPlus (`non_transferable`, `transfer_hook`), cadangan cari indikasi serupa di `risks[]` RugCheck (misal risk dengan nama mengandung "transfer" atau "sellable")

Kalau KEDUA sumber (utama maupun cadangan) tidak punya data untuk satu jenis pengecekan, tampilkan level "unknown" seperti behavior yang sudah ada sekarang.

OVERALL RISK LEVEL:

Jangan dirata-rata. Hitung level risk dari GoPlus (logic scoring yang sudah ada) DAN ambil skor/level dari RugCheck (`score` atau `score_normalised`, atau `rugged` boolean kalau true berarti otomatis High). Ambil yang PALING TINGGI/PALING WASPADA di antara keduanya sebagai risk level final (safety-first: kalau salah satu sumber bilang risiko tinggi, hasil akhir ikut tinggi).

TAMPILAN — BADGE SUMBER DATA:

1. JANGAN ubah struktur UI utama (pop-card, badge warna, layout grid checklist) — tetap identik seperti sekarang.

2. Di tiap item checklist (<li> pop-card berisi label, ikon, dan detail), tambahkan badge kecil di pojok kanan atas yang menunjukkan sumber data item itu. Badge ini berupa link <a> yang bisa diklik (target="_blank" rel="noopener noreferrer"), berisi:

   - Favicon kecil (16x16px) diambil dari: https://www.google.com/s2/favicons?domain={domain}&sz=32 dengan domain "gopluslabs.io" untuk item dari GoPlus, atau "rugcheck.xyz" untuk item dari RugCheck

   - Teks nama sumber kecil di sebelah favicon ("GoPlus" atau "RugCheck.xyz")

   - href mengarah ke halaman report token itu di situs asli: untuk GoPlus ke `https://gopluslabs.io/token-security/solana/{address}`, untuk RugCheck ke `https://rugcheck.xyz/tokens/{address}`

   - Styling: rounded-full, padding kecil (px-2 py-0.5), font sangat kecil (text-[10px]), warna muted (bg-secondary text-secondary-foreground), border tipis, hover:opacity-80, flex items-center gap-1, posisi absolute atau di sudut kanan atas kartu item checklist supaya tidak mengganggu layout utama

3. Update baris disclaimer paling bawah dari "Data is fetched automatically from GoPlus Security" menjadi "Data is fetched automatically from GoPlus Security and RugCheck.xyz — click the source badge on each check to verify independently."

4. Update pesan error catch block jadi "Couldn't reach the security APIs right now. Please try again in a moment."

Jangan ubah komponen atau section lain di halaman ini.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3dbb0ee9-5c21-4490-9891-055b9f1bfb57).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
