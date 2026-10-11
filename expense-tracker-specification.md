# EXPENSE TRACKER — Product & Development Specification

> Dokumen kebutuhan produk dan panduan implementasi aplikasi pencatatan keuangan pribadi yang lengkap, responsif, aman, dan mudah dikembangkan.

## 1. Tujuan Aplikasi

Bangun aplikasi **Expense Tracker** untuk membantu pengguna mengelola pemasukan, pengeluaran, anggaran, tabungan, dana darurat, utang/piutang, serta memantau kondisi keuangan secara harian, mingguan, bulanan, dan tahunan.

Aplikasi harus:
- Memudahkan pencatatan transaksi dengan alur singkat.
- Menyediakan ringkasan keuangan yang mudah dipahami.
- Mendukung anggaran berdasarkan nominal maupun persentase.
- Membandingkan rencana anggaran dengan realisasi.
- Membantu pengguna mencapai target tabungan.
- Menyediakan laporan dan ekspor data.
- Nyaman digunakan di desktop, tablet, dan ponsel.
- Mengutamakan privasi dan keamanan data keuangan.

## 2. Prinsip Produk

1. **Personal-first:** fokus pada keuangan pribadi, bukan akuntansi perusahaan.
2. **Simple, not simplistic:** antarmuka bersih, fitur lengkap, alur utama tetap ringkas.
3. **Flexible budgeting:** persentase anggaran bisa diubah sesuai kebutuhan.
4. **Data transparency:** setiap angka pada dashboard dapat ditelusuri ke transaksi sumber.
5. **No fake data:** gunakan data demo hanya pada seed/development, bukan pada akun produksi.
6. **Mobile-first responsive:** transaksi mudah ditambahkan dari layar kecil.
7. **Privacy by design:** data keuangan hanya dapat diakses oleh pemiliknya.
8. **No Docker:** lingkungan pengembangan dan deployment tidak menggunakan Docker.

## 3. Teknologi yang Digunakan

### Frontend
- Next.js dengan App Router.
- TypeScript.
- Tailwind CSS.
- Komponen UI yang konsisten dan aksesibel.
- React Hook Form dan Zod untuk formulir dan validasi.
- Library grafik seperti Recharts untuk visualisasi.
- Ikon dari Lucide.

### Backend
- Next.js Route Handlers / Server Actions sesuai kebutuhan.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- Zod untuk validasi input server.
- Autentikasi menggunakan solusi yang terpelihara dan kompatibel dengan Next.js.

### Pengujian dan kualitas
- Unit test untuk fungsi perhitungan keuangan.
- Integration test untuk API dan akses data.
- End-to-end test untuk alur transaksi penting.
- ESLint dan TypeScript strict mode.

### Aturan teknis
- Jangan menggunakan Docker.
- Gunakan nama tabel dan kolom database dengan format `snake_case` dan huruf kecil.
- Gunakan `Decimal`/tipe numerik presisi untuk uang, bukan floating-point JavaScript sebagai sumber kebenaran.
- Simpan waktu dalam format yang konsisten; tanggal transaksi harus mengikuti zona waktu pengguna.
- Semua data yang berasal dari pengguna harus divalidasi di server.
- Jangan pernah mengirim secret atau kredensial database ke client.

## 4. Peran dan Autentikasi

### Peran
- **User:** mengelola seluruh data keuangan miliknya sendiri.
- **Admin sistem (opsional):** hanya untuk pemeliharaan teknis. Tidak boleh membaca data finansial pengguna tanpa dasar dan izin yang jelas.

### Fitur akun
- Registrasi dengan nama, email, dan kata sandi.
- Login dan logout.
- Verifikasi email (jika layanan email dikonfigurasi).
- Lupa/reset kata sandi dengan token sekali pakai dan kedaluwarsa.
- Pengaturan profil dan zona waktu.
- Pengaturan mata uang utama, default `IDR`.
- Hapus akun beserta data terkait melalui alur konfirmasi.
- Pengelolaan sesi dan perlindungan terhadap percobaan login berlebihan.

### Ketentuan keamanan
- Password disimpan dalam bentuk hash yang aman, tidak pernah dalam teks biasa.
- Terapkan otorisasi pada setiap query berdasarkan `user_id`.
- Cegah IDOR: jangan percaya `user_id` dari request client.
- Gunakan cookie sesi yang aman (`HttpOnly`, `Secure` di production, `SameSite` sesuai kebutuhan).
- Terapkan rate limiting pada login, reset password, dan endpoint sensitif.
- Jangan mencatat password, token, atau data transaksi sensitif ke log.
- Lindungi endpoint mutasi dari CSRF sesuai pola autentikasi yang dipakai.
- Gunakan HTTPS pada production.

