import { getApiUser, apiResponse, handleOptions } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { toNum, calculateNetCashFlow } from "@/lib/money";
import { startOfMonth, endOfMonth } from "date-fns";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return apiResponse({ error: "Unauthorized" }, 401);
  }

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

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
  const categoryMap = new Map<string, { name: string; color: string; amount: number }>();

  for (const tx of transactions) {
    const amt = toNum(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
      const catName = tx.category?.name || "Lainnya";
      const catColor = tx.category?.color || "#F27A54";
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { name: catName, color: catColor, amount: 0 });
      }
      categoryMap.get(catName)!.amount += amt;
    }
  }

  const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
    ...c,
    pct: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0,
  }));

  return apiResponse({
    period: "this_month",
    totalIncome,
    totalExpense,
    netCashFlow: calculateNetCashFlow(totalIncome, totalExpense),
    categoryBreakdown,
  });
}
