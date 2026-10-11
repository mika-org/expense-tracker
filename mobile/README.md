# Expense Tracker Mobile (React Native & Expo)

Aplikasi mobile React Native untuk **Expense Tracker**, dirancang presisi sesuai desain referensi fintech modern (Plum Card, Coral Accents, Grouped Transactions, dan Detail Breakdown).

---

## 🎨 Karakteristik Desain (Sesuai Referensi)

1. **Screen 1 — Discover / Home**:
   - Header **"Hello, Priscilla"** dengan tombol pencarian melingkar.
   - **Hero Outcome Card** berwarna *Deep Plum* (`#2D1836`) dengan nominal `$12,560.00` dan mini bar chart 5 bulan (bar aktif berwarna *Coral* `#F27A54`).
   - Pengelompokan transaksi berdasarkan tanggal: **"Today"**, **"08 April"**, **"07 April"**.
   - Ikon transaksi dalam wadah pastel lembut (Nike Store baju biru, Apple Store hp ungu, Uber mobil kuning).
   - Nilai pengeluaran tebal (`- $734.00`) dengan rincian pajak (`Tax: $60.35`).

2. **Screen 2 — Receipts / Detail**:
   - Tampilan nominal besar `- $734.00` dengan tombol melingkar *Edit* dan *Hapus*.
   - Kategori terpilih: **"Food & Drink"**.
   - Grafik perbandingan bulanan dengan garis batas putus-putus.
   - Horizontal chips/pills kategori: pill aktif *Deep Plum* (`#5E3D67`), pill lain berlatar putih dengan border tipis.
   - **Bottom Plum Card** melengkung (`borderTopLeftRadius: 36`) menampilkan transaksi terkait.

3. **Bottom Navigation Bar**:
   - Menu: **Discover**, **Receipts**, **Stats**, **Profile**.
   - Tombol tengah melayang berwarna **Coral** (`#F27A54`) dengan ikon scanner/tambah transaksi.

---

## 🚀 Cara Menjalankan Aplikasi Mobile

### 1. Masuk ke direktori mobile & Pasang Dependensi
```bash
cd mobile
npm install
```

### 2. Jalankan Expo Development Server
```bash
npx expo start
```

### 3. Buka di Perangkat / Simulator
- **Android Emulator**: Tekan `a` di terminal.
- **iOS Simulator (macOS)**: Tekan `i` di terminal.
- **Perangkat Fisik (HP)**: Buka aplikasi **Expo Go** (tersedia di Google Play Store & Apple App Store) dan pindai (scan) QR code yang muncul di terminal.
- **Web Browser**: Tekan `w` untuk pratinjau di browser.

---

## 📁 Struktur Folder `mobile/`

```text
mobile/
├── assets/                  # Ikon dan splash screen
├── src/
│   ├── components/
│   │   ├── BottomTabBar.tsx       # Bottom bar dengan tombol tengah coral
│   │   ├── CategoryPills.tsx      # Chips kategori horizontal
│   │   ├── Header.tsx             # "Hello, Priscilla" + search
│   │   ├── HeroOutcomeCard.tsx    # Kartu plum outcome + mini bar chart
│   │   └── TransactionRow.tsx     # Baris transaksi (Nike, Apple, Uber)
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Screen 1 dari referensi
│   │   ├── DetailScreen.tsx       # Screen 2 dari referensi
│   │   └── AddTransactionModal.tsx# Sheet modal tambah transaksi
│   ├── services/
│   │   └── api.ts                 # Koneksi ke API Next.js backend
│   ├── theme/
│   │   └── colors.ts              # Palet warna resmi (Plum, Coral, Lilac)
│   └── types/
│       └── index.ts               # Tipe data TypeScript
├── App.tsx                  # Root entry point & navigasi
├── app.json                 # Konfigurasi Expo
├── package.json
└── tsconfig.json
```
