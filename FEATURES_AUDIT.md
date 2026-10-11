# Audit Fitur Expense Tracker (Web & Mobile)

Dokumen ini memetakan seluruh status cakupan fitur (*coverage*) pada platform **Next.js Web** dan **React Native Mobile**.

---

## 1. Matriks Cakupan Fitur

| Kategori Fitur | Fitur Spesifik | Status Web | Status Mobile | Catatan Implementasi |
|---|---|:---:|:---:|---|
| **Transaksi (Transactions)** | Riwayat Transaksi (List & Pagination) |  Selesai |  Selesai | Dynamic dari database melalui API & Server Actions |
| | Pencarian & Filter (Jenis, Akun, Kategori) |  Selesai |  Selesai | Query params live & filter pills dinamis |
| | Tambah Transaksi Baru (Create) |  Selesai |  Selesai | Modal "+ Catat Transaksi" aktif di web & mobile |
| | Ubah / Edit Transaksi (Update) |  Selesai |  Selesai | Modal "Ubah Transaksi" aktif di web & mobile |
| | Hapus Transaksi (Delete) |  Selesai |  Selesai | Soft-delete / hard-delete dengan konfirmasi |
| | Struk Digital (Upload & Download/View) |  Selesai |  Selesai | Penyimpanan aman di `/public/uploads/receipts` |
| **Akun & Dompet (Accounts)** | Daftar Sumber Dana & Total Saldo |  Selesai |  Selesai | Bank, Kas Tunai, E-Wallet, Tabungan |
| | Tambah Akun Baru (Create) |  Selesai |  Selesai | Form modal dengan saldo awal |
| | Ubah Nama & Detail Akun (Update) |  Selesai |  Selesai | Modal ubah nama & saldo awal akun di web & mobile |
| | Hapus / Arsipkan Akun (Delete) |  Selesai |  Selesai | Soft archive otomatis jika memiliki riwayat transaksi |
| **Kategori (Categories)** | Daftar Kategori (Pengeluaran & Pemasukan) |  Selesai |  Selesai | Pemisahan tab pengeluaran/pemasukan |
| | Tambah Kategori Baru (Create) |  Selesai |  Selesai | Dilengkapi palet pilihan warna aksen hex |
| | Hapus Kategori (Delete) |  Selesai |  Selesai | Dilengkapi dialog konfirmasi |
| | Deduplikasi Key Unik |  Selesai |  Selesai | Key compound unik mencegah warning `.$Transportasi` |
| **Anggaran (Budgets & What-If)** | Monitoring Realisasi & Limit Pos Bulanan |  Selesai |  Selesai | Progress bar & status peringatan (Aman/Mendekati/Melewati) |
| | Kalkulator Simulasi (What-If) |  Selesai |  Selesai | Model rasio 50/30/20, 60/20/20, 70/20/10 |
| | Input Kustom Basis Penghasilan Bulanan |  Selesai |  Selesai | Bebas input nominal di TextInput & tombol preset cepat |
| | Terapkan Simulasi Sebagai Anggaran Aktif |  Selesai |  Selesai | 1-klik simpan alokasi ke database anggaran aktif |
| **Target Tabungan (Savings)** | Daftar Target Finansial & Progres |  Selesai |  Selesai | Persentase terkumpul & deadline fleksibel |
| | Buat Target Baru (Create) |  Selesai |  Selesai | Modal nama, target, saldo awal, tanggal |
| | Setor Tabungan (Contribute) |  Selesai |  Selesai | Tambah saldo setoran tabungan dinamis |
| | Hapus Target Tabungan (Delete) |  Selesai |  Selesai | Tombol hapus target dengan konfirmasi di web & mobile |
| **Utang & Piutang (Debts)** | Rekap Kewajiban & Hak Tagih |  Selesai |  Selesai | Filter Utang Saya & Piutang Saya |
| | Catat Utang/Piutang Baru (Create) |  Selesai |  Selesai | Pihak, nominal, jatuh tempo, catatan |
| | Bayar Cicilan / Lunasi (Payment) |  Selesai |  Selesai | Pengurangan sisa tagihan & status otomatis lunas |
| | Hapus Catatan Utang (Delete) |  Selesai |  Selesai | Tombol hapus catatan dengan konfirmasi di web & mobile |
| **Statistik & Laporan (Reports)** | Grafik Cashflow & Breakdown Kategori |  Selesai |  Selesai | Interaksi popover & tooltip sentuh |
| | Filter Periode Waktu |  Selesai |  Selesai | Bulan ini, bulan lalu, tahun ini |
| **Akun & Keamanan (Auth)** | Autentikasi Pengguna (Login & Logout) |  Selesai |  Selesai | User aktif: Aditia M (`aditiam2311` / `hate274ever@gmail.com`) |
| | Ubah Kata Sandi (Change Password) |  Selesai |  Selesai | Validasi sandi lama & hashing bcrypt |
| | Ubah Profil Pengguna |  Selesai |  Selesai | Perubahan nama & preferensi |
| | Standar Mata Uang Rupiah (IDR) |  Selesai |  Selesai | Format `Rp ...` konsisten di seluruh layar web & mobile |

---

## 2. Status Kelengkapan (Gap Closing Summary)
Seluruh 5 item yang sebelumnya memiliki perbedaan antara Web dan Mobile kini telah **100% dilengkapi dan selaras**:
1. **Web Transaksi**: Modal **+ Catat Transaksi** dan **Ubah Transaksi** aktif dan terintegrasi langsung di tabel transaksi web.
2. **Web Akun**: Tombol **Ubah Akun** dan modal edit aktif pada setiap kartu akun.
3. **Web Anggaran**: Tombol **Terapkan Sebagai Anggaran Aktif** langsung menyimpan simulasi ke database.
4. **Web Target Tabungan**: Tombol **Hapus Target** dengan konfirmasi telah ditambahkan pada setiap kartu tabungan.
5. **Web Utang & Piutang**: Tombol **Hapus Catatan** dengan konfirmasi telah ditambahkan pada setiap kartu utang/piutang.
6. **Mobile Simulasi Keuangan**: TextInput kustom basis penghasilan per bulan (Rp) telah ditambahkan dengan perhitungan real-time.