## 5. Navigasi Utama

Sidebar desktop dan navigasi ringkas di perangkat mobile:

1. Dashboard
2. Transaksi
3. Anggaran
4. Kategori
5. Akun & Dompet
6. Target Tabungan
7. Utang & Piutang
8. Tagihan Berulang
9. Laporan
10. Impor & Ekspor
11. Pengaturan

Sediakan tombol aksi cepat **Tambah Transaksi** yang mudah dijangkau.

## 6. Dashboard

Dashboard harus menyediakan filter periode: hari ini, 7 hari terakhir, bulan ini, bulan sebelumnya, tahun ini, dan rentang tanggal kustom.

### Kartu ringkasan
- Total pemasukan.
- Total pengeluaran.
- Arus kas bersih (`pemasukan - pengeluaran`).
- Saldo seluruh akun.
- Sisa anggaran bulan berjalan.
- Total tabungan terhadap target.

### Visualisasi
- Grafik pemasukan vs pengeluaran per hari/minggu/bulan.
- Donut/pie pengeluaran per kategori.
- Progress anggaran per kategori.
- Tren saldo dari waktu ke waktu.
- Ringkasan pengeluaran terbesar.
- Transaksi terbaru.

### Insight
Tampilkan insight yang dapat dijelaskan dari data, misalnya:
- Kategori dengan pengeluaran tertinggi.
- Perubahan pengeluaran dibanding periode sebelumnya.
- Anggaran yang mendekati batas.
- Tagihan yang segera jatuh tempo.
- Target tabungan yang belum sesuai jadwal.

Jangan menampilkan rekomendasi seolah-olah pasti benar. Tampilkan dasar perhitungan dan rentang periode yang digunakan.

## 7. Modul Transaksi

### Jenis transaksi
- Pemasukan (`income`).
- Pengeluaran (`expense`).
- Transfer antar-akun (`transfer`).
- Penyesuaian saldo (`adjustment`), dengan konfirmasi dan jejak audit.

### Data transaksi
- Tanggal dan waktu.
- Jenis transaksi.
- Nominal.
- Akun sumber/tujuan.
- Kategori dan subkategori.
- Catatan.
- Penerima/pembayar (opsional).
- Metode pembayaran (tunai, transfer, kartu, e-wallet, lainnya).
- Tag (opsional).
- Lampiran struk (opsional).
- Status transaksi jika diperlukan.
- Waktu dibuat dan diperbarui.

### Fitur transaksi
- Tambah, lihat, edit, dan hapus transaksi.
- Duplikasi transaksi untuk input yang serupa.
- Pencarian berdasarkan catatan atau pihak terkait.
- Filter berdasarkan tanggal, jenis, kategori, akun, nominal, dan tag.
- Pengurutan berdasarkan tanggal atau nominal.
- Pagination server-side.
- Bulk select untuk ekspor atau penghapusan dengan konfirmasi.
- Soft delete atau audit trail untuk menjaga keterlacakan.
- Validasi agar nominal lebih besar dari nol, kecuali penyesuaian yang secara eksplisit mendukung nilai negatif.
- Konfirmasi sebelum menghapus transaksi.
- Lampiran dibatasi jenis dan ukuran file, dengan akses privat.

### Aturan perhitungan
- Pemasukan menambah saldo akun.
- Pengeluaran mengurangi saldo akun.
- Transfer mengurangi saldo akun sumber dan menambah saldo akun tujuan dengan nominal yang sama.
- Transfer tidak dihitung sebagai pemasukan atau pengeluaran dalam laporan total.
- Transaksi yang dibatalkan/dihapus tidak masuk agregasi.
- Hindari perhitungan ganda ketika transaksi diedit atau dihapus.

## 8. Akun & Dompet

Pengguna dapat membuat beberapa akun, contohnya:
- Tunai.
- Rekening bank.
- E-wallet.
- Kartu kredit.
- Rekening tabungan.

Data akun:
- Nama akun.
- Jenis akun.
- Saldo awal.
- Mata uang.
- Warna/ikon opsional.
- Status aktif/arsip.
- Tanggal saldo awal.

