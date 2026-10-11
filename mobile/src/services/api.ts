import { Platform } from "react-native";

// In development:
// - Android Emulator: http://10.0.2.2:3000
// - iOS Simulator: http://localhost:3000
// - Physical device: replace with your local WiFi IP address (e.g. http://192.168.1.x:3000)
export const API_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export async function fetchDashboardSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
    if (!res.ok) throw new Error("Gagal mengambil data");
    return await res.json();
  } catch (err) {
    console.warn("API offline, menggunakan data lokal:", err);
    return null;
  }
}

export async function createTransactionApi(data: {
  amount: number;
  type: string;
  description: string;
  categoryId?: string;
  accountId?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}
