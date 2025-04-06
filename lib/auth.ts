import { cookies, headers } from "next/headers";

export async function getUserSession() {
  headers(); // ✅ Forces revalidation (Next.js 15 cache bypass)
  const cookieStore = await cookies(); // ✅ Await the cookies
  const token = cookieStore.get("accessToken")?.value;
  return token ? { token } : null;
}
