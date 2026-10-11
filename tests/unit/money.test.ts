import {
  calculateNetCashFlow,
  calculateBudgetUsage,
  calculatePercentageAllocation,
  formatRupiah,
} from "../../src/lib/money";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Running unit tests for financial calculations...");

// 1. Net Cash Flow
assert(calculateNetCashFlow(10000000, 4000000) === 6000000, "Net Cash Flow positive");
assert(calculateNetCashFlow(2000000, 3500000) === -1500000, "Net Cash Flow negative");

// 2. Budget Usage
const safeBudget = calculateBudgetUsage(300000, 1000000);
assert(safeBudget.percentage === 30, "Budget percentage calculation");
assert(safeBudget.status === "safe", "Budget safe status");
assert(safeBudget.remaining === 700000, "Budget remaining amount");

const warningBudget = calculateBudgetUsage(850000, 1000000);
assert(warningBudget.status === "warning", "Budget warning status at 85%");

const exceededBudget = calculateBudgetUsage(1100000, 1000000);
assert(exceededBudget.status === "exceeded", "Budget exceeded status");
assert(exceededBudget.remaining === -100000, "Budget negative remaining amount");

const zeroBudget = calculateBudgetUsage(50000, 0);
assert(zeroBudget.percentageText === "—", "Zero budget displays dash without dividing by zero");

// 3. Percentage Allocation
assert(calculatePercentageAllocation(15000000, 20) === 3000000, "20% of 15M is 3M");
assert(calculatePercentageAllocation(10000000, 25) === 2500000, "25% of 10M is 2.5M");

// 4. Formatting
assert(formatRupiah(1500000).includes("1.500.000"), "formatRupiah formats correctly with IDR dots");

console.log("✅ All financial calculation unit tests passed successfully!");
