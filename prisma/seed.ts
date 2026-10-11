import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create or get demo user
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@expensetracker.com" },
    update: { passwordHash },
    create: {
      name: "Demo User",
      email: "demo@expensetracker.com",
      passwordHash,
      currency: "IDR",
      timezone: "Asia/Jakarta",
      theme: "dark",
    },
  });

  console.log(`Demo user ready: ${user.email} (ID: ${user.id})`);

  // 2. Default System Categories (userId = null or user.id for initial convenience)
  const defaultCategories = [
    // Income
    { name: "Gaji", type: "income", icon: "Briefcase", color: "#10B981" },
    { name: "Freelance", type: "income", icon: "Laptop", color: "#06B6D4" },
    { name: "Bisnis", type: "income", icon: "TrendingUp", color: "#3B82F6" },
    { name: "Investasi", type: "income", icon: "LineChart", color: "#8B5CF6" },
    { name: "Bonus & THR", type: "income", icon: "Gift", color: "#EC4899" },
    { name: "Lainnya (Pemasukan)", type: "income", icon: "PlusCircle", color: "#14B8A6" },

    // Expense
    { name: "Makanan & Minuman", type: "expense", icon: "Utensils", color: "#EF4444" },
    { name: "Transportasi", type: "expense", icon: "Car", color: "#F97316" },
    { name: "Tempat Tinggal & Kos", type: "expense", icon: "Home", color: "#F59E0B" },
    { name: "Tagihan & Utilitas", type: "expense", icon: "Zap", color: "#EAB308" },
    { name: "Internet & Komunikasi", type: "expense", icon: "Wifi", color: "#84CC16" },
    { name: "Kesehatan", type: "expense", icon: "HeartPulse", color: "#10B981" },
    { name: "Pendidikan", type: "expense", icon: "GraduationCap", color: "#06B6D4" },
    { name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#3B82F6" },
    { name: "Hiburan", type: "expense", icon: "Film", color: "#6366F1" },
    { name: "Nongkrong & Kopi", type: "expense", icon: "Coffee", color: "#8B5CF6" },
    { name: "Keluarga", type: "expense", icon: "Users", color: "#A855F7" },
    { name: "Cicilan & Utang", type: "expense", icon: "CreditCard", color: "#D946EF" },
    { name: "Donasi & Sedekah", type: "expense", icon: "Heart", color: "#F43F5E" },
    { name: "Lainnya (Pengeluaran)", type: "expense", icon: "MoreHorizontal", color: "#64748B" },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of defaultCategories) {
    let existing = await prisma.category.findFirst({
      where: { userId: user.id, name: cat.name },
    });

    if (!existing) {
      existing = await prisma.category.create({
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
    categoryMap.set(cat.name, existing.id);
  }

  // 3. Accounts / Wallets
  const defaultAccounts = [
    { name: "Rekening BCA", accountType: "bank", openingBalance: 12500000 },
    { name: "Dompet Tunai", accountType: "cash", openingBalance: 750000 },
    { name: "GoPay / OVO", accountType: "ewallet", openingBalance: 450000 },
    { name: "Tabungan Darurat (Bibit)", accountType: "savings", openingBalance: 20000000 },
  ];

  const accountMap = new Map<string, string>();
  for (const acc of defaultAccounts) {
    let existing = await prisma.account.findFirst({
      where: { userId: user.id, name: acc.name },
    });
    if (!existing) {
      existing = await prisma.account.create({
        data: {
          userId: user.id,
          name: acc.name,
          accountType: acc.accountType,
          currency: "IDR",
          openingBalance: acc.openingBalance,
          openingBalanceDate: new Date("2026-01-01"),
        },
      });
    }
    accountMap.set(acc.name, existing.id);
  }

  // 4. Budget for Current Month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  let budget = await prisma.budget.findFirst({
    where: { userId: user.id, startDate: { gte: startOfMonth } },
  });

  if (!budget) {
    budget = await prisma.budget.create({
      data: {
        userId: user.id,
        name: `Anggaran ${now.toLocaleString("id-ID", { month: "long" })} ${now.getFullYear()}`,
        periodType: "monthly",
        startDate: startOfMonth,
        endDate: endOfMonth,
        allocationMethod: "percentage",
        incomeBasis: 15000000, // 15jt monthly income target
        rolloverEnabled: false,
      },
    });

    const budgetItems = [
      { category: "Makanan & Minuman", pct: 25 },
      { category: "Transportasi", pct: 15 },
      { category: "Tempat Tinggal & Kos", pct: 20 },
      { category: "Tagihan & Utilitas", pct: 10 },
      { category: "Hiburan", pct: 5 },
      { category: "Nongkrong & Kopi", pct: 5 },
      { category: "Belanja", pct: 10 },
      { category: "Donasi & Sedekah", pct: 10 },
    ];

    for (const item of budgetItems) {
      const catId = categoryMap.get(item.category);
      if (catId) {
        await prisma.budgetItem.create({
          data: {
            budgetId: budget.id,
            categoryId: catId,
            amountType: "percentage",
            amountValue: item.pct,
          },
        });
      }
    }
  }

  // 5. Savings Goals
  let emergencyGoal = await prisma.savingsGoal.findFirst({
    where: { userId: user.id, name: "Dana Darurat (6 Bulan)" },
  });
  if (!emergencyGoal) {
    emergencyGoal = await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: "Dana Darurat (6 Bulan)",
        targetAmount: 30000000,
        currentAmount: 20000000,
        targetDate: new Date("2026-12-31"),
        accountId: accountMap.get("Tabungan Darurat (Bibit)"),
        status: "active",
      },
    });
  }

  let travelGoal = await prisma.savingsGoal.findFirst({
    where: { userId: user.id, name: "Liburan Akhir Tahun" },
  });
  if (!travelGoal) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: "Liburan Akhir Tahun",
        targetAmount: 10000000,
        currentAmount: 3500000,
        targetDate: new Date("2026-11-30"),
        status: "active",
      },
    });
  }

  // 6. Debts / Receivables
  let existingDebt = await prisma.debt.findFirst({
    where: { userId: user.id, counterparty: "Budi (Teman)" },
  });
  if (!existingDebt) {
    await prisma.debt.create({
      data: {
        userId: user.id,
        type: "receivable",
        counterparty: "Budi (Teman)",
        initialAmount: 1500000,
        remainingAmount: 500000,
        startDate: new Date("2026-09-01"),
        dueDate: new Date("2026-10-30"),
        status: "active",
        note: "Pinjaman untuk perbaikan motor",
      },
    });
  }

  // 7. Demo Transactions for this month
  const txCount = await prisma.transaction.count({ where: { userId: user.id } });
  if (txCount === 0) {
    const bcaId = accountMap.get("Rekening BCA")!;
    const cashId = accountMap.get("Dompet Tunai")!;
    const ewalletId = accountMap.get("GoPay / OVO")!;

    const demoTx = [
      {
        type: "income",
        accountId: bcaId,
        category: "Gaji",
        amount: 15000000,
        date: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0),
        desc: "Gaji Pokok Bulanan",
      },
      {
        type: "expense",
        accountId: bcaId,
        category: "Tempat Tinggal & Kos",
        amount: 2500000,
        date: new Date(now.getFullYear(), now.getMonth(), 2, 10, 0),
        desc: "Sewa Kos Bulanan",
      },
      {
        type: "expense",
        accountId: bcaId,
        category: "Tagihan & Utilitas",
        amount: 350000,
        date: new Date(now.getFullYear(), now.getMonth(), 3, 14, 0),
        desc: "Listrik PLN & Air",
      },
      {
        type: "expense",
        accountId: bcaId,
        category: "Internet & Komunikasi",
        amount: 400000,
        date: new Date(now.getFullYear(), now.getMonth(), 4, 11, 0),
        desc: "WiFi IndiHome & Paket Data",
      },
      {
        type: "expense",
        accountId: ewalletId,
        category: "Makanan & Minuman",
        amount: 85000,
        date: new Date(now.getFullYear(), now.getMonth(), 5, 12, 30),
        desc: "Makan Siang Nasi Padang & Es Teh",
      },
      {
        type: "expense",
        accountId: cashId,
        category: "Nongkrong & Kopi",
        amount: 45000,
        date: new Date(now.getFullYear(), now.getMonth(), 6, 19, 0),
        desc: "Kopi Susu Senja",
      },
      {
        type: "expense",
        accountId: ewalletId,
        category: "Transportasi",
        amount: 35000,
        date: new Date(now.getFullYear(), now.getMonth(), 7, 8, 30),
        desc: "Grab / GoRide ke Kantor",
      },
      {
        type: "expense",
        accountId: bcaId,
        category: "Belanja",
        amount: 650000,
        date: new Date(now.getFullYear(), now.getMonth(), 8, 16, 0),
        desc: "Belanja Bulanan Supermarket",
      },
      {
        type: "income",
        accountId: bcaId,
        category: "Freelance",
        amount: 2500000,
        date: new Date(now.getFullYear(), now.getMonth(), 9, 15, 0),
        desc: "Project Landing Page Client",
      },
      {
        type: "expense",
        accountId: ewalletId,
        category: "Makanan & Minuman",
        amount: 120000,
        date: new Date(now.getFullYear(), now.getMonth(), 10, 18, 45),
        desc: "Makan Malam Ramen",
      },
    ];

    for (const tx of demoTx) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: tx.accountId,
          categoryId: categoryMap.get(tx.category),
          type: tx.type,
          amount: tx.amount,
          transactionDate: tx.date,
          description: tx.desc,
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
