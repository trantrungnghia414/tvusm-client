// trang quản lý thanh toán
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PaymentStats from "./components/PaymentStats";
import PaymentFilters from "./components/PaymentFilters";
import PaymentActions from "./components/PaymentActions";
import PaymentTable from "./components/PaymentTable";
import {
    Payment,
    PaymentStats as PaymentStatsType,
    CreatePaymentDto,
} from "./types/payment";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils"; // ✅ Thêm import formatCurrency

// Raw data interfaces for API responses
interface CourtType {
    type_id: number;
    name: string;
    description?: string;
    standard_size?: string;
    image?: string;
}

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    venue_id: number;
    venue_name?: string;
    type_name?: string;
    description?: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    is_indoor: boolean;
    image?: string;
    court_level?: number;
}

interface RawPaymentData {
    payment_id: number;
    booking_id?: number;
    rental_id?: number;
    user_id: number;
    amount: number;
    payment_method: string;
    status: string;
    transaction_id?: string;
    gateway_response?: string;
    notes?: string;
    paid_at?: string;
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
    booking?: {
        booking_id: number;
        court_name: string;
        booking_date: string;
        start_time: string;
        end_time: string;
        court?: {
            court_id: number;
            name: string;
            code: string;
            type_id: number;
        };
    };
    rental?: {
        rental_id: number;
        equipment_name: string;
        start_date: string;
        end_date: string;
        quantity: number;
    };
}

interface RawStatsData {
    totalPayments?: number;
    totalAmount?: number;
    pendingPayments?: number;
    pendingAmount?: number;
    completedPayments?: number;
    completedAmount?: number;
    failedPayments?: number;
    refundedAmount?: number;
    todayRevenue?: number;
    monthlyRevenue?: number;
    cashPayments?: number;
    onlinePayments?: number;
}

// ✅ Thêm interface cho update data
interface UpdatePaymentData {
    status: Payment["status"];
    paid_at?: string;
}

