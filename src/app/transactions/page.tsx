"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  getTransactionsAction,
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/actions/transactions";
import { getAccountsAction } from "@/actions/accounts";
import { getCategoriesAction } from "@/actions/categories";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/dates";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ShoppingBag,
  Smartphone,
  Car,
  Utensils,
  Zap,
} from "lucide-react";

function getMerchantIcon(name: string, category: string) {
  const lower = (name + " " + category).toLowerCase();
  if (lower.includes("nike") || lower.includes("baju") || lower.includes("clothing") || lower.includes("belanja")) {
    return { icon: <ShoppingBag className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50" };
  }
  if (lower.includes("apple") || lower.includes("hp") || lower.includes("elektronik") || lower.includes("internet")) {
    return { icon: <Smartphone className="w-4 h-4 text-purple-600" />, bg: "bg-purple-50" };
  }
  if (lower.includes("uber") || lower.includes("gojek") || lower.includes("grab") || lower.includes("transport")) {
    return { icon: <Car className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50" };
  }
  if (lower.includes("makan") || lower.includes("food") || lower.includes("resto") || lower.includes("kopi")) {
    return { icon: <Utensils className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" };
  }
  return { icon: <Zap className="w-4 h-4 text-[#F27A54]" />, bg: "bg-orange-50" };
}

export default function TransactionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [txDate, setTxDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [type, setType] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  function loadTransactions() {
    setLoading(true);
    getTransactionsAction({
      type,
      accountId,
      categoryId,
      search,
      page,
      limit: 15,
    }).then((res) => {
      setItems(res.items);
      setPagination(res.pagination);
      setLoading(false);
    });
  }

  useEffect(() => {
    getAccountsAction().then(setAccounts);
    getCategoriesAction().then(setCategories);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [type, accountId, categoryId, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  }

  function openCreateModal() {
    setEditingId(null);
    setTxType("expense");
    setTxAmount("");
    setTxDescription("");
    setTxAccountId(accounts[0]?.id || "");
    setTxCategoryId(categories[0]?.id || "");
    setTxDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  }

  function openEditModal(tx: any) {
    setEditingId(tx.id);
    setTxType(tx.type === "income" ? "income" : "expense");
    setTxAmount(tx.amount ? tx.amount.toString() : "");
    setTxDescription(tx.description || "");
    setTxAccountId(tx.accountId || accounts[0]?.id || "");
    setTxCategoryId(tx.categoryId || "");
    setTxDate(
      tx.transactionDate
        ? new Date(tx.transactionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setIsModalOpen(true);
  }

  async function handleSaveTransaction(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(txAmount.replace(/[^0-9.]/g, ""));
    if (!amt || amt <= 0) {
      alert("Nominal harus lebih besar dari 0");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateTransactionAction({
          id: editingId,
          type: txType,
          amount: amt,
          description: txDescription,
          accountId: txAccountId,
          categoryId: txCategoryId || undefined,
          transactionDate: txDate,
        });
        if (!res.success) throw new Error(res.error || "Gagal memperbarui transaksi");
      } else {
        const res = await createTransactionAction({
          type: txType,
          amount: amt,
          description: txDescription,
          accountId: txAccountId,
          categoryId: txCategoryId || undefined,
          transactionDate: txDate,
        });
        if (!res.success) throw new Error(res.error || "Gagal membuat transaksi");
      }

      setIsModalOpen(false);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      await deleteTransactionAction(id);
      loadTransactions();
    }
  }

  return (
    <AppShell
      title="Daftar Transaksi (Receipts)"
      subtitle={`Total ${pagination.totalCount} transaksi tercatat`}
      onRefresh={loadTransactions}
    >
      {/* Header Banner CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Pencatatan Keuangan
          </span>
          <h2 className="text-xl font-black text-slate-900">
            Semua Transaksi & Struk Digital
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Catat Transaksi Baru
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-5 mb-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan catatan atau toko..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F27A54]/40"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold bg-[#2D1836] hover:bg-[#3d2149] text-white rounded-2xl shadow-sm transition-colors"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Jenis</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Account Filter */}
          <select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Akun / Dompet</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Keterangan & Pihak</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Akun / Dompet</th>
                <th className="px-5 py-4 text-right">Nominal</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((tx) => {
                const isIncome = tx.type === "income";
                const isExpense = tx.type === "expense";
                const icon = getMerchantIcon(tx.description, tx.categoryName);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                      {formatDateIndo(tx.transactionDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${icon.bg}`}>
                          {icon.icon}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {tx.description || tx.categoryName}
                          </div>
                          {tx.counterparty && (
                            <div className="text-[11px] text-slate-400 font-medium">{tx.counterparty}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tx.categoryColor }}
                        ></span>
                        {tx.categoryName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-semibold">
                      {tx.accountName}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-black text-sm">
                      <span
                        className={
                          isIncome
                            ? "text-emerald-600"
                            : isExpense
                            ? "text-slate-900"
                            : "text-blue-600"
                        }
                      >
                        {isIncome ? "+" : isExpense ? "-" : ""}
                        {formatRupiah(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          title="Ubah Transaksi"
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          title="Hapus Transaksi"
                          className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Halaman {pagination.page} dari {pagination.totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingId ? "Ubah Transaksi" : "Catat Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTxType("expense")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txType === "expense"
                      ? "bg-[#F27A54] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("income")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txType === "income"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-base text-slate-900 font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Keterangan / Nama Toko
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Janji Jiwa, Makan Siang"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Akun Sumber</label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                  <select
                    value={txCategoryId}
                    onChange={(e) => setTxCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="">Tanpa Kategori</option>
                    {categories
                      .filter((c) => c.type === txType)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-800 font-semibold"
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
                  className="px-5 py-2.5 bg-[#2D1836] hover:bg-[#3d2149] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#2D1836]/20"
                >
                  {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Catat Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
