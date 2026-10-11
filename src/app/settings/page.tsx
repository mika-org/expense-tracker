"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getUserAction } from "@/actions/auth";
import { User, Globe, Database } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAction().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

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
                value={user?.name || "Priscilla (Demo)"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Alamat Email</label>
              <input
                type="email"
                readOnly
                value={user?.email || "demo@expensetracker.com"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
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
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span>Lingkungan Deployment</span>
              <span className="font-bold text-slate-900">Native Node.js (No Docker)</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
