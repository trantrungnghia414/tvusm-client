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

                // Gọi API để lấy thông tin người dùng thực tế
                const response = await fetchApi(`/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error("Không tìm thấy người dùng");
                        router.push("/dashboard/users");
                        return;
                    }
                    throw new Error("Không thể tải thông tin người dùng");
                }

                const userData = await response.json();

                // Định dạng dữ liệu từ API phù hợp với interface User
                const formattedUser: User = {
                    user_id: userData.user_id,
                    username: userData.username,
                    email: userData.email,
                    fullname:
                        userData.fullname || userData.name || userData.username,
                    role: userData.role,
                    status: userData.is_verified ? "active" : "inactive",
                    phone: userData.phone || null,
                    created_at: userData.created_at,
                    is_verified: userData.is_verified,
                    avatar: userData.avatar || null,
                };

                setUser(formattedUser);
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error("Không thể tải thông tin người dùng");
                router.push("/dashboard/users");
            } finally {
                setLoading(false);
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
