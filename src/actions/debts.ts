"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toNum } from "@/lib/money";

export async function getDebtsAction() {
  const user = await requireAuthUser();

  const debts = await prisma.debt.findMany({
    where: { userId: user.id },
    include: {
      payments: {
        orderBy: { paymentDate: "desc" },
        take: 50,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return debts.map((d) => ({
    id: d.id,
    type: d.type, // 'debt' (utang kita) or 'receivable' (piutang ke orang lain)
    counterparty: d.counterparty,
    initialAmount: toNum(d.initialAmount),
    remainingAmount: toNum(d.remainingAmount),
    startDate: d.startDate,
    dueDate: d.dueDate,
    status: d.status,
    note: d.note,
    payments: d.payments.map((p) => ({
      id: p.id,
      amount: toNum(p.amount),
      date: p.paymentDate,
      note: p.note,
    })),
  }));
}

export async function createDebtAction(data: {
  type: "debt" | "receivable";
  counterparty: string;
  initialAmount: number;
  startDate?: string;
  dueDate?: string;
  note?: string;
}) {
  const user = await requireAuthUser();

  if (!data.counterparty.trim() || data.initialAmount <= 0) {
    return { success: false, error: "Nama pihak dan nominal harus valid." };
  }

  const debt = await prisma.debt.create({
    data: {
      userId: user.id,
      type: data.type,
      counterparty: data.counterparty.trim(),
      initialAmount: data.initialAmount,
      remainingAmount: data.initialAmount,
      startDate: new Date(data.startDate || new Date()),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      note: data.note?.trim() || null,
      status: "active",
    },
  });

  revalidatePath("/", "layout");
  return { success: true, debt };
}

export async function payDebtAction(data: {
  debtId: string;
  amount: number;
  accountId?: string;
  note?: string;
  paymentDate?: string;
}) {
  const user = await requireAuthUser();

  if (!data.debtId || data.amount <= 0) {
    return { success: false, error: "Nominal pembayaran harus lebih besar dari 0." };
  }

  const debt = await prisma.debt.findFirst({
    where: { id: data.debtId, userId: user.id },
  });

  if (!debt) {
    return { success: false, error: "Data utang/piutang tidak ditemukan." };
  }

  const remaining = Math.max(0, toNum(debt.remainingAmount) - data.amount);
  const status = remaining <= 0 ? "paid" : "active";
  const payDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

  await prisma.$transaction([
    prisma.debtPayment.create({
      data: {
        userId: user.id,
        debtId: data.debtId,
        amount: data.amount,
        principalAmount: data.amount,
        interestAmount: 0,
        paymentDate: payDate,
        accountId: data.accountId || null,
        note: data.note || "Pembayaran cicilan",
      },
    }),
    prisma.debt.update({
      where: { id: data.debtId },
      data: {
        remainingAmount: remaining,
        status,
      },
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteDebtAction(id: string) {
  const user = await requireAuthUser();

  await prisma.debtPayment.deleteMany({
    where: { debtId: id, userId: user.id },
  });

  await prisma.debt.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
