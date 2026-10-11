// Base API URL pointing to the production Next.js REST API
export const API_BASE_URL = "https://expense-tracker.elevore.web.id/api";

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  currency?: string;
  theme?: string;
}

export interface ApiTransaction {
  id: string;
  name?: string;
  merchant?: string;
  description?: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: string;
  categoryName?: string;
  categoryColor?: string;
  account?: string;
  accountName?: string;
  date: string;
  time?: string;
  dateLabel?: string;
  taxAmount?: number;
  receiptUrl?: string;
}

export interface ApiDashboardData {
  periodLabel?: string;
  user?: {
    name: string;
    email: string;
    currency: string;
  };
  summary: {
    totalBalance?: number;
    totalAccountBalance?: number;
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    budgetRemaining?: number;
    budgetTotalLimit?: number;
  };
  chartData?: Array<{
    month: string;
    amount: number;
    rawAmount?: number;
    active: boolean;
  }>;
  monthlyExpenses?: Array<{
    month: string;
    amount: number;
  }>;
  cashFlowTimeline?: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  recentTransactions: ApiTransaction[];
  accounts?: Array<{
    id: string;
    name: string;
    accountType?: string;
    balance?: number;
  }>;
}

// Global active auth token in mobile session
let currentAuthToken: string | null = null;
let currentStoredUser: ApiUser | null = {
  id: "7a4c6e28-ee3f-43f0-971b-7aca85de4c75",
  name: "Aditia M",
  email: "hate274ever@gmail.com",
  currency: "IDR",
};

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
}

export function getAuthToken() {
  return currentAuthToken;
}

export function setStoredUser(user: ApiUser | null) {
  currentStoredUser = user;
}

