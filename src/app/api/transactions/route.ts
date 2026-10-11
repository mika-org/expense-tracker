import { apiResponse, handleOptions } from "@/lib/api-auth";
import { getTransactionsAction, createTransactionAction } from "@/actions/transactions";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const accountId = searchParams.get("accountId") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const result = await getTransactionsAction({
      type,
      accountId,
      categoryId,
      search,
      page,
      limit,
    });
    return apiResponse(result);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch transactions" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createTransactionAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create transaction" }, 500);
  }
}
