"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "../components/DashboardLayout";
import EquipmentTable from "./components/EquipmentTable";

import { Equipment, EquipmentStats as StatsType } from "./types/equipmentTypes";
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
import EquipmentFilters from "@/app/(admin)/dashboard/equipment/components/EquipmentFilters";
import EquipmentStats from "@/app/(admin)/dashboard/equipment/components/EquipmentStats";
import EquipmentActions from "@/app/(admin)/dashboard/equipment/components/EquipmentActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EquipmentPage() {
    // States
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [venueFilter, setVenueFilter] = useState<string>("all");
    const [stats, setStats] = useState<StatsType>({
        totalEquipment: 0,
        availableEquipment: 0,
        maintenanceEquipment: 0,
        unavailableEquipment: 0,
        inUseEquipment: 0,
    });

    const router = useRouter();

    // Fetch danh sách thiết bị
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

            // Tính toán số liệu thống kê
            const statsData: StatsType = {
                totalEquipment: data.length,
                availableEquipment: data.filter(
                    (item: Equipment) => item.status === "available"
                ).length,
                maintenanceEquipment: data.filter(
                    (item: Equipment) => item.status === "maintenance"
                ).length,
                unavailableEquipment: data.filter(
                    (item: Equipment) => item.status === "unavailable"
                ).length,
                inUseEquipment: data.filter(
                    (item: Equipment) => item.status === "in_use"
                ).length,
            };
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching equipment:", error);
            toast.error("Không thể tải danh sách thiết bị");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Lọc thiết bị theo các tiêu chí
    useEffect(() => {
        let result = [...equipment];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchLower) ||
                    item.code.toLowerCase().includes(searchLower) ||
                    (item.description?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (item.category_name?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (item.venue_name?.toLowerCase() || "").includes(searchLower)
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

        // Lọc theo nhà thi đấu
        if (venueFilter !== "all") {
            if (venueFilter === "none") {
                // Lọc các thiết bị không thuộc nhà thi đấu nào
                result = result.filter((item) => item.venue_id === null);
            } else {
                result = result.filter(
                    (item) => item.venue_id?.toString() === venueFilter
                );
            }
        }

        setFilteredEquipment(result);
    }, [equipment, searchTerm, categoryFilter, statusFilter, venueFilter]);

    // Lấy danh sách thiết bị khi component mount
    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    // Xử lý xóa thiết bị
    const handleDeleteEquipment = (equipmentId: number) => {
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

            // Gọi API để xóa thiết bị
            const response = await fetchApi(`/equipment/${equipmentToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa thiết bị");
            }

            // Cập nhật danh sách sau khi xóa
            setEquipment(
                equipment.filter(
                    (item) => item.equipment_id !== equipmentToDelete
                )
            );
            toast.success("Xóa thiết bị thành công");
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("Error deleting equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa thiết bị"
            );
        }
    };

    // Xử lý thay đổi trạng thái thiết bị
    const handleUpdateStatus = async (
        equipmentId: number,
        newStatus: "available" | "maintenance" | "unavailable"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái thiết bị
            const response = await fetchApi(
                `/equipment/${equipmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật trạng thái thiết bị"
                );
            }

            // Cập nhật danh sách sau khi thay đổi trạng thái
            setEquipment(
                equipment.map((item) =>
                    item.equipment_id === equipmentId
                        ? { ...item, status: newStatus }
                        : item
                )
            );
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating equipment status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái thiết bị"
            );
        }
    };

    // Điều hướng đến trang thêm thiết bị
    const handleAddEquipment = () => {
        router.push("/dashboard/equipment/add");
    };

    // Điều hướng đến trang chỉnh sửa thiết bị
    const handleEditEquipment = (equipmentId: number) => {
        router.push(`/dashboard/equipment/${equipmentId}/edit`);
    };

    return (
        <DashboardLayout activeTab="equipment">
            <div className="space-y-6">
                {/* Tiêu đề và nút thêm mới */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
                    <EquipmentActions
                        onAddEquipment={handleAddEquipment}
                        equipment={filteredEquipment}
                    />
                </div>

                {/* Thống kê thiết bị */}
                <EquipmentStats stats={stats} />

                {/* Bộ lọc */}
                <EquipmentFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    venueFilter={venueFilter}
                    setVenueFilter={setVenueFilter}
                />

                {/* Bảng danh sách thiết bị */}
                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách thiết bị..." />
                ) : (
                    <EquipmentTable
                        equipment={filteredEquipment}
                        onEdit={handleEditEquipment}
                        onDelete={handleDeleteEquipment}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
            </div>

            {/* Dialog xác nhận xóa thiết bị */}
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
                            Bạn có chắc chắn muốn xóa thiết bị này? Hành động
                            này không thể hoàn tác.
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
        </DashboardLayout>
    );
}
