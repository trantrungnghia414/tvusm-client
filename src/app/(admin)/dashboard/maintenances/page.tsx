// trang quản lý bảo trì
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MaintenanceStats from "./components/MaintenanceStats";
import MaintenanceFilters from "./components/MaintenanceFilters";
import MaintenanceActions from "./components/MaintenanceActions";
import MaintenanceTable from "./components/MaintenanceTable";
import {
    Maintenance,
    MaintenanceStats as MaintenanceStatsType,
    VenueOption,
    UserOption,
} from "./types/maintenance";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MaintenancesPage() {
    const router = useRouter();

    // Data states
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [stats, setStats] = useState<MaintenanceStatsType>({
        total_maintenances: 0,
        scheduled_count: 0,
        in_progress_count: 0,
        completed_count: 0,
        overdue_count: 0,
        high_priority_count: 0,
        total_estimated_cost: 0,
        total_actual_cost: 0,
        average_completion_time: 0,
        this_month_count: 0,
        completed_on_time_rate: 0,
        preventive_percentage: 0,
    });
    const [venues, setVenues] = useState<VenueOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [venueFilter, setVenueFilter] = useState("all");
    const [assignedFilter, setAssignedFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch maintenances data
    const fetchMaintenances = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/maintenances", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách bảo trì");
            }

            const data = await response.json();
            setMaintenances(data);
        } catch (error) {
            console.error("Error fetching maintenances:", error);
            toast.error("Không thể tải danh sách bảo trì");
            setMaintenances([]);
        }
    }, [router]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/maintenances/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching maintenance stats:", error);
        }
    }, []);

    // Fetch dropdown data
    const fetchDropdownData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const [venuesRes, usersRes] = await Promise.all([
                fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi("/users", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (venuesRes.ok) {
                const venuesData = await venuesRes.json();
                setVenues(venuesData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(
                    // ✅ Fix Line 126: Thay thế any bằng UserOption với type assertion
                    usersData.filter((user: UserOption) =>
                        ["admin", "staff", "technician"].includes(user.role)
                    )
                );
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchMaintenances(),
                fetchStats(),
                fetchDropdownData(),
            ]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchMaintenances, fetchStats, fetchDropdownData]);

    // Filter maintenances
    const filteredMaintenances = React.useMemo(() => {
        let result = [...maintenances];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (maintenance) =>
                    maintenance.title.toLowerCase().includes(search) ||
                    maintenance.description?.toLowerCase().includes(search) ||
                    maintenance.maintenance_id.toString().includes(search)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (maintenance) => maintenance.status === statusFilter
            );
        }

        // Priority filter
        if (priorityFilter !== "all") {
            result = result.filter(
                (maintenance) => maintenance.priority === priorityFilter
            );
        }

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter(
                (maintenance) => maintenance.type === typeFilter
            );
        }

        // Venue filter
        if (venueFilter !== "all") {
            result = result.filter(
                (maintenance) =>
                    maintenance.venue_id?.toString() === venueFilter
            );
        }

        // Assigned user filter
        if (assignedFilter !== "all") {
            if (assignedFilter === "unassigned") {
                result = result.filter(
                    (maintenance) => !maintenance.assigned_to
                );
            } else {
                result = result.filter(
                    (maintenance) =>
                        maintenance.assigned_to?.toString() === assignedFilter
                );
            }
        }

        // Date filter
        if (dateFilter) {
            const filterDate = dateFilter.toISOString().split("T")[0];
            result = result.filter((maintenance) =>
                maintenance.scheduled_date.startsWith(filterDate)
            );
        }

        return result;
    }, [
        maintenances,
        searchTerm,
        statusFilter,
        priorityFilter,
        typeFilter,
        venueFilter,
        assignedFilter,
        dateFilter,
    ]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchMaintenances(), fetchStats()]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPriorityFilter("all");
        setTypeFilter("all");
        setVenueFilter("all");
        setAssignedFilter("all");
        setDateFilter(undefined);
        toast.success("Đã xóa tất cả bộ lọc");
    };

    // Handle actions
    const handleView = (maintenanceId: number) => {
        router.push(`/dashboard/maintenances/${maintenanceId}`);
    };

    const handleEdit = (maintenanceId: number) => {
        if (maintenanceId === 0) {
            router.push("/dashboard/maintenances/add");
        } else {
            router.push(`/dashboard/maintenances/${maintenanceId}/edit`);
        }
    };

    const handleDelete = async (maintenanceId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/maintenances/${maintenanceId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa bảo trì");
            }

            toast.success("Xóa bảo trì thành công");
            await fetchMaintenances();
            await fetchStats();
        } catch (error) {
            console.error("Error deleting maintenance:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa bảo trì"
            );
        }
    };

    // ✅ Fix Line 304: Tạo interface cho updateData
    interface MaintenanceUpdateData {
        status: Maintenance["status"];
        started_date?: string;
        completed_date?: string;
    }

    const handleUpdateStatus = async (
        maintenanceId: number,
        status: Maintenance["status"]
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // ✅ Fix: Thay thế any bằng MaintenanceUpdateData
            const updateData: MaintenanceUpdateData = { status };

            // Set timestamps based on status
            if (
                status === "in_progress" &&
                !maintenances.find((m) => m.maintenance_id === maintenanceId)
                    ?.started_date
            ) {
                updateData.started_date = new Date().toISOString();
            }
            if (status === "completed") {
                updateData.completed_date = new Date().toISOString();
            }

            const response = await fetchApi(`/maintenances/${maintenanceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            toast.success("Cập nhật trạng thái thành công");
            await fetchMaintenances();
            await fetchStats();
        } catch (error) {
            console.error("Error updating maintenance status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="maintenances">
                <LoadingSpinner message="Đang tải danh sách bảo trì..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="maintenances">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý bảo trì
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Theo dõi và quản lý tất cả các hoạt động bảo trì cơ
                            sở vật chất
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <MaintenanceStats stats={stats} loading={false} />

                {/* Actions */}
                <MaintenanceActions
                    maintenances={filteredMaintenances}
                    onRefresh={handleRefresh}
                    loading={refreshing}
                />

                {/* Filters */}
                <MaintenanceFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    venueFilter={venueFilter}
                    setVenueFilter={setVenueFilter}
                    assignedFilter={assignedFilter}
                    setAssignedFilter={setAssignedFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    venues={venues}
                    users={users}
                    onClearFilters={handleClearFilters}
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Hiển thị {filteredMaintenances.length} trên{" "}
                        {maintenances.length} bảo trì
                    </span>
                    <span>
                        Chi phí ước tính:{" "}
                        {formatCurrency(
                            filteredMaintenances.reduce(
                                (sum, maintenance) =>
                                    sum + (maintenance.estimated_cost || 0),
                                0
                            )
                        )}
                    </span>
                </div>

                {/* Table */}
                <MaintenanceTable
                    maintenances={filteredMaintenances}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    loading={false}
                />
            </div>
        </DashboardLayout>
    );
}
