"use server";

import { prisma } from "@/lib/db";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategoriesAction() {
  const user = await requireAuthUser();

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null }],
      isArchived: false,
    },
    orderBy: { name: "asc" },
  });

  return categories;
}

export async function createCategoryAction(data: {
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}) {
  const user = await requireAuthUser();

  if (!data.name.trim()) {
    return { success: false, error: "Nama kategori wajib diisi." };
  }

  const category = await prisma.category.create({
    data: {
      userId: user.id,
      name: data.name.trim(),
      type: data.type,
      icon: data.icon || "Tag",
      color: data.color || (data.type === "income" ? "#10B981" : "#EF4444"),
    },
  });

  revalidatePath("/", "layout");
  return { success: true, category };
}

export async function deleteCategoryAction(id: string) {
  const user = await requireAuthUser();

  const txCount = await prisma.transaction.count({
    where: { categoryId: id, userId: user.id },
  });

  if (txCount > 0) {
    await prisma.category.update({
      where: { id },
      data: { isArchived: true },
    });
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Kategori diarsipkan karena sudah digunakan dalam transaksi.",
    };
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
