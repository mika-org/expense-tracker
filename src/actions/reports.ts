"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { getDateRangeFromPeriod, PeriodFilter, formatDateTimeIndo } from "@/lib/dates";
import { toNum, formatRupiah } from "@/lib/money";
import { generateCsv } from "@/lib/csv";

export async function getReportsDataAction(period: PeriodFilter = "this_month") {
  const user = await requireAuthUser();
  const { start, end, label } = getDateRangeFromPeriod(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      transactionDate: { gte: start, lte: end },
    },
    include: {
      category: { select: { name: true, color: true } },
      account: { select: { name: true } },
    },
    orderBy: { transactionDate: "asc" },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySummary: { [key: string]: { name: string; type: string; total: number; color: string } } = {};

  for (const tx of transactions) {
    const amt = toNum(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
    }

    const catKey = tx.category?.name || "Tanpa Kategori";
    if (!categorySummary[catKey]) {
      categorySummary[catKey] = {
        name: catKey,
        type: tx.type,
        total: 0,
        color: tx.category?.color || "#64748B",
      };
    }
    categorySummary[catKey].total += amt;
  }

  return {
    periodLabel: label,
    totalIncome,
    totalExpense,
    netCashFlow: totalIncome - totalExpense,
    totalTransactions: transactions.length,
    categories: Object.values(categorySummary).sort((a, b) => b.total - a.total),
  };
}

export async function exportTransactionsCsvAction(period: PeriodFilter = "this_month") {
  const user = await requireAuthUser();
  const { start, end } = getDateRangeFromPeriod(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      transactionDate: { gte: start, lte: end },
    },
    include: {
      category: { select: { name: true } },
      account: { select: { name: true } },
    },
    orderBy: { transactionDate: "asc" },
  });

  const headers = [
    "Tanggal & Waktu",
    "Jenis Transaksi",
    "Akun / Dompet",
    "Kategori",
    "Nominal",
    "Keterangan",
    "Pihak Terkait",
  ];

  const rows = transactions.map((tx) => [
    formatDateTimeIndo(tx.transactionDate),
    tx.type,
    tx.account.name,
    tx.category?.name || "-",
    toNum(tx.amount),
    tx.description || "-",
    tx.counterparty || "-",
  ]);

  return generateCsv(headers, rows);
}
