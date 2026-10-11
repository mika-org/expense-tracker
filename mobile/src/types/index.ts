export interface Transaction {
  id: string;
  name: string; // e.g. "Nike Store", "Apple Store", "Uber"
  category: string; // e.g. "Clothing", "Electronics", "Transport"
  amount: number; // e.g. 734.00
  tax?: number; // e.g. 60.35
  date: string; // e.g. "2026-04-11"
  dateLabel: string; // e.g. "Today", "08 April", "07 April"
  iconType: "clothing" | "electronics" | "transport" | "food" | "general";
  type: "expense" | "income" | "transfer";
  accountName?: string;
}

export interface DateGroupedTransactions {
  dateLabel: string;
  items: Transaction[];
}

export interface MonthlyChartData {
  month: string;
  amount: number;
  active: boolean;
}
