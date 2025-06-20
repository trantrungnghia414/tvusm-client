// client/src/app/(admin)/dashboard/payments/page.tsx
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

// Raw data interfaces for API responses
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

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [amountFilter, setAmountFilter] = useState<{
        min?: number;
        max?: number;
    }>({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            await Promise.all([fetchPayments(), fetchStats()]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchPayments, fetchStats]);

    // Filter payments
    const filteredPayments = React.useMemo(() => {
        let result = [...payments];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (payment) =>
                    payment.payment_id.toString().includes(search) ||
                    payment.transaction_id?.toLowerCase().includes(search) ||
                    payment.user?.fullname?.toLowerCase().includes(search) ||
                    payment.user?.username?.toLowerCase().includes(search) ||
                    payment.user?.email?.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter(
                (payment) => payment.status === statusFilter
            );
        }

        // Payment method filter
        if (methodFilter !== "all") {
            result = result.filter(
                (payment) => payment.payment_method === methodFilter
            );
        }

        // Type filter
        if (typeFilter !== "all") {
            if (typeFilter === "booking") {
                result = result.filter((payment) => payment.booking_id);
            } else if (typeFilter === "rental") {
                result = result.filter((payment) => payment.rental_id);
            }
        }

        // Date filter
        if (dateFilter) {
            const filterDate = dateFilter.toISOString().split("T")[0];
            result = result.filter(
                (payment) =>
                    payment.created_at.startsWith(filterDate) ||
                    (payment.paid_at && payment.paid_at.startsWith(filterDate))
            );
        }

        // Amount filter
        if (amountFilter.min !== undefined) {
            result = result.filter(
                (payment) => payment.amount >= amountFilter.min!
            );
        }
        if (amountFilter.max !== undefined) {
            result = result.filter(
                (payment) => payment.amount <= amountFilter.max!
            );
        }

        return result;
    }, [
        payments,
        searchTerm,
        statusFilter,
        methodFilter,
        typeFilter,
        dateFilter,
        amountFilter,
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
        setSearchTerm("");
        setStatusFilter("all");
        setMethodFilter("all");
        setTypeFilter("all");
        setDateFilter(undefined);
        setAmountFilter({});
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
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    methodFilter={methodFilter}
                    setMethodFilter={setMethodFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    amountFilter={amountFilter}
                    setAmountFilter={setAmountFilter}
                    onClearFilters={handleClearFilters}
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Hiển thị {filteredPayments.length} trên{" "}
                        {payments.length} giao dịch
                    </span>
                    <span>
                        Tổng giá trị hiển thị:{" "}
                        {filteredPayments
                            .filter((payment) => payment.status === "completed")
                            .reduce((sum, payment) => sum + payment.amount, 0)
                            .toLocaleString("vi-VN")}
                        đ
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
