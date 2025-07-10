import { NextResponse } from "next/server";

export function middleware(req) {
  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const { pathname } = req.nextUrl;

  console.log("TOKEN:", token);
  console.log("Requested Path:", pathname);

  const isDashboardPath = pathname.startsWith("/dashboard");

  // Foydalanuvchi login qilmagan va dashboard sahifasiga kirmoqchi bo‘lsa → login sahifaga qaytarish
  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Login bo‘lgan, lekin `/dashboard/reports`dan boshqa sahifaga kirsa → `reports`ga redirect
  if (token && isDashboardPath && pathname !== "/dashboard/reports") {
    return NextResponse.redirect(new URL("/dashboard/reports", req.url));
  }

  return NextResponse.next(); // Ruxsat
}

export const config = {
  matcher: ["/dashboard/:path*"], // faqat dashboard ichidagi sahifalar uchun ishlaydi
};
