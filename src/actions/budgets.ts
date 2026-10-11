"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toNum, calculateBudgetUsage, calculatePercentageAllocation } from "@/lib/money";

export async function getActiveBudgetAction() {
  const user = await requireAuthUser();
  const now = new Date();

  // Find active budget covering now
  let budget = await prisma.budget.findFirst({
    where: {
      userId: user.id,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      items: {
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!budget) {
    // Fallback to most recent budget
    budget = await prisma.budget.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            category: { select: { id: true, name: true, icon: true, color: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!budget) {
    return null;
  }

  // Calculate actual spending in each budget category within the budget date range
  const categorySpendings = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: user.id,
      type: "expense",
      deletedAt: null,
      categoryId: { not: null },
      transactionDate: {
        gte: budget.startDate,
        lte: budget.endDate,
      },
    },
    _sum: { amount: true },
  });

  const spendMap = new Map<string, number>();
  for (const s of categorySpendings) {
    if (s.categoryId) {
      spendMap.set(s.categoryId, toNum(s._sum.amount));
    }
  }

  const incomeBasis = toNum(budget.incomeBasis);

  const items = budget.items.map((item) => {
    const spent = spendMap.get(item.categoryId) || 0;
    let limit = 0;

    if (item.amountType === "percentage") {
      limit = calculatePercentageAllocation(incomeBasis, toNum(item.amountValue));
    } else {
      limit = toNum(item.amountValue);
    }

    const usage = calculateBudgetUsage(spent, limit);

    return {
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      categoryIcon: item.category.icon || "Tag",
      categoryColor: item.category.color || "#3B82F6",
      amountType: item.amountType,
      amountValue: toNum(item.amountValue),
      limit,
      spent,
      remaining: usage.remaining,
      percentage: usage.percentage,
      percentageText: usage.percentageText,
      status: usage.status,
    };
  });

  const totalLimit = items.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = items.reduce((acc, curr) => acc + curr.spent, 0);
  const overallUsage = calculateBudgetUsage(totalSpent, totalLimit);

  return {
    id: budget.id,
    name: budget.name,
    periodType: budget.periodType,
    startDate: budget.startDate,
    endDate: budget.endDate,
    allocationMethod: budget.allocationMethod,
    incomeBasis,
    rolloverEnabled: budget.rolloverEnabled,
    isLocked: budget.isLocked,
    items,
    totalLimit,
    totalSpent,
    overallRemaining: overallUsage.remaining,
    overallPercentage: overallUsage.percentage,
    overallStatus: overallUsage.status,
  };
}

export async function saveBudgetAction(data: {
  name: string;
  startDate: string;
  endDate: string;
  allocationMethod: "percentage" | "fixed" | "hybrid";
  incomeBasis: number;
  items: {
    categoryId: string;
    amountType: "percentage" | "fixed";
    amountValue: number;
  }[];
}) {
  const user = await requireAuthUser();

  if (!data.name.trim()) {
    return { success: false, error: "Nama anggaran wajib diisi." };
  }

  const budget = await prisma.budget.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      allocationMethod: data.allocationMethod,
      incomeBasis: data.incomeBasis,
      items: {
        create: data.items.map((item, idx) => ({
          categoryId: item.categoryId,
          amountType: item.amountType,
          amountValue: item.amountValue,
          sortOrder: idx,
        })),
      },
    },
  });

  revalidatePath("/", "layout");
  return { success: true, budget };
}

export async function simulateBudgetAction(
  incomeBasis: number,
  allocations: { categoryId: string; percentage: number }[]
) {
  return allocations.map((a) => {
    const allocated = calculatePercentageAllocation(incomeBasis, a.percentage);
    return {
      categoryId: a.categoryId,
      percentage: a.percentage,
      allocatedAmount: allocated,
    };
  });
}

export async function addBudgetItemAction(data: {
  budgetId?: string;
  categoryId: string;
  amountType?: "percentage" | "fixed";
  amountValue: number;
}) {
  const user = await requireAuthUser();

  if (!data.categoryId) {
    return { success: false, error: "Kategori wajib dipilih." };
  }
  if (!data.amountValue || data.amountValue <= 0) {
    return { success: false, error: "Batas anggaran harus lebih besar dari 0." };
  }

  let budgetId = data.budgetId;
  if (!budgetId) {
    const now = new Date();
    let activeBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeBudget) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      activeBudget = await prisma.budget.create({
        data: {
          userId: user.id,
          name: `Anggaran ${monthNames[now.getMonth()]} ${now.getFullYear()}`,
          startDate: startOfMonth,
          endDate: endOfMonth,
          allocationMethod: "fixed",
          incomeBasis: 0,
        },
      });
    }
    budgetId = activeBudget.id;
  } else {
    const exists = await prisma.budget.findFirst({
      where: { id: budgetId, userId: user.id },
    });
    if (!exists) {
      return { success: false, error: "Anggaran tidak ditemukan." };
    }
  }

  const existingItem = await prisma.budgetItem.findUnique({
    where: {
      budgetId_categoryId: {
        budgetId,
        categoryId: data.categoryId,
      },
    },
  });

  let item;
  if (existingItem) {
    item = await prisma.budgetItem.update({
      where: { id: existingItem.id },
      data: {
        amountType: data.amountType || "fixed",
        amountValue: data.amountValue,
      },
      include: { category: true },
    });
  } else {
    item = await prisma.budgetItem.create({
      data: {
        budgetId,
        categoryId: data.categoryId,
        amountType: data.amountType || "fixed",
        amountValue: data.amountValue,
      },
      include: { category: true },
    });
  }

  revalidatePath("/", "layout");
  return { success: true, item };
}

export async function updateBudgetItemAction(
  id: string,
  data: {
    categoryId?: string;
    amountType?: "percentage" | "fixed";
    amountValue: number;
  }
) {
  const user = await requireAuthUser();

  const item = await prisma.budgetItem.findUnique({
    where: { id },
    include: { budget: true },
  });

  if (!item || item.budget.userId !== user.id) {
    return { success: false, error: "Pos anggaran tidak ditemukan." };
  }

  if (data.amountValue <= 0) {
    return { success: false, error: "Batas anggaran harus lebih besar dari 0." };
  }

  const updated = await prisma.budgetItem.update({
    where: { id },
    data: {
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.amountType ? { amountType: data.amountType } : {}),
      amountValue: data.amountValue,
    },
    include: { category: true },
  });

  revalidatePath("/", "layout");
  return { success: true, item: updated };
}

export async function deleteBudgetItemAction(id: string) {
  const user = await requireAuthUser();

  const item = await prisma.budgetItem.findUnique({
    where: { id },
    include: { budget: true },
  });

  if (!item || item.budget.userId !== user.id) {
    return { success: false, error: "Pos anggaran tidak ditemukan." };
  }

  await prisma.budgetItem.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
