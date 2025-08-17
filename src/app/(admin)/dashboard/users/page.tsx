// trang quản lý người dùng
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "../components/DashboardLayout";
import UserTable from "./components/UserTable";
import UserFilters from "./components/UserFilters";
import UserActions from "./components/UserActions";
import { User } from "./types/userTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface UserApiResponse {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    name?: string;
    role: string;
    is_verified: boolean;
    phone?: string;
    created_at: string;
    avatar?: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const router = useRouter();

    // Lấy danh sách người dùng từ API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Gọi API để lấy danh sách người dùng thật
                const response = await fetchApi("/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách người dùng");
                }

                const data = await response.json();

                // Chuyển đổi dữ liệu từ API sang định dạng User[]
                const formattedUsers: User[] = data.map(
                    (user: UserApiResponse) => ({
                        user_id: user.user_id,
                        username: user.username,
                        email: user.email,
                        fullname: user.fullname || user.name || user.username,
                        role: user.role,
                        status: user.is_verified ? "active" : "inactive",
                        phone: user.phone,
                        created_at: user.created_at,
                        is_verified: user.is_verified,
                        avatar: user.avatar,
                    })
                );

                setUsers(formattedUsers);
                setFilteredUsers(formattedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Không thể tải danh sách người dùng");

                // Nếu có lỗi 403 (Forbidden), có thể người dùng không có quyền admin
                if (error instanceof Response && error.status === 403) {
                    toast.error("Bạn không có quyền truy cập vào trang này");
                    router.push("/");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    // Lọc người dùng theo các tiêu chí
    useEffect(() => {
        let result = [...users];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    (user.fullname?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (user.phone && user.phone.includes(searchTerm))
            );
        }

        // Lọc theo vai trò
        if (roleFilter !== "all") {
            result = result.filter((user) => user.role === roleFilter);
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            const isActive = statusFilter === "active";
            result = result.filter((user) => {
                if (isActive) {
                    return user.status === "active" && user.is_verified;
                } else {
                    return user.status === "inactive" || !user.is_verified;
                }
            });
        }

        setFilteredUsers(result);
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa người dùng
            const response = await fetchApi(`/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể xóa người dùng"
                );
            }

            // Cập nhật danh sách người dùng sau khi xóa
            setUsers(users.filter((user) => user.user_id !== userId));
            toast.success("Xóa người dùng thành công");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa người dùng"
            );
        }
    };

    // Xử lý thay đổi trạng thái người dùng
    const handleToggleUserStatus = async (
        userId: number,
        newStatus: string
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái người dùng
            const response = await fetchApi(`/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật trạng thái người dùng"
                );
            }

            // Cập nhật danh sách người dùng sau khi thay đổi trạng thái
            setUsers(
                users.map((user) =>
                    user.user_id === userId
                        ? {
                              ...user,
                              status: newStatus as "active" | "inactive",
                          }
                        : user
                )
            );
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating user status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái người dùng"
            );
        }
    };

    // Xử lý thêm người dùng mới
    const handleAddUser = () => {
        router.push("/dashboard/users/add");
    };

    // Xử lý chỉnh sửa thông tin người dùng
    const handleEditUser = (userId: number) => {
        router.push(`/dashboard/users/${userId}/edit`);
    };

    return (
        <DashboardLayout activeTab="users">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                    <UserActions onAddUser={handleAddUser} users={filteredUsers} />
                </div>

                <UserFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách người dùng..." />
                ) : (
                    <UserTable
                        users={filteredUsers}
                        onDelete={handleDeleteUser}
                        onToggleStatus={handleToggleUserStatus}
                        onEdit={handleEditUser}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
