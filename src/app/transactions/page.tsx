"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getTransactionsAction, deleteTransactionAction } from "@/actions/transactions";
import { getAccountsAction } from "@/actions/accounts";
import { getCategoriesAction } from "@/actions/categories";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/dates";
import {
  Search,
  Trash2,
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
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="Hapus Transaksi"
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
    </AppShell>
  );
}
