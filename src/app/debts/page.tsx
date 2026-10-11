"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getDebtsAction, createDebtAction, payDebtAction } from "@/actions/debts";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/dates";
import { Plus, CheckCircle2, Clock, Calendar, X, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "debt" | "receivable">("all");
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);

  // New Debt Form
  const [type, setType] = useState<"debt" | "receivable">("debt");
  const [counterparty, setCounterparty] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  // Pay Form
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadDebts() {
    setLoading(true);
    getDebtsAction().then((res) => {
      setDebts(res);
      setLoading(false);
    });
  }

  useEffect(() => {
    setStartDate(new Date().toISOString().slice(0, 10));
    loadDebts();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const amt = parseFloat(initialAmount.replace(/[^0-9]/g, "")) || 0;

    await createDebtAction({
      type,
      counterparty,
      initialAmount: amt,
      startDate,
      dueDate: dueDate || undefined,
      note,
    });

    setCounterparty("");
    setInitialAmount("");
    setNote("");
    setDueDate("");
    setIsNewDebtOpen(false);
    setSubmitting(false);
    loadDebts();
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDebt) return;
    setSubmitting(true);
    const amt = parseFloat(payAmount.replace(/[^0-9]/g, "")) || 0;

    await payDebtAction({
      debtId: selectedDebt.id,
      amount: amt,
      note: payNote,
    });

    setPayAmount("");
    setPayNote("");
    setSelectedDebt(null);
    setSubmitting(false);
    loadDebts();
  }

  const filteredDebts = debts.filter((d) => (activeTab === "all" ? true : d.type === activeTab));

  return (
    <AppShell
      title="Buku Utang & Piutang"
      subtitle="Pantau kewajiban dan piutang agar tidak terlupakan"
      onRefresh={loadDebts}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "all"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab("debt")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "debt"
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Utang (Kewajiban)
          </button>
          <button
            onClick={() => setActiveTab("receivable")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "receivable"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Piutang (Hak Tagih)
          </button>
        </div>

        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Catat Utang/Piutang
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDebts.map((item) => {
          const isDebt = item.type === "debt";
          const isPaid = item.status === "paid" || item.remainingAmount <= 0;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                      isDebt
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    }`}
                  >
                    {isDebt ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    {isDebt ? "Utang Saya" : "Piutang Saya"}
                  </span>

                  {isPaid ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Lunas
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Aktif
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 mb-0.5">{item.counterparty}</h3>
                {item.note && <p className="text-xs text-slate-400 font-medium mb-3">{item.note}</p>}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 my-3">
                  <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Sisa Saldo:</span>
                  <div
                    className={`text-2xl font-black ${
                      isPaid ? "text-slate-400 line-through" : isDebt ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {formatRupiah(item.remainingAmount)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    Nominal Awal: {formatRupiah(item.initialAmount)}
                  </div>
                </div>

                {item.dueDate && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Jatuh tempo: {formatDateIndo(item.dueDate)}
                  </div>
                )}
              </div>

              {!isPaid && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedDebt(item)}
                    className="w-full py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl transition-colors border border-slate-200/60"
                  >
                    Catat Pembayaran Cicilan
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredDebts.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Tidak ada data utang/piutang pada kategori ini.
          </div>
        )}
      </div>

      {/* New Debt Modal */}
      {isNewDebtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Catat Utang / Piutang</h3>
              <button
                onClick={() => setIsNewDebtOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/70 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType("debt")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    type === "debt" ? "bg-[#2D1836] text-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Utang (Kewajiban)
                </button>
                <button
                  type="button"
                  onClick={() => setType("receivable")}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    type === "receivable" ? "bg-[#2D1836] text-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Piutang (Hak Tagih)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Pihak / Orang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, Bank BCA"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="1000000"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jatuh Tempo (Opsional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Pinjaman darurat motor..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDebtOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                Pembayaran: {selectedDebt.counterparty}
              </h3>
              <button
                onClick={() => setSelectedDebt(null)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                Sisa yang harus diselesaikan:{" "}
                <strong className="text-slate-900 font-black">
                  {formatRupiah(selectedDebt.remainingAmount)}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Pembayaran (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="500000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Cicilan bulan Oktober..."
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDebt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting ? "Memproses..." : "Konfirmasi Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
