"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EquipmentTable from "./components/EquipmentTable";
import EquipmentStats from "./components/EquipmentStats";
import EquipmentActions from "./components/EquipmentActions";
import {
    Equipment,
    EquipmentStats as EquipmentStatsType,
} from "./types/equipmentTypes";
import { Separator } from "@/components/ui/separator";
import { fetchApi } from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EquipmentFilters from "@/app/(admin)/dashboard/equipments/components/EquipmentFilters";

export default function EquipmentPage() {
    const router = useRouter();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState<EquipmentStatsType>({
        total: 0,
        available: 0,
        in_use: 0,
        maintenance: 0,
        unavailable: 0,
        categories_count: 0,
        total_value: 0,
    });

    // Xác nhận xóa
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(
        null
    );

    // Fetch thiết bị
    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/equipment", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách thiết bị");
            }

            const data = await response.json();
            setEquipment(data);
            setFilteredEquipment(data);

            // Tính toán thống kê
            const statsData: EquipmentStatsType = {
                total: data.length,
                available: data.filter(
                    (item: Equipment) => item.status === "available"
                ).length,
                in_use: data.filter(
                    (item: Equipment) => item.status === "in_use"
                ).length,
                maintenance: data.filter(
                    (item: Equipment) => item.status === "maintenance"
                ).length,
                unavailable: data.filter(
                    (item: Equipment) => item.status === "unavailable"
                ).length,
                categories_count: calculateUniqueCategories(data),
                total_value: calculateTotalValue(data),
            };
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching equipment:", error);
            toast.error("Không thể tải danh sách thiết bị");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Hàm tính số lượng danh mục duy nhất
    const calculateUniqueCategories = (equipmentData: Equipment[]) => {
        const uniqueCategories = new Set(
            equipmentData.map((item) => item.category_id)
        );
        return uniqueCategories.size;
    };

    // Hàm tính tổng giá trị thiết bị
    const calculateTotalValue = (equipmentData: Equipment[]) => {
        return equipmentData.reduce((total, item) => {
            return total + (item.purchase_price || 0) * item.quantity;
        }, 0);
    };

    // Hàm lọc thiết bị
    const filterEquipment = useCallback(() => {
        if (!equipment.length) return;

        let result = [...equipment];

        // Lọc theo tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.code.toLowerCase().includes(searchLower)
            );
        }

        // Lọc theo danh mục
        if (categoryFilter !== "all") {
            result = result.filter(
                (item) => item.category_id.toString() === categoryFilter
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((item) => item.status === statusFilter);
        }

        setFilteredEquipment(result);
    }, [equipment, searchTerm, categoryFilter, statusFilter]);

    // Xử lý xóa thiết bị
    const handleDeleteClick = (equipmentId: number) => {
        setEquipmentToDelete(equipmentId);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!equipmentToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/equipment/${equipmentToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa thiết bị");
            }

            // Cập nhật state
            const updatedEquipment = equipment.filter(
                (item) => item.equipment_id !== equipmentToDelete
            );

            // Cập nhật cả equipment và filteredEquipment
            setEquipment(updatedEquipment);
            setFilteredEquipment(updatedEquipment);

            // Cập nhật lại thống kê nếu đây là thiết bị cuối cùng
            if (updatedEquipment.length === 0) {
                setStats({
                    total: 0,
                    available: 0,
                    in_use: 0,
                    maintenance: 0,
                    unavailable: 0,
                    categories_count: 0,
                    total_value: 0,
                });
            }

            toast.success("Xóa thiết bị thành công");
        } catch (error) {
            console.error("Error deleting equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa thiết bị"
            );
        } finally {
            setConfirmDeleteOpen(false);
            setEquipmentToDelete(null);
        }
    };

    // Điều hướng đến trang thêm thiết bị
    const handleAddEquipment = () => {
        router.push("/dashboard/equipments/add");
    };

    // Điều hướng đến trang chỉnh sửa thiết bị
    const handleEditEquipment = (equipmentId: number) => {
        router.push(`/dashboard/equipments/${equipmentId}/edit`);
    };

    // Điều hướng đến trang xem thiết bị
    const handleViewEquipment = (equipmentId: number) => {
        router.push(`/dashboard/equipments/${equipmentId}`);
    };

    // Cập nhật trạng thái thiết bị
    const handleUpdateStatus = async (
        equipmentId: number,
        newStatus: string
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/equipment/${equipmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            // Cập nhật state
            setEquipment(
                equipment.map((item) =>
                    item.equipment_id === equipmentId
                        ? {
                              ...item,
                              status: newStatus as
                                  | "available"
                                  | "in_use"
                                  | "maintenance"
                                  | "unavailable",
                          }
                        : item
                )
            );

            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating equipment status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    // Lọc dữ liệu khi các filter thay đổi
    useEffect(() => {
        filterEquipment();
    }, [filterEquipment]);

    return (
        <DashboardLayout activeTab="equipments">
            <div className="space-y-6">
                {/* Tiêu đề và nút thêm mới */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
                    <EquipmentActions
                        onAddEquipment={handleAddEquipment}
                        equipments={filteredEquipment}
                    />
                </div>

                {/* Thống kê nhanh */}
                <EquipmentStats stats={stats} />

                <Separator />

                {/* Bộ lọc */}
                <EquipmentFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Bảng danh sách */}
                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách thiết bị..." />
                ) : (
                    <EquipmentTable
                        equipments={filteredEquipment}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditEquipment}
                        onView={handleViewEquipment}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}

                {/* Dialog xác nhận xóa */}
                <AlertDialog
                    open={confirmDeleteOpen}
                    onOpenChange={setConfirmDeleteOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Xác nhận xóa thiết bị
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa thiết bị này? Hành
                                động này không thể hoàn tác và tất cả dữ liệu
                                liên quan cũng sẽ bị xóa.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
