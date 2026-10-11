import { apiResponse, handleOptions, getApiUser } from "@/lib/api-auth";
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

    return apiResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency || "IDR",
        theme: user.theme || "system",
      },
    });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to fetch profile" }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (body.currency) {
      updateData.currency = body.currency;
    }
    if (body.theme) {
      updateData.theme = body.theme;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, currency: true, theme: true },
    });

    return apiResponse({ success: true, user: updated });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Failed to update profile" }, 500);
  }
}
