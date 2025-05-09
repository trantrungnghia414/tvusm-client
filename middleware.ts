import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("token")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    // Kiểm tra các route cần bảo vệ
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        // Nếu không có token hoặc không phải admin, chuyển hướng về trang login
        if (!currentUser || userRole !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

// Chỉ định các route cần áp dụng middleware
export const config = {
    matcher: ["/dashboard/:path*"],
};
