import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDummyData() {
  console.log("Starting deletion of dummy data...");

  // 1. Delete all transactions and links
  const deletedLinks = await prisma.transactionTagLink.deleteMany({});
  console.log(`Deleted ${deletedLinks.count} transaction tag links.`);

  const deletedTx = await prisma.transaction.deleteMany({});
  console.log(`Deleted ${deletedTx.count} transactions.`);

  // 2. Delete all budget items and budgets
  const deletedBudgetItems = await prisma.budgetItem.deleteMany({});
  console.log(`Deleted ${deletedBudgetItems.count} budget items.`);

  const deletedBudgets = await prisma.budget.deleteMany({});
  console.log(`Deleted ${deletedBudgets.count} budgets.`);

  // 3. Delete debt payments and debts
  const deletedDebtPayments = await prisma.debtPayment.deleteMany({});
  console.log(`Deleted ${deletedDebtPayments.count} debt payments.`);

  const deletedDebts = await prisma.debt.deleteMany({});
  console.log(`Deleted ${deletedDebts.count} debts.`);

  // 4. Delete savings contributions and goals
  const deletedSavingsContribs = await prisma.savingsContribution.deleteMany({});
  console.log(`Deleted ${deletedSavingsContribs.count} savings contributions.`);

  const deletedSavingsGoals = await prisma.savingsGoal.deleteMany({});
  console.log(`Deleted ${deletedSavingsGoals.count} savings goals.`);

  // 5. Delete recurring rules
  const deletedRules = await prisma.recurringRule.deleteMany({});
  console.log(`Deleted ${deletedRules.count} recurring rules.`);

  // 6. Reset account balances to 0
  const updatedAccounts = await prisma.account.updateMany({
    data: {
      openingBalance: 0,
    },
  });
  console.log(`Reset ${updatedAccounts.count} accounts opening balance to 0.`);

  console.log("All dummy data successfully cleaned from database!");
}

cleanDummyData()
  .catch((err) => {
    console.error("Error cleaning dummy data:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