Ketentuan:
- Saldo saat ini dihitung dari saldo awal dan transaksi yang valid, atau dipelihara dengan mekanisme transaksi database yang konsisten.
- Transfer antar-akun harus atomik: kedua sisi berhasil atau keduanya gagal.
- Akun yang memiliki transaksi tidak boleh dihapus permanen tanpa alur penanganan data; sediakan arsip.
- Kartu kredit perlu ditampilkan secara jelas sebagai kewajiban/liabilitas bila fitur saldo utang kartu kredit diaktifkan.

## 9. Kategori dan Subkategori

Sediakan kategori bawaan yang dapat disesuaikan pengguna.

### Contoh kategori pengeluaran
- Makanan & Minuman
- Transportasi
- Tempat Tinggal
- Tagihan & Utilitas
- Internet & Komunikasi
- Kesehatan
- Pendidikan
- Belanja
- Hiburan
- Nongkrong
- Keluarga
- Cicilan & Utang
- Donasi
- Lainnya

### Contoh kategori pemasukan
- Gaji
- Freelance
- Bisnis
- Investasi
- Bonus
- Hadiah
- Lainnya

Fitur:
- Tambah, edit, arsip kategori.
- Subkategori opsional.
- Ikon dan warna yang netral.
- Pisahkan kategori pemasukan dan pengeluaran.
- Kategori yang telah digunakan tidak dihapus permanen; gunakan arsip.
- Pengguna dapat menetapkan kategori default untuk input cepat.

## 10. Anggaran Fleksibel

Modul anggaran merupakan fitur utama aplikasi.

### Metode anggaran
1. **Persentase pemasukan:** alokasikan pemasukan bulanan ke beberapa pos.
2. **Nominal tetap:** tetapkan batas rupiah per kategori.
3. **Hybrid:** sebagian kategori berdasarkan persentase dan sebagian berdasarkan nominal.

### Contoh alokasi awal
- Kebutuhan harian: 40%.
- Transportasi, internet, listrik, dan tagihan rutin: 20%.
- Tabungan: 25%.
- Dana darurat: 10%.
- Hiburan/nongkrong: 5%.

Persentase di atas hanya contoh awal dan harus dapat diubah pengguna kapan saja.

### Aturan anggaran
- Pengguna bisa membuat beberapa kelompok anggaran.
- Setiap anggaran memiliki periode: mingguan, bulanan, tahunan, atau rentang kustom.
- Validasi total persentase; beri peringatan jika total bukan 100%, dan izinkan simpan jika pengguna memilih mode alokasi fleksibel.
- Tentukan dengan jelas dasar persentase, misalnya total pemasukan aktual atau target pemasukan.
- Jika pemasukan berubah, hitung ulang batas kategori berbasis persentase sesuai konfigurasi.
- Anggaran kategori menampilkan batas, terpakai, sisa, dan persentase pemakaian.
- Status: aman, mendekati batas, melewati batas.
- Sediakan rollover (sisa anggaran dibawa ke periode berikutnya) sebagai opsi, default nonaktif.
- Transfer antar-akun tidak mengonsumsi anggaran.
- Pengeluaran yang dikembalikan/refund perlu memiliki aturan yang konsisten dan terdokumentasi.
- Pengguna dapat mengunci anggaran periode yang sudah ditutup agar laporan historis tidak berubah tanpa tindakan eksplisit.

### Simulasi
Sediakan kalkulator “Bagaimana jika?” untuk mencoba perubahan persentase dan melihat estimasi alokasi tanpa mengubah anggaran aktif sampai pengguna menekan Simpan.

## 11. Tabungan dan Dana Darurat

### Target tabungan
Data:
- Nama target.
- Nominal target.
- Saldo saat ini.
- Tanggal target (opsional).
- Akun tujuan (opsional).
- Prioritas dan catatan.

Fitur:
- Tambah kontribusi tabungan.
- Riwayat kontribusi.
- Progress nominal dan persentase.
- Estimasi kontribusi per bulan untuk mencapai target.
- Tandai target tercapai atau arsipkan.

### Dana darurat
- Target dapat berupa nominal tetap atau kelipatan pengeluaran wajib bulanan.
- Tampilkan saldo yang dialokasikan, target, dan kekurangan.
- Pemindahan dana ke rekening khusus dicatat sebagai transfer, bukan pengeluaran.
- Hindari menghitung dana yang sama dua kali sebagai saldo akun dan kontribusi target.

## 12. Utang dan Piutang

