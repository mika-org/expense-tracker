"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toNum } from "@/lib/money";

export async function getAccountsAction() {
  const user = await requireAuthUser();

  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      transactions: {
        where: { deletedAt: null },
        select: { type: true, amount: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return accounts.map((acc) => {
    let currentBalance = toNum(acc.openingBalance);

    for (const tx of acc.transactions) {
      const amt = toNum(tx.amount);
      if (tx.type === "income") {
        currentBalance += amt;
      } else if (tx.type === "expense") {
        currentBalance -= amt;
      } else if (tx.type === "transfer_in") {
        currentBalance += amt;
      } else if (tx.type === "transfer_out") {
        currentBalance -= amt;
      } else if (tx.type === "adjustment") {
        currentBalance += amt; // adjustment can be positive or negative
      }
    }

    return {
      id: acc.id,
      name: acc.name,
      accountType: acc.accountType,
      currency: acc.currency,
      openingBalance: toNum(acc.openingBalance),
      currentBalance,
      createdAt: acc.createdAt,
    };
  });
}

export async function createAccountAction(data: {
  name: string;
  accountType: string;
  openingBalance: number;
}) {
  const user = await requireAuthUser();

  if (!data.name.trim()) {
    return { success: false, error: "Nama akun wajib diisi." };
  }

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      accountType: data.accountType || "bank",
      openingBalance: data.openingBalance || 0,
      currency: user.currency || "IDR",
    },
  });

  revalidatePath("/", "layout");
  return { success: true, account };
}

export async function updateAccountAction(
  id: string,
  data: { name: string; accountType: string; openingBalance: number }
) {
  const user = await requireAuthUser();

  const existing = await prisma.account.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  await prisma.account.update({
    where: { id },
    data: {
      name: data.name.trim(),
      accountType: data.accountType,
      openingBalance: data.openingBalance,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAccountAction(id: string) {
  const user = await requireAuthUser();

  const txCount = await prisma.transaction.count({
    where: { accountId: id, userId: user.id, deletedAt: null },
  });

  if (txCount > 0) {
    // Soft archive as mandated by spec
    await prisma.account.update({
      where: { id },
      data: { isArchived: true },
    });
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Akun telah diarsipkan karena memiliki riwayat transaksi.",
    };
  }

  await prisma.account.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
