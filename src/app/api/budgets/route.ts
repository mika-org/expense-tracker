import { apiResponse, handleOptions } from "@/lib/api-auth";
import {
  getActiveBudgetAction,
  saveBudgetAction,
  addBudgetItemAction,
  updateBudgetItemAction,
  deleteBudgetItemAction,
} from "@/actions/budgets";

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
    if (body.action === "add_item" || (body.categoryId && body.amountValue !== undefined && !body.items)) {
      const result = await addBudgetItemAction(body);
      return apiResponse(result, result.success ? 201 : 400);
    }
    const result = await saveBudgetAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to save budget" }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return apiResponse({ error: "ID pos anggaran wajib disertakan" }, 400);
    }
    const result = await updateBudgetItemAction(body.id, body);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to update budget item" }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (_) {}
    }
    if (!id) {
      return apiResponse({ error: "ID pos anggaran wajib diisi" }, 400);
    }
    const result = await deleteBudgetItemAction(id);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to delete budget item" }, 500);
  }
}
