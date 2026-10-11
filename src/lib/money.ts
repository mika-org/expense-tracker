import { Decimal } from "@prisma/client/runtime/library";

export function toNum(val: Decimal | number | string | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 0;
  return Number(val);
}

export function formatRupiah(amount: number | Decimal | string): string {
  const num = toNum(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCompactRupiah(amount: number | Decimal | string): string {
  const num = toNum(amount);
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
  }
  return formatRupiah(num);
}

export function calculateNetCashFlow(income: number, expense: number): number {
  return income - expense;
}

export function calculateBudgetUsage(spent: number, limit: number): {
  percentage: number;
  percentageText: string;
  remaining: number;
  status: "safe" | "warning" | "exceeded";
} {
  const remaining = limit - spent;
  if (limit <= 0) {
    return {
      percentage: 0,
      percentageText: "—",
      remaining: -spent,
      status: spent > 0 ? "exceeded" : "safe",
    };
  }

  const percentage = Math.round((spent / limit) * 100);
  let status: "safe" | "warning" | "exceeded" = "safe";
  if (percentage >= 100) {
    status = "exceeded";
  } else if (percentage >= 80) {
    status = "warning";
  }

  return {
    percentage,
    percentageText: `${percentage}%`,
    remaining,
    status,
  };
}

export function calculatePercentageAllocation(incomeBasis: number, percentage: number): number {
  return Math.round((incomeBasis * percentage) / 100);
}