Data:
- Jenis: utang atau piutang.
- Nama pihak.
- Nominal awal.
- Saldo tersisa.
- Tanggal mulai.
- Jatuh tempo.
- Bunga (opsional).
- Cicilan yang direncanakan.
- Catatan dan status.

Fitur:
- Catat pembayaran/cicilan.
- Riwayat pembayaran.
- Pengingat jatuh tempo.
- Status: aktif, lunas, terlambat, diarsipkan.
- Pembayaran utang mengurangi saldo kas dan kewajiban; jangan menghitung seluruh pembayaran pokok sebagai kategori pengeluaran biasa jika sistem juga menampilkan arus kas utang. Tentukan dan dokumentasikan metode laporan agar tidak terjadi penghitungan ganda.
- Penerimaan pelunasan piutang menambah saldo kas dan mengurangi piutang.
- Bunga/biaya dapat dicatat sebagai pengeluaran terpisah.

## 13. Tagihan dan Transaksi Berulang

Dukung transaksi terjadwal seperti:
- Gaji bulanan.
- Internet.
- Listrik.
- Air.
- BPJS.
- Langganan aplikasi.
- Cicilan.

Data:
- Nama jadwal.
- Jenis transaksi.
- Nominal.
- Akun dan kategori.
- Frekuensi: harian, mingguan, bulanan, tahunan, atau kustom.
- Tanggal mulai dan berakhir.
- Tanggal jatuh tempo berikutnya.
- Pengingat.
- Status aktif/nonaktif.

Aturan:
- Jadwal tidak boleh otomatis membuat transaksi duplikat.
- Gunakan idempotency key atau identitas periode untuk setiap eksekusi.
- Jika background job belum tersedia, tampilkan transaksi yang akan datang dan sediakan tombol “Catat sebagai transaksi”.
- Jangan menganggap tagihan sudah dibayar sebelum transaksi benar-benar tercatat.

## 14. Laporan dan Analitik

### Jenis laporan
- Arus kas.
- Pemasukan per kategori.
- Pengeluaran per kategori.
- Pengeluaran per akun.
- Anggaran vs realisasi.
- Tren saldo.
- Laporan tabungan.
- Ringkasan utang/piutang.
- Rekap bulanan dan tahunan.

### Filter
- Rentang tanggal.
- Akun.
- Jenis transaksi.
- Kategori/subkategori.
- Tag.
- Metode pembayaran.

### Ekspor
- CSV untuk data transaksi dan laporan.
- XLSX opsional.
- PDF opsional untuk laporan yang siap dicetak.
- Ekspor harus mengikuti filter yang sedang aktif.
- Nama kolom, format tanggal, dan mata uang harus konsisten.
- Lindungi ekspor dari formula injection pada CSV dengan melakukan escaping nilai yang diawali karakter berbahaya seperti `=`, `+`, `-`, atau `@`.

## 15. Impor Data

- Impor transaksi dari CSV.
- Sediakan template CSV yang dapat diunduh.
- Petakan kolom sebelum impor.
- Tampilkan preview sebelum menyimpan.
- Validasi tanggal, nominal, jenis transaksi, akun, dan kategori.
- Laporkan baris gagal beserta alasannya.
- Sediakan strategi duplikasi, misalnya abaikan, impor semua, atau tandai untuk ditinjau.
- Proses impor dalam transaksi/batch yang aman.
- Jangan langsung menyimpan data sebelum pengguna menyetujui hasil preview.

## 16. Notifikasi dan Pengingat

Notifikasi di dalam aplikasi untuk:
- Anggaran mendekati/melewati batas.
- Tagihan mendekati jatuh tempo.
- Target tabungan tertinggal dari jadwal.
- Ringkasan mingguan/bulanan (opsional).

Email atau push notification bersifat opsional dan hanya aktif setelah konfigurasi layanan dan persetujuan pengguna. Berikan pengaturan frekuensi agar notifikasi tidak berlebihan.

## 17. Pengaturan

- Nama dan profil pengguna.
- Mata uang utama.
- Format angka dan tanggal.
- Zona waktu.
- Hari pertama minggu.
- Awal periode anggaran.
- Preferensi tema terang/gelap/sistem.
- Pengaturan notifikasi.
- Pengelolaan kategori default.
- Pengaturan privasi dan ekspor data.
- Hapus akun dan data.

