"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi("/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể xác thực người dùng");
                }

                const userData = await response.json();

                if (userData.role !== "admin") {
                    toast.error("Bạn không có quyền truy cập trang quản trị");
                    router.push("/");
                    return;
                }

                setAuthorized(true);
            } catch (error) {
                console.error("Auth error:", error);
                toast.error("Phiên đăng nhập hết hạn hoặc không hợp lệ");
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">
                        Đang xác thực quyền admin...
                    </p>
                </div>
            </div>
        );
    }

    return authorized ? children : null;
}
