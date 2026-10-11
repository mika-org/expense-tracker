"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toNum } from "@/lib/money";

export async function getSavingsGoalsAction() {
  const user = await requireAuthUser();

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    include: {
      account: { select: { name: true } },
      contributions: {
        orderBy: { contributionDate: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => {
    const target = toNum(g.targetAmount);
    const current = toNum(g.currentAmount);
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remaining = Math.max(0, target - current);

    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      targetDate: g.targetDate,
      accountName: g.account?.name || null,
      status: g.status,
      percentage,
      remaining,
      contributions: g.contributions.map((c) => ({
        id: c.id,
        amount: toNum(c.amount),
        date: c.contributionDate,
        note: c.note,
      })),
    };
  });
}

export async function createSavingsGoalAction(data: {
  name: string;
  targetAmount: number;
  initialAmount?: number;
  targetDate?: string;
  accountId?: string;
}) {
  const user = await requireAuthUser();

  if (!data.name.trim() || data.targetAmount <= 0) {
    return { success: false, error: "Nama dan target nominal wajib diisi valid." };
  }

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      currentAmount: data.initialAmount || 0,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      accountId: data.accountId || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, goal };
}

export async function contributeSavingsAction(data: {
  goalId: string;
  amount: number;
  note?: string;
  accountId?: string;
}) {
  const user = await requireAuthUser();

  if (!data.goalId || data.amount <= 0) {
    return { success: false, error: "Nominal kontribusi harus lebih dari 0." };
  }

  const goal = await prisma.savingsGoal.findFirst({
    where: { id: data.goalId, userId: user.id },
  });

  if (!goal) {
    return { success: false, error: "Target tabungan tidak ditemukan." };
  }

  await prisma.$transaction([
    prisma.savingsContribution.create({
      data: {
        userId: user.id,
        goalId: data.goalId,
        amount: data.amount,
        note: data.note || "Setoran tabungan",
        accountId: data.accountId || goal.accountId || null,
      },
    }),
    prisma.savingsGoal.update({
      where: { id: data.goalId },
      data: {
        currentAmount: {
          increment: data.amount,
        },
      },
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}
