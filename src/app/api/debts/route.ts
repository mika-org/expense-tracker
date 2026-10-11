import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getDebtsAction, createDebtAction, payDebtAction } from "@/actions/debts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const debts = await getDebtsAction();
    return apiResponse({ debts });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch debts" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "pay") {
      const result = await payDebtAction(body);
      return apiResponse(result, result.success ? 201 : 400);
    }
    const result = await createDebtAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create debt" }, 500);
  }
}
