import { apiResponse, handleOptions, getApiUser } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    if (!user) {
      return apiResponse({ error: "Unauthorized" }, 401);
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { base64Data, filename = `receipt-${Date.now()}.jpg` } = body;

      if (!base64Data) {
        return apiResponse({ error: "Data gambar struk wajib disertakan." }, 400);
      }

      // Clean base64 header if present
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadDir, { recursive: true });

      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/receipts/${safeFilename}`;
      return apiResponse({ success: true, url: fileUrl });
    } else {
      // Multipart form data
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return apiResponse({ error: "File struk tidak ditemukan." }, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadDir, { recursive: true });

      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/receipts/${safeFilename}`;
      return apiResponse({ success: true, url: fileUrl });
    }
  } catch (error: any) {
    return apiResponse({ error: error.message || "Gagal mengunggah struk." }, 500);
  }
}
