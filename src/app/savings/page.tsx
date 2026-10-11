"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  getSavingsGoalsAction,
  createSavingsGoalAction,
  contributeSavingsAction,
  deleteSavingsGoalAction,
} from "@/actions/savings";
import { formatRupiah } from "@/lib/money";
import { formatDateIndo } from "@/lib/dates";
import { PiggyBank, Plus, CheckCircle2, Calendar, Trash2, X } from "lucide-react";

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // New Goal Form
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadGoals() {
    setLoading(true);
    getSavingsGoalsAction().then((res) => {
      setGoals(res);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const target = parseFloat(targetAmount.replace(/[^0-9]/g, "")) || 0;
    const initial = parseFloat(initialAmount.replace(/[^0-9]/g, "")) || 0;

    await createSavingsGoalAction({
      name,
      targetAmount: target,
      initialAmount: initial,
      targetDate: targetDate || undefined,
    });

    setName("");
    setTargetAmount("");
    setInitialAmount("0");
    setTargetDate("");
    setIsNewGoalOpen(false);
    setSubmitting(false);
    loadGoals();
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGoal) return;
    setSubmitting(true);
    const amt = parseFloat(depositAmount.replace(/[^0-9]/g, "")) || 0;

    await contributeSavingsAction({
      goalId: selectedGoal.id,
      amount: amt,
      note: depositNote,
    });

    setDepositAmount("");
    setDepositNote("");
    setSelectedGoal(null);
    setSubmitting(false);
    loadGoals();
  }

  async function handleDeleteGoal(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus target tabungan ini?")) {
      await deleteSavingsGoalAction(id);
      loadGoals();
    }
  }

  return (
    <AppShell
      title="Target Tabungan & Dana Darurat"
      subtitle="Capai kebebasan finansial dengan perencanaan terukur"
      onRefresh={loadGoals}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rencana Tabungan</span>
          <h2 className="text-xl font-black text-slate-900">
            {goals.length} Target Aktif
          </h2>
        </div>

        <button
          onClick={() => setIsNewGoalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Buat Target Baru
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const isDone = goal.percentage >= 100;

          return (
            <div
              key={goal.id}
              className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tercapai
                      </span>
                    ) : (
                      <span className="text-xs font-black text-[#F27A54]">
                        {goal.percentage}%
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Hapus Target"
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1">{goal.name}</h3>
                {goal.targetDate && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-4 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Target: {formatDateIndo(goal.targetDate)}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? "bg-emerald-500" : "bg-[#2D1836]"
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-black text-slate-900">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                    <span className="text-slate-400 font-medium">
                      Target: {formatRupiah(goal.targetAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedGoal(goal)}
                  className="w-full py-2.5 px-3 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Setor Tabungan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isNewGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Target Tabungan Baru</h3>
              <button
                onClick={() => setIsNewGoalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Target</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Laptop Baru, DP Rumah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Target (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="10000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Saldo Awal Terkumpul</label>
                <input
                  type="text"
                  placeholder="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Selesai (Opsional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewGoalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting ? "Menyimpan..." : "Simpan Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Contribution Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                Setor ke: {selectedGoal.name}
              </h3>
              <button
                onClick={() => setSelectedGoal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nominal Setoran (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="500000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Setoran gaji bulan ini..."
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting ? "Memproses..." : "Konfirmasi Setoran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
