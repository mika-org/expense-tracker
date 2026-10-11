import { apiResponse, handleOptions, getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { comparePassword, hashPassword } from "@/lib/auth";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return apiResponse({ error: "Kata sandi lama dan baru wajib diisi." }, 400);
    }

    if (newPassword.length < 6) {
      return apiResponse({ error: "Kata sandi baru minimal 6 karakter." }, 400);
    }

    // Retrieve user passwordHash
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      return apiResponse({ error: "Pengguna tidak ditemukan." }, 404);
    }

    const isMatch = await comparePassword(currentPassword, fullUser.passwordHash);
    if (!isMatch) {
      return apiResponse({ error: "Kata sandi saat ini tidak sesuai." }, 400);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return apiResponse({ success: true, message: "Kata sandi berhasil diubah." });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Gagal mengubah kata sandi." }, 500);
  }
}
