import { getApiUser, apiResponse, handleOptions } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { toNum, calculateNetCashFlow } from "@/lib/money";
import { getDateRangeFromPeriod, PeriodFilter } from "@/lib/dates";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return apiResponse({ error: "Unauthorized" }, 401);
  }

  const { searchParams } = new URL(request.url);
  const periodParam = (searchParams.get("period") || "this_month") as PeriodFilter;
  const { start, end, label } = getDateRangeFromPeriod(periodParam);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      transactionDate: { gte: start, lte: end },
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = new Map<string, { name: string; type: string; color: string; amount: number }>();

  for (const tx of transactions) {
    const amt = toNum(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
    }
    const catName = tx.category?.name || "Lainnya";
    const catColor = tx.category?.color || (tx.type === "income" ? "#10B981" : "#F27A54");
    const key = `${catName}-${tx.type}`;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { name: catName, type: tx.type, color: catColor, amount: 0 });
    }
    categoryMap.get(key)!.amount += amt;
  }

  const allCategories = Array.from(categoryMap.values()).map((c) => {
    const baseTotal = c.type === "income" ? totalIncome : totalExpense;
    return {
      name: c.name,
      type: c.type,
      color: c.color,
      amount: c.amount,
      pct: baseTotal > 0 ? Math.round((c.amount / baseTotal) * 100) : 0,
    };
  }).sort((a, b) => b.amount - a.amount);

  const categoryBreakdown = allCategories.filter((c) => c.type === "expense");

  return apiResponse({
    period: periodParam,
    periodLabel: label,
    totalIncome,
    totalExpense,
    netCashFlow: calculateNetCashFlow(totalIncome, totalExpense),
    categoryBreakdown,
    categories: allCategories,
  });
}
