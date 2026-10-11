"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getDashboardDataAction } from "@/actions/dashboard";
import { PeriodFilter } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Wallet,
  PiggyBank,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Car,
  Utensils,
  Coffee,
  Zap,
  Edit2,
  Trash2,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

// Helper for merchant icons matching the reference image (Nike Store shirt, Apple phone, Uber car)
function getMerchantIcon(name: string, category: string) {
  const lower = (name + " " + category).toLowerCase();
  if (lower.includes("nike") || lower.includes("baju") || lower.includes("clothing") || lower.includes("belanja")) {
    return {
      icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    };
  }
  if (lower.includes("apple") || lower.includes("hp") || lower.includes("elektronik") || lower.includes("internet") || lower.includes("wifi")) {
    return {
      icon: <Smartphone className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
    };
  }
  if (lower.includes("uber") || lower.includes("gojek") || lower.includes("grab") || lower.includes("transport")) {
    return {
      icon: <Car className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50",
    };
  }
  if (lower.includes("kopi") || lower.includes("coffee") || lower.includes("nongkrong")) {
    return {
      icon: <Coffee className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
    };
  }
  if (lower.includes("makan") || lower.includes("food") || lower.includes("resto")) {
    return {
      icon: <Utensils className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50",
    };
  }
  return {
    icon: <Zap className="w-5 h-5 text-indigo-500" />,
    bg: "bg-indigo-50",
  };
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>("this_month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("Semua");

  useEffect(() => {
    setLoading(true);
    getDashboardDataAction(period).then((res) => {
      setData(res);
      if (res?.recentTransactions?.length > 0) {
        setSelectedTx(res.recentTransactions[0]);
      }
      setLoading(false);
    });
  }, [period]);

  const summary = data?.summary;

  // Mini Chart data for the plum Outcome card (Aug, Oct, Dec, Feb, Apr format from image)
  const miniBarData = [
    { month: "Aug", amount: 6200, active: false },
    { month: "Oct", amount: 8900, active: false },
    { month: "Dec", amount: 7400, active: false },
    { month: "Feb", amount: 9800, active: false },
    { month: "Apr", amount: summary?.totalExpense || 12560, active: true },
  ];

  const categoryPills = ["Semua", "Makanan & Minuman", "Belanja", "Transportasi", "Tagihan & Utilitas", "Nongkrong & Kopi"];

  const filteredTransactions = data?.recentTransactions?.filter((tx: any) => {
    if (activeCategoryFilter === "Semua") return true;
    return tx.categoryName.toLowerCase().includes(activeCategoryFilter.toLowerCase());
  }) || [];

  return (
    <AppShell
      title="Expense Tracker"
      subtitle="Kelola dan pantau arus keuangan harian Anda"
      userName="Priscilla"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Screen 1 from Reference (Outcome Card + Grouped Transactions) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Deep Plum / Aubergine Outcome Card (Matching reference card) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2D1836] via-[#331C3E] to-[#25122D] text-white rounded-[32px] p-6 sm:p-7 shadow-xl shadow-[#2D1836]/20">
            {/* Subtle moon / orb decorative watermark in top right */}
            <div className="absolute top-5 right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 pointer-events-none"></div>

            <div className="relative z-10">
              <span className="text-xs font-semibold tracking-wider text-slate-300 block mb-1">
                Outcome
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                {formatRupiah(summary?.totalExpense || 12560000)}
              </div>

              {/* Mini Bar Chart inside the Card */}
              <div className="pt-2">
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miniBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="month"
                        stroke="#9C8CA5"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[6, 6, 6, 6]}
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          const fillColor = payload.active ? "#F27A54" : "#4A2E55";
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width > 24 ? 24 : width}
                              height={height}
                              rx={6}
                              fill={fillColor}
                            />
                          );
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar (Income, Balance, Net Cash) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 block">Pemasukan</span>
              <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
                {formatRupiah(summary?.totalIncome || 0)}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 block">Total Saldo Kas</span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                {formatRupiah(summary?.totalAccountBalance || 0)}
              </span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 block">Arus Kas Bersih</span>
              <span className="text-sm font-extrabold text-teal-600 block mt-0.5">
                {formatRupiah(summary?.netCashFlow || 0)}
              </span>
            </div>
          </div>

          {/* 2. Grouped Transactions Section (Today, 08 April, etc.) */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Riwayat Pengeluaran</h2>
              <span className="text-xs font-semibold text-slate-400">
                {filteredTransactions.length} Transaksi
              </span>
            </div>

            {/* Date Group 1: Hari Ini / Today */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                Hari Ini
              </span>

              <div className="space-y-2">
                {filteredTransactions.slice(0, 2).map((tx: any) => {
                  const merchant = getMerchantIcon(tx.description, tx.categoryName);
                  const isSelected = selectedTx?.id === tx.id;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-100/90 ring-1 ring-slate-300"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${merchant.bg}`}
                        >
                          {merchant.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {tx.description || tx.categoryName}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {tx.categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 block">
                          - {formatRupiah(tx.amount)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {tx.accountName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Group 2: Kemarin / Tanggal Sebelumnya */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                Kemarin & Sebelumnya
              </span>

              <div className="space-y-2">
                {filteredTransactions.slice(2, 6).map((tx: any) => {
                  const merchant = getMerchantIcon(tx.description, tx.categoryName);
                  const isSelected = selectedTx?.id === tx.id;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-100/90 ring-1 ring-slate-300"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${merchant.bg}`}
                        >
                          {merchant.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {tx.description || tx.categoryName}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {tx.categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 block">
                          - {formatRupiah(tx.amount)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {tx.accountName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Screen 2 from Reference (Detail Card + Category Pills + Dark Card) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Top Detail Card with Edit/Delete Actions */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  - {formatRupiah(selectedTx?.amount || 734000)}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">
                  {selectedTx?.categoryName || "Food & Drink"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTx?.description || "Belanja Harian"} • April 2026
                </p>
              </div>

              {/* Action Buttons (Pencil and Trash) */}
              <div className="flex items-center gap-1.5">
                <button
                  title="Edit Transaksi"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Hapus"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Comparison Trend Line / Bars */}
            <div className="h-24 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { m: "Aug", val: 320 },
                    { m: "Oct", val: 540 },
                    { m: "Dec", val: 410 },
                    { m: "Feb", val: 680 },
                    { m: "Apr", val: 890, active: true },
                  ]}
                >
                  <XAxis dataKey="m" stroke="#B0A8B9" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar
                    dataKey="val"
                    radius={[4, 4, 4, 4]}
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      const fillColor = payload.active ? "#F27A54" : "#E2DEE8";
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width > 20 ? 20 : width}
                          height={height}
                          rx={4}
                          fill={fillColor}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoryPills.map((pill) => {
                const isActive = activeCategoryFilter === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => setActiveCategoryFilter(pill)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#5E3D67] text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Aubergine Container Card (Exact match of bottom card in reference Screen 2) */}
          <div className="bg-[#2D1836] text-white rounded-[32px] p-6 shadow-xl shadow-[#2D1836]/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Rincian Kategori Terpilih
              </span>
              <span className="text-xs text-[#F27A54] font-semibold">
                {activeCategoryFilter}
              </span>
            </div>

            <div className="space-y-3">
              {filteredTransactions.slice(0, 3).map((item: any) => {
                const merchant = getMerchantIcon(item.description, item.categoryName);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                        {merchant.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {item.description || item.categoryName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {item.categoryName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        - {formatRupiah(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.accountName}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tidak ada transaksi pada kategori ini.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
