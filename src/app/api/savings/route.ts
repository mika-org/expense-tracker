import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getSavingsGoalsAction, createSavingsGoalAction, contributeSavingsAction } from "@/actions/savings";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const goals = await getSavingsGoalsAction();
    return apiResponse({ goals });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch savings goals" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "contribute") {
      const result = await contributeSavingsAction(body);
      return apiResponse(result, result.success ? 201 : 400);
    }
    const result = await createSavingsGoalAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create savings goal" }, 500);
  }
}
