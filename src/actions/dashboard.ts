"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { getDateRangeFromPeriod, PeriodFilter } from "@/lib/dates";
import { toNum, calculateNetCashFlow } from "@/lib/money";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export async function getDashboardDataAction(period: PeriodFilter = "this_month") {
  const user = await requireAuthUser();
  const { start, end, label } = getDateRangeFromPeriod(period);

  // 1. Transactions in period (excluding transfers from income/expense totals)
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      transactionDate: { gte: start, lte: end },
    },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true } },
      account: { select: { id: true, name: true } },
    },
    orderBy: { transactionDate: "desc" },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryExpenseMap = new Map<string, { name: string; color: string; amount: number }>();
  const dailyCashFlowMap = new Map<string, { date: string; income: number; expense: number }>();

  for (const tx of transactions) {
    const amt = toNum(tx.amount);
    const dayKey = format(tx.transactionDate, "dd MMM", { locale: id });

    if (!dailyCashFlowMap.has(dayKey)) {
      dailyCashFlowMap.set(dayKey, { date: dayKey, income: 0, expense: 0 });
    }
    const dayStat = dailyCashFlowMap.get(dayKey)!;

    if (tx.type === "income") {
      totalIncome += amt;
      dayStat.income += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
      dayStat.expense += amt;

      const catName = tx.category?.name || "Lainnya";
      const catColor = tx.category?.color || "#64748B";
      if (!categoryExpenseMap.has(catName)) {
        categoryExpenseMap.set(catName, { name: catName, color: catColor, amount: 0 });
      }
      categoryExpenseMap.get(catName)!.amount += amt;
    }
  }

  const netCashFlow = calculateNetCashFlow(totalIncome, totalExpense);

  // 2. Total Current Balance across all active accounts
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      transactions: {
        where: { deletedAt: null },
        select: { type: true, amount: true },
      },
    },
  });

  let totalAccountBalance = 0;
  for (const acc of accounts) {
    let bal = toNum(acc.openingBalance);
    for (const tx of acc.transactions) {
      const amt = toNum(tx.amount);
      if (tx.type === "income" || tx.type === "transfer_in" || tx.type === "adjustment") {
        bal += amt;
      } else if (tx.type === "expense" || tx.type === "transfer_out") {
        bal -= amt;
      }
    }
    totalAccountBalance += bal;
  }

  // 3. Active budget remaining
  const activeBudget = await prisma.budget.findFirst({
    where: {
      userId: user.id,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      items: true,
    },
  });

  let budgetRemaining = 0;
  let budgetTotalLimit = 0;
  if (activeBudget) {
    const incomeBasis = toNum(activeBudget.incomeBasis);
    for (const item of activeBudget.items) {
      if (item.amountType === "percentage") {
        budgetTotalLimit += Math.round((incomeBasis * toNum(item.amountValue)) / 100);
      } else {
        budgetTotalLimit += toNum(item.amountValue);
      }
    }
    budgetRemaining = Math.max(0, budgetTotalLimit - totalExpense);
  }

  // 4. Savings Progress
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId: user.id, status: "active" },
  });
  let totalSavingsCurrent = 0;
  let totalSavingsTarget = 0;
  for (const g of savingsGoals) {
    totalSavingsCurrent += toNum(g.currentAmount);
    totalSavingsTarget += toNum(g.targetAmount);
  }

  // 5. Category breakdown array sorted by highest expense
  const categoryBreakdown = Array.from(categoryExpenseMap.values()).sort(
    (a, b) => b.amount - a.amount
  );

  // 6. Timeline chart data
  const cashFlowTimeline = Array.from(dailyCashFlowMap.values());

  // 7. Recent 5 transactions
  const recentTransactions = transactions.slice(0, 6).map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: toNum(tx.amount),
    description: tx.description || tx.category?.name || "Transaksi",
    categoryName: tx.category?.name || "Umum",
    categoryColor: tx.category?.color || "#64748B",
    accountName: tx.account.name,
    date: tx.transactionDate,
  }));

  // 8. Generated Financial Insights
  const topCategory = categoryBreakdown[0];
  const insights: string[] = [];
  if (topCategory && totalExpense > 0) {
    const pct = Math.round((topCategory.amount / totalExpense) * 100);
    insights.push(`Pengeluaran terbesar ada pada ${topCategory.name} (${pct}% dari total).`);
  }
  if (netCashFlow > 0) {
    insights.push(`Arus kas positif. Anda berhasil menyisihkan surplus pada periode ini.`);
  } else if (netCashFlow < 0) {
    insights.push(`Pengeluaran melampaui pemasukan. Periksa kembali anggaran belanja.`);
  }
  if (budgetTotalLimit > 0) {
    const usedPct = Math.round((totalExpense / budgetTotalLimit) * 100);
    if (usedPct >= 90) {
      insights.push(`Perhatian: Anggaran belanja sudah terpakai ${usedPct}%.`);
    } else {
      insights.push(`Pemakaian anggaran berjalan aman pada ${usedPct}%.`);
    }
  }

  return {
    periodLabel: label,
    summary: {
      totalIncome,
      totalExpense,
      netCashFlow,
      totalAccountBalance,
      budgetRemaining,
      budgetTotalLimit,
      totalSavingsCurrent,
      totalSavingsTarget,
      savingsPercentage:
        totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0,
    },
    categoryBreakdown,
    cashFlowTimeline,
    recentTransactions,
    insights,
  };
}
