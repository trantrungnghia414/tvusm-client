// client/src/app/(admin)/dashboard/bookings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BookingStats from "./components/BookingStats";
import BookingFilters from "./components/BookingFilters";
import BookingActions from "./components/BookingActions";
import BookingTable from "./components/BookingTable";
import { Booking, BookingStats as BookingStatsType } from "./types/booking";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ✅ Thêm interface cho dữ liệu thô từ API
interface RawBookingData {
    booking_id: number;
    user_id: number;
    court_id: number;
    date?: string;
    booking_date?: string;
    start_time: string;
    end_time: string;
    total_amount?: number;
    total_price?: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
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
        avatar?: string; // ✅ Thêm avatar
    };
    court?: {
        court_id: number;
        name: string;
        type_name?: string;
        venue_name?: string;
        hourly_rate?: number;
        court_type?: {
            name: string;
        };
        venue?: {
            name: string;
        };
    };
}

interface RawCourtData {
    court_id: number;
    name: string;
    type_name?: string;
    court_type?: {
        name: string;
    };
}

interface RawStatsData {
    totalBookings?: number;
    todayBookings?: number;
    pendingBookings?: number;
    totalRevenue?: number;
    monthlyRevenue?: number;
    completionRate?: number;
}

export default function BookingsPage() {
    const router = useRouter();

    // Data states
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStatsType>({
        total_bookings: 0,
        today_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        completion_rate: 0,
    });
    const [courts, setCourts] = useState<
        Array<{ court_id: number; name: string; type_name: string }>
    >([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [courtFilter, setCourtFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch bookings data
    const fetchBookings = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/bookings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách đặt sân");
            }

            const data: RawBookingData[] = await response.json();

            // ✅ Transform data với interface cụ thể
            const transformedBookings: Booking[] = data.map(
                (booking: RawBookingData) => ({
                    booking_id: booking.booking_id,
                    user_id: booking.user_id,
                    court_id: booking.court_id,
                    date: booking.date || booking.booking_date || "",
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    total_amount:
                        booking.total_amount || booking.total_price || 0,
                    status: booking.status,
                    payment_status: booking.payment_status || "pending",
                    notes: booking.notes || "",
                    created_at: booking.created_at,
                    updated_at: booking.updated_at,
                    user: booking.user
                        ? {
                              user_id: booking.user.user_id,
                              username: booking.user.username,
                              email: booking.user.email,
                              fullname:
                                  booking.user.fullname || booking.user.name,
                              phone: booking.user.phone,
                              avatar: booking.user.avatar, // ✅ Thêm avatar
                          }
                        : undefined,
                    court: booking.court
                        ? {
                              court_id: booking.court.court_id,
                              name: booking.court.name,
                              type_name:
                                  booking.court.type_name ||
                                  booking.court.court_type?.name ||
                                  "",
                              venue_name:
                                  booking.court.venue_name ||
                                  booking.court.venue?.name ||
                                  "",
                              hourly_rate: booking.court.hourly_rate || 0,
                          }
                        : undefined,
                })
            );

            setBookings(transformedBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Không thể tải danh sách đặt sân");
            setBookings([]);
        }
    }, [router]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/bookings/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: RawStatsData = await response.json();
                setStats({
                    total_bookings: data.totalBookings || 0,
                    today_bookings: data.todayBookings || 0,
                    pending_bookings: data.pendingBookings || 0,
                    total_revenue: data.totalRevenue || 0,
                    monthly_revenue: data.monthlyRevenue || 0,
                    completion_rate: data.completionRate || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, []);

    // Fetch courts for filter
    const fetchCourts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/courts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: RawCourtData[] = await response.json();
                setCourts(
                    data.map((court: RawCourtData) => ({
                        court_id: court.court_id,
                        name: court.name,
                        type_name:
                            court.type_name || court.court_type?.name || "",
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchBookings(), fetchStats(), fetchCourts()]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchBookings, fetchStats, fetchCourts]);

    // Filter bookings
    const filteredBookings = React.useMemo(() => {
        let result = [...bookings];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (booking) =>
                    booking.user?.fullname?.toLowerCase().includes(search) ||
                    booking.user?.username?.toLowerCase().includes(search) ||
                    booking.user?.email?.toLowerCase().includes(search) ||
                    booking.booking_id.toString().includes(search) ||
                    booking.court?.name?.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (booking) => booking.status === statusFilter
            );
        }

        // Payment status filter
        if (paymentStatusFilter !== "all") {
            result = result.filter(
                (booking) => booking.payment_status === paymentStatusFilter
            );
        }

        // Court filter
        if (courtFilter !== "all") {
            result = result.filter(
                (booking) => booking.court_id.toString() === courtFilter
            );
        }

        // Date filter
        if (dateFilter) {
            const filterDate = dateFilter.toISOString().split("T")[0];
            result = result.filter((booking) =>
                booking.date.startsWith(filterDate)
            );
        }

        return result;
    }, [
        bookings,
        searchTerm,
        statusFilter,
        paymentStatusFilter,
        courtFilter,
        dateFilter,
    ]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchBookings(), fetchStats()]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentStatusFilter("all");
        setCourtFilter("all");
        setDateFilter(undefined);
        toast.success("Đã xóa tất cả bộ lọc");
    };

    // Handle actions
    const handleView = (bookingId: number) => {
        router.push(`/dashboard/bookings/${bookingId}`);
    };

    const handleEdit = (bookingId: number) => {
        router.push(`/dashboard/bookings/${bookingId}/edit`);
    };

    const handleDelete = async (bookingId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa đặt sân");
            }

            toast.success("Xóa đặt sân thành công");
            await fetchBookings();
            await fetchStats();
        } catch (error) {
            console.error("Error deleting booking:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa đặt sân"
            );
        }
    };

    const handleUpdateStatus = async (
        bookingId: number,
        status: "pending" | "confirmed" | "completed" | "cancelled"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/bookings/${bookingId}`, {
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
            await fetchBookings();
            await fetchStats();
        } catch (error) {
            console.error("Error updating booking status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    const handleUpdatePaymentStatus = async (
        bookingId: number,
        paymentStatus: "pending" | "paid" | "refunded"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/bookings/${bookingId}`, {
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
            await fetchBookings();
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

    const handleAddBooking = () => {
        router.push("/dashboard/bookings/add");
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="bookings">
                <LoadingSpinner message="Đang tải danh sách đặt sân..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="bookings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý đặt sân
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý và theo dõi tất cả các đặt sân trong hệ
                            thống
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <BookingStats stats={stats} loading={false} />

                {/* Actions */}
                <BookingActions
                    onAddBooking={handleAddBooking}
                    bookings={filteredBookings}
                    onRefresh={handleRefresh}
                    loading={refreshing}
                />

                {/* Filters */}
                <BookingFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    paymentStatusFilter={paymentStatusFilter}
                    setPaymentStatusFilter={setPaymentStatusFilter}
                    courtFilter={courtFilter}
                    setCourtFilter={setCourtFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    courts={courts}
                    onClearFilters={handleClearFilters}
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Hiển thị {filteredBookings.length} trên{" "}
                        {bookings.length} đặt sân
                    </span>
                    <span>
                        Tổng doanh thu:{" "}
                        {filteredBookings
                            .reduce((sum, booking) => {
                                // ✅ Đảm bảo total_amount là number
                                const amount =
                                    typeof booking.total_amount === "string"
                                        ? parseFloat(booking.total_amount) || 0
                                        : booking.total_amount || 0;
                                return sum + amount;
                            }, 0)
                            .toLocaleString("vi-VN")}
                        đ
                    </span>
                </div>

                {/* Table */}
                <BookingTable
                    bookings={filteredBookings}
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
