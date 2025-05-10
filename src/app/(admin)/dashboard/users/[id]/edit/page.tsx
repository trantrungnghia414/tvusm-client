"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "../../../components/DashboardLayout";
import UserForm from "../../components/UserForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { User } from "../../types/userTypes";

export default function EditUserPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const userId = params.id;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Trong thực tế, gọi API để lấy thông tin người dùng
                // const response = await fetchApi(`/admin/users/${userId}`, {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                // const data = await response.json();
                // setUser(data);

                // Dữ liệu mẫu
                setTimeout(() => {
                    const mockUser: User = {
                        id: Number(userId),
                        username: "nguyenvanan",
                        email: "nguyenvan.a@gmail.com",
                        fullname: "Nguyễn Văn An",
                        role: "customer",
                        status: "active",
                        phone: "0987654321",
                        created_at: "2023-10-15T08:30:00Z",
                        is_verified: true,
                        avatar: null,
                    };
                    setUser(mockUser);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error("Không thể tải thông tin người dùng");
                router.push("/dashboard/users");
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId, router]);

    if (loading) {
        return (
            <DashboardLayout activeTab="users">
                <LoadingSpinner message="Đang tải thông tin người dùng..." />
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout activeTab="users">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không tìm thấy thông tin người dùng
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/users")}
                        className="mt-4 text-blue-500 underline"
                    >
                        Quay lại danh sách người dùng
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="users">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chỉnh sửa người dùng</h1>
                <UserForm user={user} isEditMode={true} />
            </div>
        </DashboardLayout>
    );
}