### Tema dan tampilan
- Sediakan light mode dan dark mode.
- Simpan preferensi tema pada profil atau penyimpanan yang sesuai.
- Gunakan warna netral dan kontras yang baik.
- Hindari border warna-warni dan efek dekoratif berlebihan.
- Gunakan bayangan kartu tipis dan konsisten.
- Gunakan whitespace yang cukup dan hierarki tipografi yang jelas.
- Jangan membuat UI yang terlihat seperti template AI generik; prioritaskan kebutuhan nyata dan pola visual yang konsisten.
- Animasi sederhana dan singkat; jangan mengganggu alur input.

## 18. UI/UX dan Responsivitas

### Layout desktop
- Sidebar yang dapat diciutkan.
- Header berisi judul halaman, filter periode, dan aksi utama.
- Dashboard menggunakan grid yang konsisten.
- Tabel transaksi dengan filter, sort, dan pagination.
- Form tambah/edit transaksi dalam drawer atau halaman khusus.

### Layout mobile
- Navigasi bawah atau menu ringkas.
- Tombol tambah transaksi mudah dijangkau.
- Form satu kolom dengan keyboard sesuai tipe input.
- Filter dalam bottom sheet/drawer.
- Tabel berubah menjadi daftar kartu transaksi yang mudah dibaca.
- Hindari horizontal scrolling pada halaman utama.
- Grafik harus tetap terbaca pada layar sempit.

### Aksesibilitas
- Kontras teks memadai.
- Semua kontrol memiliki label.
- Navigasi keyboard.
- Focus state terlihat.
- Pesan error dekat dengan input terkait.
- Jangan mengandalkan warna saja untuk menyampaikan status.
- Hormati preferensi reduced motion.

### Status antarmuka
Setiap halaman perlu memiliki:
- Loading state/skeleton.
- Empty state dengan ajakan tindakan yang jelas.
- Error state dengan pesan yang dapat dimengerti.
- Success feedback setelah mutasi.
- Konfirmasi untuk tindakan destruktif.
- Optimistic update hanya jika aman dan dapat dipulihkan.

## 19. Model Data dan Database

Gunakan PostgreSQL dan Prisma. Nama tabel dan kolom menggunakan `snake_case`, seluruhnya huruf kecil.

Tabel utama yang disarankan:

### `users`
- `id`
- `name`
- `email`
- `password_hash` (jika autentikasi dikelola sendiri)
- `currency`
- `timezone`
- `theme`
- `created_at`
- `updated_at`
- `deleted_at` (opsional)

### `accounts`
- `id`
- `user_id`
- `name`
- `account_type`
- `currency`
- `opening_balance`
- `opening_balance_date`
- `is_archived`
- `created_at`
- `updated_at`

### `categories`
- `id`
- `user_id` (nullable untuk kategori sistem)
- `name`
- `type` (`income` / `expense`)
- `parent_id` (nullable)
- `icon`
- `color`
- `is_default`
- `is_archived`
- `created_at`
- `updated_at`

### `transactions`
- `id`
- `user_id`
- `account_id`
- `category_id` (nullable untuk jenis tertentu)
- `type`
- `amount`
- `transaction_date`
- `description`
- `counterparty`
- `payment_method`
- `transfer_group_id` (nullable)
- `recurring_rule_id` (nullable)
- `created_at`
- `updated_at`
- `deleted_at` (nullable)

### `transaction_tags`
- `id`
- `user_id`
- `name`

### `transaction_tag_links`
- `transaction_id`
- `tag_id`

### `budgets`
- `id`
- `user_id`
- `name`
- `period_type`
- `start_date`
- `end_date`
- `allocation_method`
- `income_basis`
- `rollover_enabled`
- `is_locked`
- `created_at`
- `updated_at`

### `budget_items`
- `id`
- `budget_id`
- `category_id`
- `amount_type` (`fixed` / `percentage`)
- `amount_value`
- `sort_order`

### `savings_goals`
- `id`
- `user_id`
- `name`
- `target_amount`
- `current_amount` (atau dihitung dari kontribusi)
- `target_date`
- `account_id` (nullable)
- `status`
- `created_at`
- `updated_at`

### `savings_contributions`
- `id`
- `user_id`
- `goal_id`
- `amount`
- `contribution_date`
- `account_id` (nullable)
- `note`
- `created_at`

### `debts`
- `id`
- `user_id`
- `type` (`debt` / `receivable`)
- `counterparty`
- `initial_amount`
- `remaining_amount` (atau dihitung dari ledger pembayaran)
- `interest_rate` (nullable)
- `start_date`
- `due_date`
- `status`
- `note`
- `created_at`
- `updated_at`

