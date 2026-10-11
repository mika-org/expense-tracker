import { apiResponse, handleOptions } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { comparePassword, signSession, createSessionCookie } from "@/lib/auth";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.emailOrUsername || body.email || body.username || "").toLowerCase().trim();
    const password = body.password;

    if (!identifier || !password) {
      return apiResponse({ error: "Email/username dan password wajib diisi." }, 400);
    }

    // Match by email or username 'aditiam2311' -> 'hate274ever@gmail.com'
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          identifier === "aditiam2311" ? { email: "hate274ever@gmail.com" } : { email: identifier },
        ],
      },
    });

    if (!user) {
      return apiResponse({ error: "Akun tidak ditemukan. Periksa email atau kata sandi." }, 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return apiResponse({ error: "Kata sandi tidak sesuai." }, 401);
    }

    const token = await signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    try {
      await createSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch {}

    return apiResponse({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency || "IDR",
        theme: user.theme || "system",
      },
    });
  } catch (error: any) {
    return apiResponse({ error: error.message || "Gagal masuk." }, 500);
  }
}
