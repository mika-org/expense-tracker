import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getAccountsAction, createAccountAction } from "@/actions/accounts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const accounts = await getAccountsAction();
    return apiResponse({ accounts });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch accounts" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAccountAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create account" }, 500);
  }
}
