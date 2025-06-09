"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleAuthHandler() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasHandledLoginRef = useRef(false);

    // Phát hiện xem người dùng vừa đăng nhập bằng Google không
    const isCallbackUrl = searchParams.get("callbackUrl") !== null;
    const isLoginAction = searchParams.get("googleLogin") === "true";

    useEffect(() => {
        // Chỉ xử lý khi:
        // 1. Người dùng đã xác thực thành công
        // 2. Có session với accessToken
        // 3. Chứng tỏ đây là lần đăng nhập mới (có tham số URL đặc biệt)
        // 4. Chưa xử lý login này trước đó
        if (
            status === "authenticated" &&
            session?.accessToken &&
            (isCallbackUrl || isLoginAction) &&
            !hasHandledLoginRef.current
        ) {
            const googleToken = session.accessToken as string;

            // 1. Lưu token vào localStorage
            localStorage.setItem("token", googleToken);
            
            // 2. Phát sự kiện để thông báo Navbar cập nhật trạng thái đăng nhập
            window.dispatchEvent(new Event('auth-state-changed'));

            // 4. Đánh dấu đã xử lý
            hasHandledLoginRef.current = true;

            // 5. Chuyển hướng dựa trên vai trò
            setTimeout(() => {
                // Sử dụng window.location.href thay vì router.push()
                if (session.user?.role === "admin") {
                    // window.location.href = "/dashboard";
                    router.push("/dashboard");
                } else {
                    // window.location.href = "/";
                    router.push("/");
                }
            }, 500);
        }
    }, [session, status, router, isCallbackUrl, isLoginAction]);

    return null;
}
