// trang quản lý thuê thiết bị
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RentalStats from "./components/RentalStats";
import RentalFilters from "./components/RentalFilters";
import RentalActions from "./components/RentalActions";
import RentalTable from "./components/RentalTable";
import {
    Rental,
    RentalStats as RentalStatsType,
    Equipment,
} from "./types/rental";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Raw data interfaces for API responses
interface RawRentalData {
    rental_id: number;
    user_id: number;
    equipment_id: number;
    quantity: number;
    start_date: string;
    end_date: string;
    total_amount: number;
    status:
        | "pending"
        | "approved"
        | "active"
        | "returned"
        | "cancelled"
        | "overdue";
    payment_status?: "pending" | "paid" | "refunded";
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: {
        user_id: number;
        username: string;
        email: string;
        fullname?: string;
        name?: string;
        phone?: string;
    };
    equipment?: {
        equipment_id: number;
        name: string;
        code: string;
        category_name?: string;
        rental_fee: number;
        available_quantity: number;
        status: string;
        image?: string;
        category?: {
            name: string;
        };
    };
}

interface RawStatsData {
    totalRentals?: number;
    activeRentals?: number;
    pendingRentals?: number;
    overdueRentals?: number;
    totalRevenue?: number;
    monthlyRevenue?: number;
    equipmentUtilization?: number;
}

interface RawEquipmentData {
    equipment_id: number;
    name: string;
    code: string;
    category_name?: string;
    rental_fee: number;
    available_quantity: number;
    status: string;
    category?: {
        name: string;
    };
}