### `debt_payments`
- `id`
- `user_id`
- `debt_id`
- `amount`
- `principal_amount`
- `interest_amount`
- `payment_date`
- `account_id`
- `note`
- `created_at`

### `recurring_rules`
- `id`
- `user_id`
- `name`
- `type`
- `amount`
- `account_id`
- `category_id`
- `frequency`
- `interval_value`
- `start_date`
- `end_date`
- `next_due_date`
- `reminder_days_before`
- `is_active`
- `created_at`
- `updated_at`

### `attachments`
- `id`
- `user_id`
- `transaction_id`
- `storage_key`
- `original_filename`
- `mime_type`
- `size_bytes`
- `created_at`

### `notifications`
- `id`
- `user_id`
- `type`
- `title`
- `message`
- `read_at`
- `created_at`

### `import_jobs`
- `id`
- `user_id`
- `status`
- `file_name`
- `total_rows`
- `success_rows`
- `failed_rows`
- `error_report_key` (nullable)
- `created_at`
- `finished_at`

### `audit_logs` (opsional)
- `id`
- `user_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata` (JSON terbatas, jangan simpan rahasia)
- `created_at`

### Ketentuan database
- Gunakan UUID atau ID yang tidak mudah ditebak.
- Tambahkan foreign key dan index yang sesuai.
- Index yang umumnya diperlukan: `(user_id, transaction_date)`, `(user_id, type)`, `(user_id, category_id)`, `(user_id, account_id)`, serta kolom filter laporan.
- Gunakan constraint untuk nilai enum/validasi yang dapat ditegakkan database.
- Gunakan transaksi database untuk transfer, pembayaran utang, dan mutasi multi-tabel.
- Hindari menyimpan saldo duplikat tanpa strategi konsistensi yang jelas.
- Tentukan strategi penghapusan dan arsip untuk data yang saling terhubung.
- Semua query harus membatasi data sesuai user yang terautentikasi.

## 20. API / Server Actions

Pilih pola API yang konsisten. Contoh endpoint REST bila menggunakan Route Handlers:

### Autentikasi
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Dashboard dan laporan
- `GET /api/dashboard/summary`
- `GET /api/reports/cash-flow`
- `GET /api/reports/categories`
- `GET /api/reports/budget-vs-actual`

### Transaksi
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/transfer`

### Akun dan kategori
- CRUD `/api/accounts`
- CRUD `/api/categories`

### Anggaran
- CRUD `/api/budgets`
- CRUD `/api/budgets/:id/items`
- `POST /api/budgets/:id/simulate`

### Tabungan, utang, dan jadwal
- CRUD `/api/savings-goals`
- CRUD `/api/debts`
- CRUD `/api/recurring-rules`
- `POST /api/debts/:id/payments`

### Impor/ekspor
- `POST /api/imports/preview`
- `POST /api/imports/commit`
- `GET /api/exports/transactions`
- `GET /api/exports/report`

### Standar API
- Validasi input dan query parameter dengan schema.
- Gunakan HTTP status code yang sesuai.
- Format error konsisten, tanpa membocorkan stack trace.
- Terapkan pagination dan batas ukuran request.
- Periksa ownership setiap resource.
- Mutasi penting mendukung idempotency bila relevan.
- Dokumentasikan request, response, validasi, dan error.
- Gunakan agregasi database untuk laporan besar, bukan mengambil seluruh transaksi ke client.

## 21. Perhitungan Keuangan yang Wajib Konsisten

Buat fungsi domain terpisah dan unit test untuk seluruh perhitungan berikut:

- Total pemasukan pada periode.
- Total pengeluaran pada periode.
- Arus kas bersih.
- Saldo per akun dan total saldo.
- Realisasi anggaran per kategori.
- Persentase pemakaian anggaran.
- Alokasi berdasarkan persentase.
- Progress dan estimasi target tabungan.
- Saldo utang/piutang.
- Perbandingan dengan periode sebelumnya.

### Definisi dasar
- **Arus kas bersih** = pemasukan − pengeluaran.
- **Sisa anggaran** = batas anggaran − realisasi pengeluaran yang masuk kategori/periode tersebut.
- **Pemakaian anggaran (%)** = realisasi ÷ batas anggaran × 100%; jika batas nol, tampilkan `—` dan jangan membagi nol.
- **Alokasi persentase** = basis pemasukan yang dipilih × persentase / 100.
- Transfer antar-akun tidak mengubah total kekayaan bersih kas dan tidak termasuk pemasukan/pengeluaran.
- Tentukan kebijakan pembulatan rupiah secara konsisten; selisih pembulatan harus ditangani secara deterministik.
- Transaksi bertanggal di masa depan tidak boleh masuk laporan historis sebelum tanggalnya, kecuali laporan khusus proyeksi.
- Seluruh filter tanggal menggunakan zona waktu pengguna dengan batas awal/akhir yang jelas.

## 22. Struktur Folder yang Disarankan

```text
src/
  app/
    (auth)/
      login/
      register/
      forgot-password/
    (dashboard)/
      dashboard/
      transactions/
      budgets/
      categories/
      accounts/
      savings/
      debts/
      recurring/
      reports/
      settings/
    api/
  components/
    ui/
    layout/
    dashboard/
    transactions/
    budgets/
    reports/
  features/
    auth/
    transactions/
    budgets/
    accounts/
    categories/
    savings/
    debts/
    recurring/
    reports/
  lib/
    auth/
    db/
    validations/
    money/
    dates/
    exports/
  server/
    services/
    repositories/
  types/
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/
  integration/
  e2e/
