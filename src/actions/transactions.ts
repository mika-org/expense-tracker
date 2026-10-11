"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toNum } from "@/lib/money";
import { randomUUID } from "crypto";

export interface TransactionFilterParams {
  type?: string;
  accountId?: string;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getTransactionsAction(params: TransactionFilterParams = {}) {
  const user = await requireAuthUser();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {
    userId: user.id,
    deletedAt: null,
  };

  if (params.type && params.type !== "all") {
    if (params.type === "transfer") {
      where.type = { in: ["transfer", "transfer_out", "transfer_in"] };
    } else {
      where.type = params.type;
    }
  }

  if (params.accountId && params.accountId !== "all") {
    where.accountId = params.accountId;
  }

  if (params.categoryId && params.categoryId !== "all") {
    where.categoryId = params.categoryId;
  }

  if (params.search && params.search.trim()) {
    where.OR = [
      { description: { contains: params.search.trim(), mode: "insensitive" } },
      { counterparty: { contains: params.search.trim(), mode: "insensitive" } },
    ];
  }

  if (params.startDate || params.endDate) {
    where.transactionDate = {};
    if (params.startDate) where.transactionDate.gte = new Date(params.startDate);
    if (params.endDate) where.transactionDate.lte = new Date(params.endDate);
  }

  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, accountType: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { transactionDate: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: transactions.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      accountName: tx.account.name,
      categoryId: tx.categoryId,
      categoryName: tx.category?.name || "Tanpa Kategori",
      categoryIcon: tx.category?.icon || "Tag",
      categoryColor: tx.category?.color || "#64748B",
      type: tx.type,
      amount: toNum(tx.amount),
      transactionDate: tx.transactionDate,
      description: tx.description || "",
      counterparty: tx.counterparty || "",
      transferGroupId: tx.transferGroupId,
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function createTransactionAction(data: {
  accountId: string;
  categoryId?: string;
  type: "income" | "expense" | "adjustment";
  amount: number;
  transactionDate: string;
  description?: string;
  counterparty?: string;
  paymentMethod?: string;
}) {
  const user = await requireAuthUser();

  if (!data.accountId) {
    return { success: false, error: "Pilih akun/dompet." };
  }

  if (!data.amount || data.amount <= 0) {
    return { success: false, error: "Nominal harus lebih besar dari 0." };
  }

  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      type: data.type,
      amount: data.amount,
      transactionDate: new Date(data.transactionDate || new Date()),
      description: data.description?.trim() || null,
      counterparty: data.counterparty?.trim() || null,
      paymentMethod: data.paymentMethod || null,
    },
  });

  revalidatePath("/", "layout");
  return { success: true, transaction: tx };
}

export async function createTransferAction(data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transactionDate: string;
  description?: string;
}) {
  const user = await requireAuthUser();

  if (!data.fromAccountId || !data.toAccountId) {
    return { success: false, error: "Pilih akun asal dan akun tujuan." };
  }

  if (data.fromAccountId === data.toAccountId) {
    return { success: false, error: "Akun asal dan akun tujuan tidak boleh sama." };
  }

  if (!data.amount || data.amount <= 0) {
    return { success: false, error: "Nominal transfer harus lebih besar dari 0." };
  }

  const transferGroupId = randomUUID();
  const date = new Date(data.transactionDate || new Date());
  const desc = data.description?.trim() || "Transfer Antar Akun";

  // Atomic database transaction
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: data.fromAccountId,
        type: "transfer_out",
        amount: data.amount,
        transactionDate: date,
        description: `${desc} (Keluar)`,
        transferGroupId,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: data.toAccountId,
        type: "transfer_in",
        amount: data.amount,
        transactionDate: date,
        description: `${desc} (Masuk)`,
        transferGroupId,
      },
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteTransactionAction(id: string) {
  const user = await requireAuthUser();

  const tx = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });

  if (!tx) {
    return { success: false, error: "Transaksi tidak ditemukan." };
  }

  // If part of transfer, soft delete both legs
  if (tx.transferGroupId) {
    await prisma.transaction.updateMany({
      where: { transferGroupId: tx.transferGroupId, userId: user.id },
      data: { deletedAt: new Date() },
    });
  } else {
    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateTransactionAction(data: {
  id: string;
  accountId?: string;
  categoryId?: string;
  type?: "income" | "expense" | "adjustment";
  amount?: number;
  transactionDate?: string;
  description?: string;
  counterparty?: string;
  paymentMethod?: string;
}) {
  const user = await requireAuthUser();

  const tx = await prisma.transaction.findFirst({
    where: { id: data.id, userId: user.id },
  });

  if (!tx) {
    return { success: false, error: "Transaksi tidak ditemukan." };
  }

  const updateData: any = {};
  if (data.accountId) updateData.accountId = data.accountId;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.type) updateData.type = data.type;
  if (data.amount && data.amount > 0) updateData.amount = data.amount;
  if (data.transactionDate) updateData.transactionDate = new Date(data.transactionDate);
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.counterparty !== undefined) updateData.counterparty = data.counterparty?.trim() || null;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;

  const updated = await prisma.transaction.update({
    where: { id: data.id },
    data: updateData,
  });

  revalidatePath("/", "layout");
  return { success: true, transaction: updated };
}
