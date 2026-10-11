"use client";

import { useState, useEffect } from "react";
import { Plus, X, ArrowRightLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { createTransactionAction, createTransferAction } from "@/actions/transactions";
import { getAccountsAction } from "@/actions/accounts";
import { getCategoriesAction } from "@/actions/categories";
import { formatRupiah } from "@/lib/money";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [tab, setTab] = useState<"expense" | "income" | "transfer">("expense");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [counterparty, setCounterparty] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().slice(0, 10));
      getAccountsAction().then((accs) => {
        setAccounts(accs);
        if (accs.length > 0) {
          setAccountId(accs[0].id);
          if (accs.length > 1) setToAccountId(accs[1].id);
        }
      });
      getCategoriesAction().then((cats) => {
        setCategories(cats);
        const filtered = cats.filter((c) => c.type === (tab === "transfer" ? "expense" : tab));
        if (filtered.length > 0) setCategoryId(filtered[0].id);
      });
      setError(null);
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (tab === "income" ? "income" : "expense"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Masukkan nominal yang valid.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "transfer") {
        if (!accountId || !toAccountId || accountId === toAccountId) {
          setError("Pilih akun asal dan akun tujuan yang berbeda.");
          setLoading(false);
          return;
        }
        const res = await createTransferAction({
          fromAccountId: accountId,
          toAccountId,
          amount: parsedAmount,
          transactionDate: date,
          description,
        });
        if (!res.success) throw new Error(res.error || "Gagal transfer");
      } else {
        const res = await createTransactionAction({
          accountId,
          categoryId: categoryId || undefined,
          type: tab,
          amount: parsedAmount,
          transactionDate: date,
          description,
          counterparty,
        });
        if (!res.success) throw new Error(res.error || "Gagal menyimpan");
      }

      setAmount("");
      setDescription("");
      setCounterparty("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const rawNum = parseFloat(amount.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[32px] shadow-2xl p-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#F27A54]" />
            Tambah Transaksi Baru
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 p-1.5 my-4 bg-slate-100/70 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab("expense")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "expense"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-[#F27A54]" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setTab("income")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "income"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setTab("transfer")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "transfer"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            Transfer
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal (Rp)</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F27A54]/40"
              />
              {rawNum > 0 && (
                <div className="text-xs text-slate-500 mt-1 pl-1 font-mono">
                  Terbaca: {formatRupiah(rawNum)}
                </div>
              )}
            </div>
          </div>

          {/* Account selections */}
          {tab === "transfer" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Dari Akun</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ke Akun</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Akun / Dompet</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
                >
                  <option value="">(Pilih Kategori)</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date & Merchant/Counterparty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Toko / Pihak (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Nike Store, Apple"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan / Deskripsi</label>
            <input
              type="text"
              placeholder="Keterangan pengeluaran..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D1836]/30"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#F27A54] hover:bg-[#e06b46] rounded-2xl shadow-lg shadow-[#F27A54]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
