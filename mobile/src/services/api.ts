// Base API URL pointing to the production Next.js REST API
export const API_BASE_URL = "https://expense-tracker.elevore.web.id/api";

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface ApiTransaction {
  id: string;
  merchant: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  categoryColor: string;
  account: string;
  date: string;
  time: string;
  dateLabel: string;
  taxAmount?: number;
}

export interface ApiDashboardData {
  user?: {
    name: string;
    email: string;
    currency: string;
  };
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
  };
  chartData: Array<{
    month: string;
    amount: number;
    active: boolean;
  }>;
  recentTransactions: ApiTransaction[];
  accounts?: Array<{
    id: string;
    name: string;
    accountType: string;
    balance?: number;
  }>;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  // 1. Dashboard
  async getDashboard(): Promise<ApiDashboardData | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("API getDashboard failed, falling back to local cache/mock:", err);
      return null;
    }
  },

  // 2. Transactions
  async getTransactions(params: { type?: string; categoryId?: string; search?: string } = {}): Promise<ApiTransaction[]> {
    try {
      const query = new URLSearchParams();
      if (params.type) query.append("type", params.type);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.search) query.append("search", params.search);

      const res = await fetchWithTimeout(`${API_BASE_URL}/transactions?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.transactions || [];
    } catch (err) {
      console.warn("API getTransactions failed:", err);
      return [];
    }
  },

  async createTransaction(payload: {
    type: "expense" | "income";
    amount: number;
    merchant: string;
    category: string;
    date?: string;
  }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/transactions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createTransaction failed:", err);
      return { success: false, error: err.message || "Gagal menghubungi server" };
    }
  },

  // 3. Budgets
  async getBudgets() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.budgets || [];
    } catch (err) {
      console.warn("API getBudgets failed:", err);
      return [];
    }
  },

  // 4. Accounts
  async getAccounts() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/accounts`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.accounts || [];
    } catch (err) {
      console.warn("API getAccounts failed:", err);
      return [];
    }
  },

  // 5. Savings
  async getSavings() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/savings`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.goals || [];
    } catch (err) {
      console.warn("API getSavings failed:", err);
      return [];
    }
  },

  // 6. Debts
  async getDebts() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/debts`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.debts || [];
    } catch (err) {
      console.warn("API getDebts failed:", err);
      return [];
    }
  },

  // 7. Categories
  async getCategories() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.categories || [];
    } catch (err) {
      console.warn("API getCategories failed:", err);
      return [];
    }
  },

  // 8. Reports
  async getReports(period: string = "this_month") {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/reports?period=${period}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("API getReports failed:", err);
      return null;
    }
  },
};
