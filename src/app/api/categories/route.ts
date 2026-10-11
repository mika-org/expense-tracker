import { getApiUser, apiResponse, handleOptions } from "@/lib/api-auth";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/categories";
import { prisma } from "@/lib/db";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: user.id }, { userId: null, isDefault: true }],
        isArchived: false,
      },
      orderBy: { name: "asc" },
    });

    // Deduplicate by name and type so no duplicates are returned
    const uniqueMap = new Map<string, typeof categories[0]>();
    for (const c of categories) {
      const key = `${c.name.trim().toLowerCase()}-${c.type}`;
      if (!uniqueMap.has(key) || c.userId === user.id) {
        uniqueMap.set(key, c);
      }
    }

    return apiResponse({ categories: Array.from(uniqueMap.values()) });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch categories" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const result = await createCategoryAction(body);
    return apiResponse(result, result.success ? 201 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to create category" }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const result = await updateCategoryAction(body);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to update category" }, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiResponse({ error: "ID kategori wajib diisi" }, 400);
    }

    const result = await deleteCategoryAction(id);
    return apiResponse(result, result.success ? 200 : 400);
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to delete category" }, 500);
  }
}
