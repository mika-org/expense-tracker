"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getReportsDataAction, exportTransactionsCsvAction } from "@/actions/reports";
import { PeriodFilter } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { Download, TrendingUp, TrendingDown, Scale } from "lucide-react";

const periods: { key: PeriodFilter; label: string }[] = [
  { key: "this_month", label: "Bulan Ini" },
  { key: "last_month", label: "Bulan Lalu" },
  { key: "this_year", label: "Tahun Ini" },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("this_month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReportsDataAction(period).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [period]);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const csv = await exportTransactionsCsvAction(period);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `laporan-transaksi-${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppShell
      title="Laporan & Ekspor Data (Stats)"
      subtitle={`Ringkasan buku besar keuangan: ${data?.periodLabel || "Memuat..."}`}
    >
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                period === p.key
                  ? "bg-[#2D1836] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Mengekspor..." : "Ekspor Transaksi (CSV)"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>TOTAL PEMASUKAN</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatRupiah(data?.totalIncome || 0)}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>TOTAL PENGELUARAN</span>
            <TrendingDown className="w-4 h-4 text-[#F27A54]" />
          </div>
          <div className="text-2xl font-black text-[#F27A54]">
            {formatRupiah(data?.totalExpense || 0)}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>SURPLUS / DEFISIT ARUS KAS</span>
            <Scale className="w-4 h-4 text-teal-500" />
          </div>
          <div
            className={`text-2xl font-black ${
              (data?.netCashFlow || 0) >= 0 ? "text-teal-600" : "text-rose-600"
            }`}
          >
            {formatRupiah(data?.netCashFlow || 0)}
          </div>
        </div>
      </div>

      {/* Categories Aggregate Table */}
      <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">Rincian Akumulasi Per Kategori</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Nama Kategori</th>
                <th className="px-5 py-4">Jenis</th>
                <th className="px-5 py-4 text-right">Total Akumulasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.categories?.map((cat: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    {cat.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        cat.type === "income"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-black text-slate-900">
                    {formatRupiah(cat.total)}
                  </td>
                </tr>
              ))}

              {(!data?.categories || data.categories.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-slate-400">
                    Belum ada data untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
