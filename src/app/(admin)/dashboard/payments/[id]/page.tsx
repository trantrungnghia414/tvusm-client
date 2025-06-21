// client/src/app/(admin)/dashboard/payments/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    User,
    DollarSign,
    CreditCard,
    CheckCircle2,
    XCircle,
    RotateCcw,
    ExternalLink,
    Copy,
    Receipt,
    Building,
    Package,
} from "lucide-react";
import { Payment } from "../types/payment";
import PaymentStatusBadge from "../components/PaymentStatusBadge";
import PaymentMethodBadge from "../components/PaymentMethodBadge";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ✅ Thêm interface cho update data
interface UpdatePaymentData {
    status: Payment["status"];
    paid_at?: string;
}

export default function PaymentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const paymentId = params.id as string;

    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/payments/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thanh toán");
                }

                const data = await response.json();

                // Transform data to match interface
                const transformedPayment: Payment = {
                    payment_id: data.payment_id,
                    booking_id: data.booking_id,
                    rental_id: data.rental_id,
                    user_id: data.user_id,
                    amount: data.amount,
                    payment_method: data.payment_method,
                    status: data.status,
                    transaction_id: data.transaction_id,
                    gateway_response: data.gateway_response,
                    notes: data.notes,
                    paid_at: data.paid_at,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    user: data.user
                        ? {
                              user_id: data.user.user_id,
                              username: data.user.username,
                              email: data.user.email,
                              fullname: data.user.fullname || data.user.name,
                              phone: data.user.phone,
                          }
                        : undefined,
                    booking: data.booking,
                    rental: data.rental,
                };

                setPayment(transformedPayment);
            } catch (error) {
                console.error("Error fetching payment detail:", error);
                toast.error("Không thể tải thông tin thanh toán");
                router.push("/dashboard/payments");
            } finally {
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchPaymentDetail();
        }
    }, [paymentId, router]);

    const handleUpdateStatus = async (status: Payment["status"]) => {
        if (!payment) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // ✅ Sử dụng interface thay vì any
            const updateData: UpdatePaymentData = { status };

            // Set paid_at when marking as completed
            if (status === "completed") {
                updateData.paid_at = new Date().toISOString();
            }

            const response = await fetchApi(`/payments/${payment.payment_id}`, {
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

            setPayment({
                ...payment,
                status,
                paid_at:
                    status === "completed"
                        ? new Date().toISOString()
                        : payment.paid_at,
            });
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    const handleCopyTransactionId = () => {
        if (payment?.transaction_id) {
            navigator.clipboard.writeText(payment.transaction_id);
            toast.success("Đã sao chép mã giao dịch");
        }
    };

    const getPaymentType = () => {
        if (!payment) return "Không xác định";
        if (payment.booking_id) return "Đặt sân";
        if (payment.rental_id) return "Thuê thiết bị";
        return "Khác";
    };

    const getRelatedInfo = () => {
        if (!payment) return null;

        if (payment.booking && payment.booking_id) {
            return {
                type: "Đặt sân",
                name: payment.booking.court_name,
                detail: `${format(
                    new Date(payment.booking.booking_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                )} • ${payment.booking.start_time}-${payment.booking.end_time}`,
                id: payment.booking_id,
                path: `/dashboard/bookings/${payment.booking_id}`,
            };
        }

        if (payment.rental && payment.rental_id) {
            return {
                type: "Thuê thiết bị",
                name: payment.rental.equipment_name,
                detail: `${format(
                    new Date(payment.rental.start_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                )} - ${format(new Date(payment.rental.end_date), "dd/MM/yyyy", {
                    locale: vi,
                })} • SL: ${payment.rental.quantity}`,
                id: payment.rental_id,
                path: `/dashboard/rentals/${payment.rental_id}`,
            };
        }

        return null;
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="payments">
                <LoadingSpinner message="Đang tải thông tin thanh toán..." />
            </DashboardLayout>
        );
    }

    if (!payment) {
        return (
            <DashboardLayout activeTab="payments">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy giao dịch thanh toán
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Giao dịch này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/payments")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const relatedInfo = getRelatedInfo();

    return (
        <DashboardLayout activeTab="payments">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/payments")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chi tiết giao dịch #PAY
                                {payment.payment_id.toString().padStart(6, "0")}
                            </h1>
                            <p className="text-gray-600">
                                Tạo lúc{" "}
                                {format(
                                    new Date(payment.created_at),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi }
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info(
                                    "Tính năng in hóa đơn đang được phát triển"
                                )
                            }
                        >
                            <Receipt className="h-4 w-4 mr-2" />
                            In hóa đơn
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Thông tin thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Mã giao dịch
                                        </p>
                                        <p className="font-medium">
                                            PAY
                                            {payment.payment_id
                                                .toString()
                                                .padStart(6, "0")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Loại thanh toán
                                        </p>
                                        <p className="font-medium">
                                            {getPaymentType()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Số tiền
                                        </p>
                                        <p className="font-bold text-2xl text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phương thức
                                        </p>
                                        <PaymentMethodBadge
                                            method={payment.payment_method}
                                        />
                                    </div>
                                    {payment.transaction_id && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-500">
                                                Mã giao dịch bên ngoài
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium font-mono">
                                                    {payment.transaction_id}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={
                                                        handleCopyTransactionId
                                                    }
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {payment.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ghi chú
                                        </p>
                                        <p className="font-medium">
                                            {payment.notes}
                                        </p>
                                    </div>
                                )}

                                {payment.gateway_response && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phản hồi từ cổng thanh toán
                                        </p>
                                        <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
                                            {payment.gateway_response}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        {payment.user && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Thông tin khách hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Tên khách hàng
                                            </p>
                                            <p className="font-medium">
                                                {payment.user.fullname ||
                                                    payment.user.username}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Tên đăng nhập
                                            </p>
                                            <p className="font-medium">
                                                {payment.user.username}
                                            </p>
                                        </div>
                                        {payment.user.email && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Email
                                                </p>
                                                <p className="font-medium">
                                                    {payment.user.email}
                                                </p>
                                            </div>
                                        )}
                                        {payment.user.phone && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Số điện thoại
                                                </p>
                                                <p className="font-medium">
                                                    {payment.user.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Service */}
                        {relatedInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {relatedInfo.type === "Đặt sân" ? (
                                            <Building className="h-5 w-5" />
                                        ) : (
                                            <Package className="h-5 w-5" />
                                        )}
                                        Dịch vụ liên quan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Loại dịch vụ
                                            </p>
                                            <p className="font-medium">
                                                {relatedInfo.type}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.push(relatedInfo.path)
                                            }
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Tên dịch vụ
                                        </p>
                                        <p className="font-medium">
                                            {relatedInfo.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Chi tiết
                                        </p>
                                        <p className="font-medium">
                                            {relatedInfo.detail}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Trạng thái hiện tại
                                    </p>
                                    <PaymentStatusBadge
                                        status={payment.status}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Ngày tạo:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(payment.created_at),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </div>
                                    {payment.paid_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Ngày thanh toán:
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                {format(
                                                    new Date(payment.paid_at),
                                                    "dd/MM/yyyy HH:mm",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Cập nhật cuối:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(payment.updated_at),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hành động nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {payment.status === "pending" && (
                                    <>
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                handleUpdateStatus("completed")
                                            }
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Xác nhận thành công
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() =>
                                                handleUpdateStatus("failed")
                                            }
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Đánh dấu thất bại
                                        </Button>
                                    </>
                                )}

                                {payment.status === "completed" && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                                        onClick={() =>
                                            handleUpdateStatus("refunded")
                                        }
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Hoàn tiền
                                    </Button>
                                )}

                                {["pending", "failed"].includes(
                                    payment.status
                                ) && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                                        onClick={() =>
                                            handleUpdateStatus("cancelled")
                                        }
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Hủy giao dịch
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Thông tin tài chính
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Số tiền:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Phí xử lý:</span>
                                            <span>0đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>VAT:</span>
                                            <span>0đ</span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t pt-1">
                                            <span>Tổng cộng:</span>
                                            <span>
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
