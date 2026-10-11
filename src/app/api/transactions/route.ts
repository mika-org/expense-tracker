import { apiResponse, handleOptions, getApiUser } from "@/lib/api-auth";
import { getTransactionsAction, createTransactionAction } from "@/actions/transactions";
import { prisma } from "@/lib/db";

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
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();

    let accountId = body.accountId;
    if (!accountId) {
      const firstAccount = await prisma.account.findFirst({
        where: { userId: user.id, isArchived: false },
        orderBy: { createdAt: "asc" },
      });
      if (firstAccount) {
        accountId = firstAccount.id;
      } else {
        const newAccount = await prisma.account.create({
          data: {
            userId: user.id,
            name: "Dompet Tunai",
            accountType: "cash",
            openingBalance: 0,
            currency: user.currency || "IDR",
          },
        });
        accountId = newAccount.id;
      }
    }

    let categoryId = body.categoryId;
    if (!categoryId && body.category) {
      const matchedCat = await prisma.category.findFirst({
        where: {
          OR: [{ userId: user.id }, { isDefault: true }],
          name: { equals: body.category, mode: "insensitive" },
        },
      });
      if (matchedCat) {
        categoryId = matchedCat.id;
      }
    }

    const payload = {
      accountId,
      categoryId,
      type: body.type || "expense",
      amount: parseFloat(body.amount),
      transactionDate: body.date || new Date().toISOString(),
      description: body.description || body.merchant || "Transaksi Mobile",
      counterparty: body.merchant || body.counterparty || null,
      paymentMethod: body.paymentMethod || null,
    };

    const result = await createTransactionAction(payload);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create transaction" }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }
    const body = await request.json();
    if (!body.id) {
      return apiResponse({ error: "ID transaksi wajib disertakan" }, 400);
    }

    let categoryId = body.categoryId;
    if (!categoryId && body.category) {
      const matchedCat = await prisma.category.findFirst({
        where: {
          OR: [{ userId: user.id }, { isDefault: true }],
          name: { equals: body.category, mode: "insensitive" },
        },
      });
      if (matchedCat) categoryId = matchedCat.id;
    }

    const payload = {
      id: body.id,
      accountId: body.accountId,
      categoryId,
      type: body.type,
      amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
      transactionDate: body.date,
      description: body.description || body.merchant,
      counterparty: body.merchant || body.counterparty,
      paymentMethod: body.paymentMethod,
    };

    const { updateTransactionAction } = await import("@/actions/transactions");
    const result = await updateTransactionAction(payload);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to update transaction" }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return apiResponse({ error: "ID transaksi wajib disertakan" }, 400);
    }

    const { deleteTransactionAction } = await import("@/actions/transactions");
    const result = await deleteTransactionAction(id);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to delete transaction" }, 500);
  }
}