```

Struktur dapat disesuaikan, tetapi logika perhitungan uang harus dipisahkan dari komponen UI.

## 23. Environment Variables

Buat `.env.example` tanpa kredensial asli, misalnya:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/expense_tracker"
AUTH_SECRET="replace-with-a-long-random-secret"
APP_URL="http://localhost:3000"
```

Tambahkan variabel email/storage hanya jika fitur terkait digunakan. Validasi environment saat aplikasi dijalankan. Jangan commit `.env` ke Git.

## 24. Seed dan Data Awal

Sediakan seed development untuk:
- Kategori pemasukan dan pengeluaran default.
- Contoh anggaran persentase yang dapat diedit.
- Akun contoh.
- Transaksi demo yang jelas ditandai sebagai data demo.

Jangan membuat data demo otomatis pada akun produksi. Seed harus aman dijalankan berulang kali tanpa membuat duplikasi.

## 25. Pengujian Wajib

### Unit test
- Perhitungan saldo.
- Perhitungan persentase anggaran.
- Perhitungan sisa anggaran.
- Transfer antar-akun.
- Penghitungan transaksi berdasarkan zona waktu.
- Pembulatan nominal.
- Perhitungan cicilan dan target tabungan.

### Integration test
- User tidak dapat membaca transaksi milik user lain.
- Transfer berhasil atau rollback secara utuh.
- Edit/hapus transaksi memperbarui laporan dengan benar.
- Impor menolak data invalid dan menangani duplikasi.
- Ekspor hanya berisi data milik user yang sedang login.

### End-to-end test
- Registrasi/login.
- Tambah pemasukan dan pengeluaran.
- Buat anggaran dan lihat realisasinya.
- Transfer antar-akun.
- Buat target tabungan.
- Filter laporan dan ekspor CSV.
- Tampilan mobile untuk tambah transaksi.

## 26. Kinerja dan Reliabilitas

- Gunakan pagination untuk daftar panjang.
- Tambahkan index berdasarkan pola query nyata.
- Hindari N+1 query.
- Agregasi laporan di database.
- Gunakan cache hanya untuk data yang aman dan dengan invalidasi yang jelas.
- Tangani error database dan koneksi dengan baik.
- Sediakan health endpoint yang tidak membocorkan detail internal.
- Gunakan backup PostgreSQL berkala dan uji proses restore.
- Simpan lampiran di lokasi privat; jangan menyajikan file pribadi melalui folder publik tanpa otorisasi.
- Tetapkan batas ukuran file dan request.
- Pantau error dan waktu respons tanpa merekam informasi finansial sensitif.

## 27. Deployment Production

Target deployment Linux/Ubuntu tanpa Docker.

Checklist:
- Siapkan Node.js versi LTS yang kompatibel dengan Next.js.
- Siapkan PostgreSQL dan database khusus aplikasi.
- Konfigurasi `.env` di server dengan permission terbatas.
- Jalankan instalasi dependency dan build production.
- Jalankan migrasi Prisma melalui proses deployment terkontrol.
- Jalankan aplikasi menggunakan process manager seperti PM2 atau service manager.
- Konfigurasikan Nginx reverse proxy.
- Aktifkan HTTPS.
- Konfigurasikan batas upload yang sesuai bila lampiran diaktifkan.
- Atur backup database, rotasi log, dan pemantauan.
- Jangan menjalankan development server di production.
- Jangan menggunakan `prisma db push` sebagai pengganti migrasi terkontrol di production.
- Uji rollback dan pemulihan sebelum rilis besar.

