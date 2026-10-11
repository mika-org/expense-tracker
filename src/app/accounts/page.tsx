"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  getAccountsAction,
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/actions/accounts";
import { formatRupiah } from "@/lib/money";
import {
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("bank");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadAccounts() {
    setLoading(true);
    getAccountsAction().then((accs) => {
      setAccounts(accs);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setName("");
    setAccountType("bank");
    setOpeningBalance("0");
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(acc: any) {
    setEditingId(acc.id);
    setName(acc.name);
    setAccountType(acc.accountType || "bank");
    setOpeningBalance(acc.openingBalance ? acc.openingBalance.toString() : "0");
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const bal = parseFloat(openingBalance.replace(/[^0-9]/g, "")) || 0;
      if (editingId) {
        const res = await updateAccountAction(editingId, {
          name,
          accountType,
          openingBalance: bal,
        });
        if (!res.success) throw new Error(res.error || "Gagal memperbarui akun");
      } else {
        const res = await createAccountAction({
          name,
          accountType,
          openingBalance: bal,
        });
        if (!res.success) throw new Error(res.error || "Gagal membuat akun");
      }

      setName("");
      setOpeningBalance("0");
      setEditingId(null);
      setIsModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus / mengarsipkan akun ini?")) {
      await deleteAccountAction(id);
      loadAccounts();
    }
  }

  function getAccountIcon(type: string) {
    switch (type) {
      case "bank":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "ewallet":
        return <Smartphone className="w-5 h-5 text-[#F27A54]" />;
      case "credit_card":
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case "savings":
        return <PiggyBank className="w-5 h-5 text-amber-500" />;
      default:
        return <Wallet className="w-5 h-5 text-emerald-500" />;
    }
  }

  const totalAllBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  return (
    <AppShell
      title="Akun & Dompet Keuangan"
      subtitle="Kelola rekening bank, uang tunai, e-wallet, dan sumber dana Anda"
      onRefresh={loadAccounts}
    >
      {/* Total Balance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-7 bg-white border border-slate-200/80 rounded-[32px] mb-8 shadow-sm">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            Total Kekayaan Kas Tersedia
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {formatRupiah(totalAllBalance)}
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Tambah Akun Baru
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {getAccountIcon(acc.accountType)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{acc.name}</h3>
                  <span className="text-xs text-slate-400 capitalize font-medium">
                    {acc.accountType === "bank"
                      ? "Rekening Bank"
                      : acc.accountType === "ewallet"
                      ? "Dompet Digital"
                      : acc.accountType === "savings"
                      ? "Tabungan Khusus"
                      : "Uang Tunai"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(acc)}
                  title="Ubah Akun"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  title="Hapus / Arsipkan"
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Saldo Terkini:</span>
              <div className="text-xl font-black text-slate-900">
                {formatRupiah(acc.currentBalance)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Saldo awal: {formatRupiah(acc.openingBalance)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingId ? "Ubah Akun / Dompet" : "Tambah Akun / Dompet Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rekening Mandiri, DANA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Jenis Akun</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold"
                >
                  <option value="bank">Rekening Bank</option>
                  <option value="cash">Uang Tunai (Cash)</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="savings">Tabungan / Investasi</option>
                  <option value="credit_card">Kartu Kredit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
