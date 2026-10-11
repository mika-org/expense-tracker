import { getApiUser, apiResponse, handleOptions } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return apiResponse({ error: "Unauthorized" }, 401);
  }

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: user.id }, { isDefault: true }],
    },
    orderBy: { name: "asc" },
  });

  return apiResponse({ categories });
}
