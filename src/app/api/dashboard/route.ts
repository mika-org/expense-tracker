import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getDashboardDataAction } from "@/actions/dashboard";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const data = await getDashboardDataAction();
    return apiResponse(data);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch dashboard" }, 500);
  }
}
