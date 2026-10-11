import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getActiveBudgetAction, saveBudgetAction } from "@/actions/budgets";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const budget = await getActiveBudgetAction();
    return apiResponse({ budget });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch budget" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await saveBudgetAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to save budget" }, 500);
  }
}
