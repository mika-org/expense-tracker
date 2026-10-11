"use server";

import { prisma } from "@/lib/db";
import {
  hashPassword,
  comparePassword,
  createSessionCookie,
  clearSessionCookie,
  getCurrentUser,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { success: false, error: "Email atau kata sandi tidak sesuai." };
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Email atau kata sandi tidak sesuai." };
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    return { success: false, error: "Email sudah terdaftar." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      currency: "IDR",
      timezone: "Asia/Jakarta",
    },
  });

  // Seed standard categories for new user
  const initialCategories = [
    { name: "Gaji", type: "income", icon: "Briefcase", color: "#10B981" },
    { name: "Freelance", type: "income", icon: "Laptop", color: "#06B6D4" },
    { name: "Makanan & Minuman", type: "expense", icon: "Utensils", color: "#EF4444" },
    { name: "Transportasi", type: "expense", icon: "Car", color: "#F97316" },
    { name: "Tempat Tinggal", type: "expense", icon: "Home", color: "#F59E0B" },
    { name: "Tagihan & Utilitas", type: "expense", icon: "Zap", color: "#EAB308" },
    { name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#3B82F6" },
    { name: "Hiburan", type: "expense", icon: "Film", color: "#6366F1" },
  ];

  for (const cat of initialCategories) {
    await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  // Initial Cash Account
  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Kas Tunai",
      accountType: "cash",
      openingBalance: 0,
      currency: "IDR",
    },
  });

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getUserAction() {
  return await getCurrentUser();
}