export function getStoredUser() {
  return currentStoredUser;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 9000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const authHeaders: Record<string, string> = {};
  if (currentAuthToken) {
    authHeaders["Authorization"] = `Bearer ${currentAuthToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  // 0. Authentication & Profile
  async login(payload: { emailOrUsername?: string; username?: string; email?: string; password?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        if (data.user) setStoredUser(data.user);
      }
      return data;
    } catch (err: any) {
      console.warn("API login failed:", err);
      return { success: false, error: err.message || "Gagal menghubungi server" };
    }
  },

  async logout() {
    setAuthToken(null);
    return { success: true };
  },

  async getProfile(): Promise<ApiUser | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.user) setStoredUser(data.user);
      return data.user || currentStoredUser;
    } catch (err) {
      console.warn("API getProfile failed:", err);
      return currentStoredUser;
    }
  },

  async updateProfile(payload: { name?: string; currency?: string; theme?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.user) setStoredUser(data.user);
      return data;
    } catch (err: any) {
      console.warn("API updateProfile failed:", err);
      return { success: false, error: err.message || "Gagal memperbarui profil" };
    }
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API changePassword failed:", err);
      return { success: false, error: err.message || "Gagal mengubah kata sandi" };
    }
  },

  // 1. Dashboard
  async getDashboard(): Promise<ApiDashboardData | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("API getDashboard failed:", err);
      return null;
    }
  },

  // 2. Transactions (CRUD)
  async getTransactions(params: { type?: string; categoryId?: string; search?: string; limit?: number } = {}): Promise<ApiTransaction[]> {
    try {
      const query = new URLSearchParams();
      if (params.type) query.append("type", params.type);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.search) query.append("search", params.search);
      if (params.limit) query.append("limit", params.limit.toString());

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
    accountId?: string;
  }) {
    try {
      let accountId = payload.accountId;
      if (!accountId) {
        const accounts = await api.getAccounts();
        if (accounts && accounts.length > 0) {
          accountId = accounts[0].id;
        }
      }

      const res = await fetchWithTimeout(`${API_BASE_URL}/transactions`, {
        method: "POST",
        body: JSON.stringify({ ...payload, accountId }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createTransaction failed:", err);
      return { success: false, error: err.message || "Gagal menghubungi server" };
    }
  },

  async updateTransaction(payload: {
    id: string;
    type?: "expense" | "income";
    amount?: number;
    merchant?: string;
    category?: string;
    date?: string;
    accountId?: string;
  }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/transactions`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API updateTransaction failed:", err);
      return { success: false, error: err.message || "Gagal memperbarui transaksi" };
    }
  },

  async deleteTransaction(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/transactions?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteTransaction failed:", err);
      return { success: false, error: err.message || "Gagal menghapus transaksi" };
    }
  },

  // Upload receipt image
  async uploadReceipt(base64Data: string, filename?: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/receipts/upload`, {
        method: "POST",
        body: JSON.stringify({ base64Data, filename }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API uploadReceipt failed:", err);
      return { success: false, error: err.message || "Gagal mengunggah struk" };
    }
  },

  // 3. Budgets
  async getBudgets() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.budget || null;
    } catch (err) {
      console.warn("API getBudgets failed:", err);
      return null;
    }
  },

  async saveBudget(payload: any) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API saveBudget failed:", err);
      return { success: false, error: err.message || "Gagal menyimpan anggaran" };
    }
  },

  async addBudgetItem(payload: { categoryId: string; amountType?: "fixed" | "percentage"; amountValue: number; budgetId?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets`, {
        method: "POST",
        body: JSON.stringify({ ...payload, action: "add_item" }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API addBudgetItem failed:", err);
      return { success: false, error: err.message || "Gagal menambah pos anggaran" };
    }
  },

  async updateBudgetItem(payload: { id: string; categoryId?: string; amountType?: "fixed" | "percentage"; amountValue: number }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API updateBudgetItem failed:", err);
      return { success: false, error: err.message || "Gagal memperbarui pos anggaran" };
    }
  },

  async deleteBudgetItem(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/budgets?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteBudgetItem failed:", err);
      return { success: false, error: err.message || "Gagal menghapus pos anggaran" };
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

  async createAccount(payload: { name: string; accountType: string; openingBalance: number }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/accounts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createAccount failed:", err);
      return { success: false, error: err.message || "Gagal membuat akun" };
    }
  },

  async updateAccount(payload: { id: string; name: string; accountType: string; openingBalance: number }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/accounts`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API updateAccount failed:", err);
      return { success: false, error: err.message || "Gagal memperbarui akun" };
    }
  },

  async deleteAccount(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/accounts?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteAccount failed:", err);
      return { success: false, error: err.message || "Gagal menghapus akun" };
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

  async createSavingsGoal(payload: {
    name: string;
    targetAmount: number;
    initialAmount?: number;
    targetDate?: string;
    accountId?: string;
  }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/savings`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createSavingsGoal failed:", err);
      return { success: false, error: err.message || "Gagal membuat target tabungan" };
    }
  },

  async contributeSavings(payload: { goalId: string; amount: number; note?: string; accountId?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/savings`, {
        method: "POST",
        body: JSON.stringify({ ...payload, action: "contribute" }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API contributeSavings failed:", err);
      return { success: false, error: err.message || "Gagal menambah setoran" };
    }
  },

  async deleteSavingsGoal(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/savings?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteSavingsGoal failed:", err);
      return { success: false, error: err.message || "Gagal menghapus target tabungan" };
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

  async createDebt(payload: {
    type: "debt" | "receivable";
    counterparty: string;
    initialAmount: number;
    startDate?: string;
    dueDate?: string;
    note?: string;
  }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/debts`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          startDate: payload.startDate || new Date().toISOString(),
        }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createDebt failed:", err);
      return { success: false, error: err.message || "Gagal mencatat utang/piutang" };
    }
  },

  async payDebt(payload: { debtId: string; amount: number; accountId?: string; note?: string; paymentDate?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/debts`, {
        method: "POST",
        body: JSON.stringify({ ...payload, action: "pay" }),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API payDebt failed:", err);
      return { success: false, error: err.message || "Gagal mencatat pembayaran" };
    }
  },

  async deleteDebt(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/debts?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteDebt failed:", err);
      return { success: false, error: err.message || "Gagal menghapus utang/piutang" };
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

  async createCategory(payload: { name: string; type: "expense" | "income"; icon?: string; color?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/categories`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API createCategory failed:", err);
      return { success: false, error: err.message || "Gagal membuat kategori" };
    }
  },

  async updateCategory(payload: { id: string; name: string; type?: "expense" | "income"; icon?: string; color?: string }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/categories`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API updateCategory failed:", err);
      return { success: false, error: err.message || "Gagal memperbarui kategori" };
    }
  },

  async deleteCategory(id: string) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/categories?id=${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err: any) {
      console.warn("API deleteCategory failed:", err);
      return { success: false, error: err.message || "Gagal menghapus kategori" };
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