## 28. Tahapan Implementasi

### Fase 1 — Fondasi
- Setup Next.js, TypeScript, Tailwind, Prisma, PostgreSQL.
- Autentikasi dan proteksi halaman.
- Schema database dan migrasi.
- Layout responsif, tema terang/gelap, navigasi.
- Validasi input dan error handling.

### Fase 2 — Transaksi
- CRUD akun.
- CRUD kategori.
- CRUD pemasukan/pengeluaran.
- Transfer antar-akun.
- Filter, pencarian, pagination.
- Perhitungan saldo yang benar.

### Fase 3 — Dashboard dan anggaran
- Dashboard ringkasan.
- Grafik arus kas dan kategori.
- Anggaran persentase, nominal, dan hybrid.
- Progress anggaran serta simulasi alokasi.

### Fase 4 — Perencanaan keuangan
- Target tabungan dan dana darurat.
- Utang/piutang dan pembayaran.
- Tagihan berulang dan pengingat.

### Fase 5 — Laporan dan data
- Laporan dengan filter.
- Ekspor CSV.
- Impor CSV dengan preview dan validasi.
- Ekspor XLSX/PDF bila diperlukan.

### Fase 6 — Hardening dan rilis
- Unit, integration, dan E2E tests.
- Audit akses data.
- Optimasi query.
- Backup/restore test.
- Deployment staging, UAT, lalu production.

## 29. Definition of Done

Fitur dianggap selesai jika:
- Alur utama berfungsi end-to-end.
- Validasi client dan server tersedia.
- Otorisasi kepemilikan data diuji.
- Loading, empty, error, dan success state tersedia.
- Responsif pada mobile, tablet, dan desktop.
- Tidak ada data palsu di production.
- Perhitungan uang memiliki unit test.
- Aksesibilitas dasar terpenuhi.
- Dokumentasi singkat tersedia.
- Tidak ada secret di repository atau log.

## 30. Instruksi untuk AI Coding Agent

Gunakan dokumen ini sebagai spesifikasi utama implementasi.

1. Baca seluruh dokumen sebelum membuat perubahan.
2. Implementasikan bertahap berdasarkan fase; jangan membuat seluruh fitur sebagai mockup statis.
3. Bangun database, validasi, service, dan aturan bisnis sebelum menyambungkan UI.
4. Semua tombol dan formulir harus memiliki fungsi nyata; jangan meninggalkan aksi palsu atau tombol dekoratif.
5. Jangan menggunakan data hardcoded sebagai sumber dashboard produksi.
6. Gunakan komponen reusable, tetapi hindari abstraksi berlebihan.
7. Jaga desain tetap sederhana, profesional, netral, dan tidak terlihat seperti template generik.
8. Pastikan data setiap user terisolasi.
9. Tulis migration dan test untuk perubahan schema/perhitungan.
10. Jangan menggunakan Docker.
11. Jangan mengganti stack utama tanpa alasan teknis yang kuat.
12. Setelah setiap fase, jalankan lint, typecheck, test yang relevan, dan build; perbaiki error sebelum melanjutkan.
13. Jika ada detail yang belum ditentukan, pilih default yang aman, dokumentasikan keputusan, dan jangan menghambat implementasi untuk keputusan kosmetik.
14. Prioritaskan kebenaran saldo, keamanan, konsistensi transfer, dan ketepatan laporan di atas animasi atau dekorasi.

## 31. Kriteria Penerimaan Minimum

Aplikasi minimum layak digunakan apabila pengguna dapat:
- Membuat akun dan login secara aman.
- Membuat akun/dompet dan kategori.
- Mencatat pemasukan, pengeluaran, dan transfer.
- Melihat saldo yang konsisten.
- Menetapkan anggaran nominal atau persentase yang dapat diedit.
- Membandingkan anggaran dengan realisasi.
- Melihat laporan berdasarkan periode.
- Mengekspor transaksi ke CSV.
- Mengakses aplikasi dari mobile dan desktop.
- Mengubah tema terang/gelap.
- Memastikan data hanya dapat diakses oleh pemiliknya.

Fitur lain dalam dokumen dapat dirilis bertahap, tetapi tidak boleh mengorbankan keamanan dan konsistensi perhitungan keuangan.
