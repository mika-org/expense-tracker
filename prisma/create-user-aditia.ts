import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "hate274ever@gmail.com";
  const name = "Aditia M";
  const rawPassword = "admin123";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      currency: "IDR",
    },
    create: {
      name,
      email,
      passwordHash,
      currency: "IDR",
      timezone: "Asia/Jakarta",
      theme: "system",
    },
  });

  console.log(`User created/updated successfully: ${user.name} (${user.email}), ID: ${user.id}`);

  // Ensure default accounts exist for this user
  const defaultAccounts = [
    { name: "Rekening Utama (BCA)", accountType: "bank" },
    { name: "Dompet Tunai", accountType: "cash" },
    { name: "E-Wallet (GoPay / OVO)", accountType: "ewallet" },
    { name: "Tabungan Masa Depan", accountType: "savings" },
  ];

  for (const acc of defaultAccounts) {
    const existing = await prisma.account.findFirst({
      where: { userId: user.id, name: acc.name },
    });
    if (!existing) {
      await prisma.account.create({
        data: {
          userId: user.id,
          name: acc.name,
          accountType: acc.accountType,
          openingBalance: 0,
          currency: "IDR",
        },
      });
      console.log(`Created account: ${acc.name}`);
    }
  }

  // Ensure default categories exist for this user
  const defaultCategories = [
    { name: "Makanan & Minuman", type: "expense", color: "#EF4444", icon: "Utensils" },
    { name: "Transportasi", type: "expense", color: "#F97316", icon: "Car" },
    { name: "Tempat Tinggal & Kos", type: "expense", color: "#F59E0B", icon: "Home" },
    { name: "Tagihan & Utilitas", type: "expense", color: "#EAB308", icon: "Zap" },
    { name: "Belanja", type: "expense", color: "#3B82F6", icon: "ShoppingBag" },
    { name: "Hiburan", type: "expense", color: "#6366F1", icon: "Film" },
    { name: "Kesehatan", type: "expense", color: "#10B981", icon: "HeartPulse" },
    { name: "Gaji", type: "income", color: "#10B981", icon: "Briefcase" },
    { name: "Freelance", type: "income", color: "#06B6D4", icon: "Laptop" },
    { name: "Bisnis", type: "income", color: "#3B82F6", icon: "TrendingUp" },
    { name: "Bonus & THR", type: "income", color: "#EC4899", icon: "Gift" },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name: cat.name },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          userId: user.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
        },
      });
    }
  }

  console.log("Categories initialized for Aditia M!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
