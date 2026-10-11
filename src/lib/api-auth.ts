import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession, getCurrentUser } from "@/lib/auth";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export function apiResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(),
  });
}

export async function getApiUser(request: Request) {
  try {
    // 1. Check Bearer token in Authorization header
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const payload = await verifySession(token);
      if (payload?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, email: true, currency: true, theme: true },
        });
        if (user) return user;
      }
    }

    // 2. Fallback to cookie-based auth or demo user
    const user = await getCurrentUser();
    if (user) return user;

    // 3. Fallback to default user directly (Aditia M or Demo User)
    const aditiaUser = await prisma.user.findUnique({
      where: { email: "hate274ever@gmail.com" },
      select: { id: true, name: true, email: true, currency: true, theme: true },
    });
    if (aditiaUser) return aditiaUser;

    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@expensetracker.com" },
      select: { id: true, name: true, email: true, currency: true, theme: true },
    });
    return demoUser;
  } catch (error) {
    console.error("Error in getApiUser:", error);
    return null;
  }
}