export default function PaymentsPage() {
    const router = useRouter();

    // Data states
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStatsType>({
        total_payments: 0,
        total_amount: 0,
        pending_payments: 0,
        pending_amount: 0,
        completed_payments: 0,
        completed_amount: 0,
        failed_payments: 0,
        refunded_amount: 0,
        today_revenue: 0,
        monthly_revenue: 0,
        cash_payments: 0,
        online_payments: 0,
    });

    // Filter states - New design (removed quickFilter)
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [timeSlotFilter, setTimeSlotFilter] = useState("all");
    const [courtTypeFilter, setCourtTypeFilter] = useState("all");
    const [courtFilter, setCourtFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Data for filters
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch court types
    const fetchCourtTypes = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/court-types", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCourtTypes(data);
            }
        } catch (error) {
            console.error("Error fetching court types:", error);
        }
    }, []);

    // Fetch courts
    const fetchCourts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/courts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCourts(data);
            }
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    }, []);

    // Fetch payments data
    const fetchPayments = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/payments", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách thanh toán");
            }

            const data: RawPaymentData[] = await response.json();

            // Transform data to match interface
            const transformedPayments: Payment[] = data.map(
                (payment: RawPaymentData) => ({
                    payment_id: payment.payment_id,
                    booking_id: payment.booking_id,
                    rental_id: payment.rental_id,
                    user_id: payment.user_id,
                    amount: payment.amount,
                    payment_method:
                        payment.payment_method as Payment["payment_method"],
                    status: payment.status as Payment["status"],
                    transaction_id: payment.transaction_id,
                    gateway_response: payment.gateway_response,
                    notes: payment.notes,
                    paid_at: payment.paid_at,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                    user: payment.user
                        ? {
                              user_id: payment.user.user_id,
                              username: payment.user.username,
                              email: payment.user.email,
                              fullname:
                                  payment.user.fullname || payment.user.name,
                              phone: payment.user.phone,
                          }
                        : undefined,
                    booking: payment.booking,
                    rental: payment.rental,
                })
            );

            setPayments(transformedPayments);
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Không thể tải danh sách thanh toán");
            setPayments([]);
        }
    }, [router]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/payments/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data: RawStatsData = await response.json();
                setStats({
                    total_payments: data.totalPayments || 0,
                    total_amount: data.totalAmount || 0,
                    pending_payments: data.pendingPayments || 0,
                    pending_amount: data.pendingAmount || 0,
                    completed_payments: data.completedPayments || 0,
                    completed_amount: data.completedAmount || 0,
                    failed_payments: data.failedPayments || 0,
                    refunded_amount: data.refundedAmount || 0,
                    today_revenue: data.todayRevenue || 0,
                    monthly_revenue: data.monthlyRevenue || 0,
                    cash_payments: data.cashPayments || 0,
                    online_payments: data.onlinePayments || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching payment stats:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchPayments(),
                fetchStats(),
                fetchCourtTypes(),
                fetchCourts(),
            ]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchPayments, fetchStats, fetchCourtTypes, fetchCourts]);

    // Helper function để kiểm tra time slot (cải tiến cho format mới)
    const isInTimeSlot = (startTime: string, endTime: string, slot: string) => {
        if (slot === "all") return true;

        // Xử lý format mới: "06:00-07:00"
        if (slot.includes("-")) {
            const [slotStart, slotEnd] = slot.split("-");
            const [slotStartHour] = slotStart.split(":").map(Number);
            const [slotEndHour] = slotEnd.split(":").map(Number);

            const [bookingStartHour] = startTime.split(":").map(Number);
            const [bookingEndHour] = endTime.split(":").map(Number);

            // Kiểm tra xem booking có overlap với time slot không
            return (
                (bookingStartHour >= slotStartHour &&
                    bookingStartHour < slotEndHour) ||
                (bookingEndHour > slotStartHour &&
                    bookingEndHour <= slotEndHour) ||
                (bookingStartHour <= slotStartHour &&
                    bookingEndHour >= slotEndHour)
            );
        }

        // Fallback cho format cũ (để backward compatibility)
        const start = parseInt(startTime.split(":")[0]);
        const end = parseInt(endTime.split(":")[0]);

        switch (slot) {
            case "morning":
                return start >= 6 && start < 12;
            case "afternoon":
                return start >= 12 && start < 18;
            case "evening":
                return start >= 18 && start < 22;
            case "current": {
                const currentHour = new Date().getHours();
                return start <= currentHour && currentHour < end;
            }
            default:
                return true;
        }
    };

    // Filter payments với logic mới (đúng thứ tự: ngày → giờ → loại sân → sân → phương thức → trạng thái)
    const filteredPayments = React.useMemo(() => {
        let result = [...payments];

        // Chỉ lấy booking payments
        result = result.filter((payment) => payment.booking_id);

        // 1. Date filter (cải thiện xử lý timezone)
        if (dateFilter) {
            // Tạo ngày theo timezone địa phương để tránh lỗi chênh lệch múi giờ
            const year = dateFilter.getFullYear();
            const month = String(dateFilter.getMonth() + 1).padStart(2, "0");
            const day = String(dateFilter.getDate()).padStart(2, "0");
            const filterDateString = `${year}-${month}-${day}`;

            result = result.filter((payment) => {
                if (payment.booking) {
                    const bookingDate =
                        payment.booking.booking_date.split("T")[0];
                    return bookingDate === filterDateString;
                }
                return false;
            });
        }

        // 2. Time slot filter
        if (timeSlotFilter !== "all") {
            result = result.filter((payment) => {
                if (payment.booking) {
                    return isInTimeSlot(
                        payment.booking.start_time,
                        payment.booking.end_time,
                        timeSlotFilter
                    );
                }
                return false;
            });
        }

        // 3. Court Type filter
        if (courtTypeFilter !== "all") {
            result = result.filter((payment) => {
                if (payment.booking) {
                    // Ưu tiên sử dụng booking.court nếu có
                    if (payment.booking.court) {
                        return (
                            payment.booking.court.type_id.toString() ===
                            courtTypeFilter
                        );
                    }
                    // Fallback: tìm court bằng court_name
                    else if (payment.booking.court_name) {
                        const court = courts.find(
                            (c) => c.name === payment.booking!.court_name
                        );
                        return (
                            court &&
                            court.type_id.toString() === courtTypeFilter
                        );
                    }
                }
                return false;
            });
        }

        // 4. Court filter
        if (courtFilter !== "all") {
            result = result.filter((payment) => {
                if (payment.booking) {
                    // Ưu tiên sử dụng booking.court nếu có
                    if (payment.booking.court) {
                        return (
                            payment.booking.court.court_id.toString() ===
                            courtFilter
                        );
                    }
                    // Fallback: tìm court bằng court_name
                    else if (payment.booking.court_name) {
                        const court = courts.find(
                            (c) => c.name === payment.booking!.court_name
                        );
                        return (
                            court && court.court_id.toString() === courtFilter
                        );
                    }
                }
                return false;
            });
        }

        // 5. Method filter
        if (methodFilter !== "all") {
            result = result.filter(
                (payment) => payment.payment_method === methodFilter
            );
        }

        // 6. Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (payment) => payment.status === statusFilter
            );
        }

        return result;
    }, [
        payments,
        dateFilter,
        timeSlotFilter,
        courtTypeFilter,
        courtFilter,
        methodFilter,
        statusFilter,
        courts,
    ]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchPayments(), fetchStats()]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setDateFilter(undefined);
        setTimeSlotFilter("all");
        setCourtTypeFilter("all");
        setCourtFilter("all");
        setMethodFilter("all");
        setStatusFilter("all");
        toast.success("Đã xóa tất cả bộ lọc");
    };

    // Handle actions
    const handleView = (paymentId: number) => {
        router.push(`/dashboard/payments/${paymentId}`);
    };

    // ✅ Sửa lỗi: Sử dụng parameter để tránh unused variable
    const handleEdit = (paymentId: number) => {
        // Implement edit functionality
        console.log("Editing payment:", paymentId);
        toast.info("Tính năng chỉnh sửa đang được phát triển");
    };

    const handleDelete = async (paymentId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/payments/${paymentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể xóa giao dịch thanh toán"
                );
            }

            toast.success("Xóa giao dịch thanh toán thành công");
            await fetchPayments();
            await fetchStats();
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa giao dịch thanh toán"
            );
        }
    };

    const handleUpdateStatus = async (
        paymentId: number,
        status: Payment["status"]
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // ✅ Sửa lỗi: Thay thế any bằng interface cụ thể
            const updateData: UpdatePaymentData = { status };

            // Set paid_at when marking as completed
            if (status === "completed") {
                updateData.paid_at = new Date().toISOString();
            }

            const response = await fetchApi(`/payments/${paymentId}`, {
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
            await fetchPayments();
            await fetchStats();
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    const handleCreatePayment = async (paymentData: CreatePaymentDto) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo giao dịch thanh toán"
                );
            }

            toast.success("Tạo giao dịch thanh toán thành công");
            await fetchPayments();
            await fetchStats();
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo giao dịch thanh toán"
            );
            throw error;
        }
    };

    // ✅ Tạo helper function để tính tổng an toàn
    const calculateDisplayTotal = () => {
        const total = filteredPayments
            .filter((payment) => payment.status === "completed")
            .reduce((sum, payment) => {
                const amount = payment.amount;
                // Kiểm tra amount hợp lệ
                if (amount !== null && amount !== undefined && !isNaN(amount)) {
                    return sum + Number(amount);
                }
                return sum;
            }, 0);

        return formatCurrency(total);
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="payments">
                <LoadingSpinner message="Đang tải danh sách thanh toán..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="payments">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý thanh toán
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Theo dõi và quản lý tất cả các giao dịch thanh toán
                            trong hệ thống
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <PaymentStats stats={stats} loading={false} />

                {/* Actions */}
                <PaymentActions
                    payments={filteredPayments}
                    onRefresh={handleRefresh}
                    onCreatePayment={handleCreatePayment}
                    loading={refreshing}
                />

                {/* Filters */}
                <PaymentFilters
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    timeSlotFilter={timeSlotFilter}
                    setTimeSlotFilter={setTimeSlotFilter}
                    courtTypeFilter={courtTypeFilter}
                    setCourtTypeFilter={setCourtTypeFilter}
                    courtFilter={courtFilter}
                    setCourtFilter={setCourtFilter}
                    methodFilter={methodFilter}
                    setMethodFilter={setMethodFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    courtTypes={courtTypes}
                    courts={courts}
                    onClearFilters={handleClearFilters}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Hiện có {payments.length} giao dịch</span>
                    <span>
                        Tổng giá trị hiển thị: {calculateDisplayTotal()}
                    </span>
                </div>

                {/* Table */}
                <PaymentTable
                    payments={filteredPayments}
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
