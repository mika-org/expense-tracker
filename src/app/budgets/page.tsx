"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getActiveBudgetAction, saveBudgetAction } from "@/actions/budgets";
import { getCategoriesAction } from "@/actions/categories";
import { formatRupiah } from "@/lib/money";
import {
  PieChart,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function BudgetsPage() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Simulation calculator state
  const [simIncome, setSimIncome] = useState(15000000);
  const [simNeeds, setSimNeeds] = useState(50);
  const [simWants, setSimWants] = useState(30);
  const [simSavings, setSimSavings] = useState(20);

  useEffect(() => {
    getActiveBudgetAction().then((b) => {
      setBudget(b);
      if (b?.incomeBasis) setSimIncome(b.incomeBasis);
      setLoading(false);
    });
  }, []);

  const totalSimPct = simNeeds + simWants + simSavings;

  async function handleApplySimulation() {
    setApplying(true);
    try {
      const cats = await getCategoriesAction();
      const expenseCats = cats.filter((c: any) => c.type === "expense");
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const items = expenseCats.slice(0, 6).map((c: any, idx: number) => {
        const pct = idx === 0 ? 30 : idx === 1 ? 25 : idx === 2 ? 20 : 15;
        const val = Math.round((simIncome * pct) / 100);
        return {
          categoryId: c.id,
          amountType: "fixed" as const,
          amountValue: val,
        };
      });

      if (items.length === 0) {
        alert("Tidak ada kategori pengeluaran ditemukan.");
        return;
      }

      await saveBudgetAction({
        name: `Anggaran ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
        startDate: startOfMonth,
        endDate: endOfMonth,
        allocationMethod: "hybrid",
        incomeBasis: simIncome,
        items,
      });

      const updated = await getActiveBudgetAction();
      setBudget(updated);
      alert("Simulasi berhasil diterapkan sebagai anggaran aktif!");
    } catch (err: any) {
      alert(err.message || "Gagal menerapkan anggaran");
    } finally {
      setApplying(false);
    }
  }

  return (
    <AppShell
      title="Anggaran & Alokasi Keuangan"
      subtitle={budget ? budget.name : "Kelola alokasi pos anggaran"}
    >
      {/* Overall Budget Status Hero Card (Plum Card) */}
      <div className="bg-[#2D1836] text-white border border-[#3E2349] rounded-[32px] p-6 sm:p-7 mb-8 shadow-xl shadow-[#2D1836]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold text-[#F27A54] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <PieChart className="w-4 h-4" />
              Anggaran Berjalan
            </div>
            <h2 className="text-2xl font-black text-white">
              {budget?.name || "Anggaran Bulan Ini"}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Metode:{" "}
              <span className="text-white capitalize font-bold">
                {budget?.allocationMethod || "Persentase Pemasukan"}
              </span>{" "}
              • Basis: {formatRupiah(budget?.incomeBasis || 0)}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-slate-300 font-medium">Total Batas</div>
              <div className="text-base font-extrabold text-white">
                {formatRupiah(budget?.totalLimit || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Terpakai</div>
              <div className="text-base font-extrabold text-[#F27A54]">
                {formatRupiah(budget?.totalSpent || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Sisa</div>
              <div className="text-base font-extrabold text-emerald-400">
                {formatRupiah(budget?.overallRemaining || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Realisasi Keseluruhan</span>
            <span
              className={`font-black ${
                (budget?.overallPercentage || 0) >= 100
                  ? "text-rose-400"
                  : (budget?.overallPercentage || 0) >= 80
                  ? "text-[#F27A54]"
                  : "text-emerald-400"
              }`}
            >
              {budget?.overallPercentage || 0}% Terpakai
            </span>
          </div>
          <div className="w-full bg-[#1F1026] h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (budget?.overallPercentage || 0) >= 100
                  ? "bg-rose-500"
                  : (budget?.overallPercentage || 0) >= 80
                  ? "bg-[#F27A54]"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, budget?.overallPercentage || 0)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Budget Items Breakdown */}
      <div className="mb-10">
        <h3 className="text-base font-black text-slate-900 mb-4">Pos Pengeluaran & Realisasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budget?.items?.map((item: any) => {
            const isExceeded = item.status === "exceeded";
            const isWarning = item.status === "warning";

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: item.categoryColor }}
                      ></div>
                      <span className="font-bold text-slate-900 text-sm">
                        {item.categoryName}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isExceeded
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : isWarning
                          ? "bg-orange-50 text-[#F27A54] border border-orange-200"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      }`}
                    >
                      {isExceeded ? (
                        <>
                          <XCircle className="w-3 h-3" /> Melewati
                        </>
                      ) : isWarning ? (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Mendekati
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Aman
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 mb-3">
                    <div>
                      <span className="text-slate-400 block font-medium">Batas Anggaran:</span>
                      <span className="font-black text-slate-900">
                        {formatRupiah(item.limit)}
                      </span>
                      {item.amountType === "percentage" && (
                        <span className="text-[10px] text-slate-400 block">
                          ({item.amountValue}% pemasukan)
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Realisasi:</span>
                      <span className="font-black text-[#F27A54]">
                        {formatRupiah(item.spent)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Remaining */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">
                      Sisa:{" "}
                      <strong
                        className={item.remaining >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}
                      >
                        {formatRupiah(item.remaining)}
                      </strong>
                    </span>
                    <span className="text-slate-700">{item.percentageText}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-[#F27A54]"
                          : "bg-[#2D1836]"
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Simulation "Bagaimana Jika?" Section */}
      <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-orange-50 text-[#F27A54]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Kalkulator Simulasi: &ldquo;Bagaimana Jika?&rdquo;
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Uji coba perubahan persentase dan estimasi alokasi tanpa mengubah anggaran aktif.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Basis Estimasi Pemasukan (Rp)
              </label>
              <input
                type="number"
                value={simIncome}
                onChange={(e) => setSimIncome(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 font-bold"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600">Kebutuhan Hidup (Needs):</span>
                <span className="text-[#2D1836] font-bold">{simNeeds}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simNeeds}
                onChange={(e) => setSimNeeds(Number(e.target.value))}
                className="w-full accent-[#2D1836]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600">Keinginan & Hiburan (Wants):</span>
                <span className="text-[#F27A54] font-bold">{simWants}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simWants}
                onChange={(e) => setSimWants(Number(e.target.value))}
                className="w-full accent-[#F27A54]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600">Tabungan & Investasi (Savings):</span>
                <span className="text-emerald-600 font-bold">{simSavings}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simSavings}
                onChange={(e) => setSimSavings(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="pt-2 text-xs">
              <span className="text-slate-500 font-semibold">Total Alokasi: </span>
              <strong
                className={totalSimPct === 100 ? "text-emerald-600" : "text-[#F27A54]"}
              >
                {totalSimPct}%
              </strong>
            </div>
          </div>

          {/* Projection Preview */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#2D1836] font-black block mb-1">
                  Kebutuhan ({simNeeds}%)
                </span>
                <span className="text-xs text-slate-400 font-medium">Makanan, kos, tagihan</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-4">
                {formatRupiah((simIncome * simNeeds) / 100)}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#F27A54] font-black block mb-1">
                  Keinginan ({simWants}%)
                </span>
                <span className="text-xs text-slate-400 font-medium">Nongkrong, belanja</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-4">
                {formatRupiah((simIncome * simWants) / 100)}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-emerald-600 font-black block mb-1">
                  Tabungan ({simSavings}%)
                </span>
                <span className="text-xs text-slate-400 font-medium">Dana darurat & investasi</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-4">
                {formatRupiah((simIncome * simSavings) / 100)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Ingin menggunakan hasil kalkulator di atas sebagai acuan pengeluaran bulan ini?
          </p>
          <button
            onClick={handleApplySimulation}
            disabled={applying}
            className="px-5 py-2.5 bg-[#2D1836] hover:bg-[#3d2149] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F27A54]" />
            {applying ? "Menerapkan..." : "Terapkan Sebagai Anggaran Aktif"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
