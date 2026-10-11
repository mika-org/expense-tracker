import { apiResponse, handleOptions } from "@/lib/api-auth";
import {
  getAccountsAction,
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/actions/accounts";

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return apiResponse({ error: "ID akun wajib diisi" }, 400);
    const result = await updateAccountAction(id, data);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to update account" }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiResponse({ error: "ID akun wajib diisi" }, 400);
    const result = await deleteAccountAction(id);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to delete account" }, 500);
  }
}

