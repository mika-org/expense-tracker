"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getUserAction } from "@/actions/auth";
import { User, Globe, Database, KeyRound, Shield, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserAction().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwStatus({ type: "error", message: "Semua kolom kata sandi wajib diisi." });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: "error", message: "Kata sandi baru minimal 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", message: "Konfirmasi kata sandi baru tidak sesuai." });
      return;
    }

    setSubmitting(true);
    setPwStatus(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwStatus({ type: "success", message: "Kata sandi berhasil diubah!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwStatus({ type: "error", message: data.error || "Gagal mengubah kata sandi." });
      }
    } catch {
      setPwStatus({ type: "error", message: "Gagal menghubungi server." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Pengaturan Sistem"
      subtitle="Kelola preferensi akun, mata uang, dan konfigurasi aplikasi"
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-[#F27A54]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Profil Pengguna</h3>
              <p className="text-xs text-slate-400 font-medium">Informasi identitas akun aktif</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
              <input
                type="text"
                readOnly
                value={user?.name || "Aditia M"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Alamat Email</label>
              <input
                type="email"
                readOnly
                value={user?.email || "hate274ever@gmail.com"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
              <input
                type="text"
                readOnly
                value="aditiam2311"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-[#2D1836]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Ubah Kata Sandi (Password)</h3>
              <p className="text-xs text-slate-400 font-medium">Perbarui kata sandi untuk keamanan akun</p>
            </div>
          </div>

          {pwStatus && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold mb-4 ${
                pwStatus.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {pwStatus.message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Kata sandi lama"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D1836]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D1836]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D1836]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#2D1836] hover:bg-[#3D2248] text-white text-xs font-black rounded-2xl transition shadow-md shadow-purple-900/10 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Simpan Kata Sandi"}
            </button>
          </form>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-[#2D1836]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Preferensi Regional & Mata Uang</h3>
              <p className="text-xs text-slate-400 font-medium">Konfigurasi zona waktu dan format nominal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mata Uang Utama</label>
              <input
                type="text"
                readOnly
                value="IDR — Rupiah Indonesia (Rp)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Zona Waktu Default</label>
              <input
                type="text"
                readOnly
                value="Asia/Jakarta (WIB — UTC+7)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Database & Security Info */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Status Database & Arsitektur</h3>
              <p className="text-xs text-slate-400 font-medium">Kepatuhan spesifikasi teknis</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span>Database Provider</span>
              <span className="font-bold text-slate-900">PostgreSQL (Prisma 6 ORM)</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span>Presisi Nilai Mata Uang</span>
              <span className="font-bold text-slate-900">Decimal(15, 2)</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span>Standar Penamaan Kolom & Tabel</span>
              <span className="font-bold text-slate-900">snake_case</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