export default function RentalsPage() {
    const router = useRouter();

    // Data states
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [stats, setStats] = useState<RentalStatsType>({
        total_rentals: 0,
        active_rentals: 0,
        pending_rentals: 0,
        overdue_rentals: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        equipment_utilization: 0,
    });
    const [equipments, setEquipments] = useState<Equipment[]>([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [equipmentFilter, setEquipmentFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch rentals data
    const fetchRentals = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/rentals", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách thuê thiết bị");
            }

            const data: RawRentalData[] = await response.json();

            // ✅ Transform data với kiểu dữ liệu cụ thể
            const transformedRentals: Rental[] = data.map(
                (rental: RawRentalData) => ({
                    rental_id: rental.rental_id,
                    user_id: rental.user_id,
                    equipment_id: rental.equipment_id,
                    quantity: rental.quantity,
                    start_date: rental.start_date,
                    end_date: rental.end_date,
                    total_amount: rental.total_amount,
                    status: rental.status,
                    payment_status: rental.payment_status || "pending",
                    notes: rental.notes || "",
                    created_at: rental.created_at,
                    updated_at: rental.updated_at,
                    user: rental.user
                        ? {
                              user_id: rental.user.user_id,
                              username: rental.user.username,
                              email: rental.user.email,
                              fullname:
                                  rental.user.fullname || rental.user.name,
                              phone: rental.user.phone,
                          }
                        : undefined,
                    equipment: rental.equipment
                        ? {
                              equipment_id: rental.equipment.equipment_id,
                              name: rental.equipment.name,
                              code: rental.equipment.code,
                              category_name:
                                  rental.equipment.category_name ||
                                  rental.equipment.category?.name ||
                                  "",
                              rental_fee: rental.equipment.rental_fee,
                              available_quantity:
                                  rental.equipment.available_quantity,
                              // ✅ Thay thế 'as any' bằng type assertion cụ thể
                              status: rental.equipment
                                  .status as Equipment["status"],
                              image: rental.equipment.image,
                          }
                        : undefined,
                })
            );

            setRentals(transformedRentals);
        } catch (error) {
            console.error("Error fetching rentals:", error);
            toast.error("Không thể tải danh sách thuê thiết bị");
            setRentals([]);
        }
    }, [router]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/rentals/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: RawStatsData = await response.json();
                setStats({
                    total_rentals: data.totalRentals || 0,
                    active_rentals: data.activeRentals || 0,
                    pending_rentals: data.pendingRentals || 0,
                    overdue_rentals: data.overdueRentals || 0,
                    total_revenue: data.totalRevenue || 0,
                    monthly_revenue: data.monthlyRevenue || 0,
                    equipment_utilization: data.equipmentUtilization || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, []);

    // Fetch equipments for filter
    const fetchEquipments = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/equipment", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: RawEquipmentData[] = await response.json();
                setEquipments(
                    data
                        .filter(
                            (eq) =>
                                eq.status === "available" &&
                                eq.available_quantity > 0
                        )
                        .map((equipment: RawEquipmentData) => ({
                            equipment_id: equipment.equipment_id,
                            name: equipment.name,
                            code: equipment.code,
                            category_name:
                                equipment.category_name ||
                                equipment.category?.name ||
                                "",
                            rental_fee: equipment.rental_fee,
                            available_quantity: equipment.available_quantity,
                            // ✅ Thay thế 'as any' bằng type assertion cụ thể
                            status: equipment.status as Equipment["status"],
                        }))
                );
            }
        } catch (error) {
            console.error("Error fetching equipments:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchRentals(),
                fetchStats(),
                fetchEquipments(),
            ]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchRentals, fetchStats, fetchEquipments]);

    // Filter rentals
    const filteredRentals = React.useMemo(() => {
        let result = [...rentals];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (rental) =>
                    rental.user?.fullname?.toLowerCase().includes(search) ||
                    rental.user?.username?.toLowerCase().includes(search) ||
                    rental.user?.email?.toLowerCase().includes(search) ||
                    rental.rental_id.toString().includes(search) ||
                    rental.equipment?.name?.toLowerCase().includes(search) ||
                    rental.equipment?.code?.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((rental) => rental.status === statusFilter);
        }

        // Payment status filter
        if (paymentStatusFilter !== "all") {
            result = result.filter(
                (rental) => rental.payment_status === paymentStatusFilter
            );
        }

        // Equipment filter
        if (equipmentFilter !== "all") {
            result = result.filter(
                (rental) => rental.equipment_id.toString() === equipmentFilter
            );
        }

        // Date filter
        if (dateFilter) {
            const filterDate = dateFilter.toISOString().split("T")[0];
            result = result.filter((rental) =>
                rental.start_date.startsWith(filterDate)
            );
        }

        return result;
    }, [
        rentals,
        searchTerm,
        statusFilter,
        paymentStatusFilter,
        equipmentFilter,
        dateFilter,
    ]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchRentals(), fetchStats()]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentStatusFilter("all");
        setEquipmentFilter("all");
        setDateFilter(undefined);
        toast.success("Đã xóa tất cả bộ lọc");
    };

    // Handle actions
    const handleView = (rentalId: number) => {
        router.push(`/dashboard/rentals/${rentalId}`);
    };

    const handleEdit = (rentalId: number) => {
        router.push(`/dashboard/rentals/${rentalId}/edit`);
    };

    const handleDelete = async (rentalId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/rentals/${rentalId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể xóa thuê thiết bị"
                );
            }

            toast.success("Xóa thuê thiết bị thành công");
            await fetchRentals();
            await fetchStats();
        } catch (error) {
            console.error("Error deleting rental:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa thuê thiết bị"
            );
        }
    };

    const handleUpdateStatus = async (
        rentalId: number,
        status:
            | "pending"
            | "approved"
            | "active"
            | "returned"
            | "cancelled"
            | "overdue"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/rentals/${rentalId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            toast.success("Cập nhật trạng thái thành công");
            await fetchRentals();
            await fetchStats();
        } catch (error) {
            console.error("Error updating rental status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    const handleUpdatePaymentStatus = async (
        rentalId: number,
        paymentStatus: "pending" | "paid" | "refunded"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/rentals/${rentalId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ payment_status: paymentStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật trạng thái thanh toán"
                );
            }

            toast.success("Cập nhật trạng thái thanh toán thành công");
            await fetchRentals();
            await fetchStats();
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái thanh toán"
            );
        }
    };

    const handleAddRental = () => {
        router.push("/dashboard/rentals/add");
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="rentals">
                <LoadingSpinner message="Đang tải danh sách thuê thiết bị..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="rentals">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý thuê thiết bị
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý và theo dõi tất cả các đơn thuê thiết bị
                            trong hệ thống
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <RentalStats stats={stats} loading={false} />

                {/* Actions */}
                <RentalActions
                    onAddRental={handleAddRental}
                    rentals={filteredRentals}
                    onRefresh={handleRefresh}
                    loading={refreshing}
                />

                {/* Filters */}
                <RentalFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    paymentStatusFilter={paymentStatusFilter}
                    setPaymentStatusFilter={setPaymentStatusFilter}
                    equipmentFilter={equipmentFilter}
                    setEquipmentFilter={setEquipmentFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    equipments={equipments}
                    onClearFilters={handleClearFilters}
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Hiển thị {filteredRentals.length} trên {rentals.length}{" "}
                        đơn thuê
                    </span>
                    <span>
                        Tổng doanh thu:{" "}
                        {filteredRentals
                            .reduce(
                                (sum, rental) => sum + rental.total_amount,
                                0
                            )
                            .toLocaleString("vi-VN")}
                        đ
                    </span>
                </div>

                {/* Table */}
                <RentalTable
                    rentals={filteredRentals}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdatePaymentStatus={handleUpdatePaymentStatus}
                    loading={false}
                />
            </div>
        </DashboardLayout>
    );
}
