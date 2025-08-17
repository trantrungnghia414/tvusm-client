"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Navbar from "@/app/(client)/components/layout/FixedNavbar"; // ✅ Sử dụng FixedNavbar
import Footer from "@/app/(client)/components/layout/Footer";

interface PaymentInfo {
    payment_id: number;
    amount: number;
    status: string;
    booking?: {
        booking_id: number;
        booking_code: string;
        date: string;
        start_time: string;
        end_time: string;
        court?: {
            name: string;
            venue_name: string;
        };
    };
    created_at: string;
    paid_at?: string;
}

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [payment, setPayment] = useState<PaymentInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const status = searchParams.get("status");
    const paymentId = searchParams.get("paymentId");
    const error = searchParams.get("error");

    useEffect(() => {
        const fetchPaymentInfo = async () => {
            try {
                setLoading(true);

                // ✅ Cleanup pending booking từ sessionStorage
                const pendingBookingStr =
                    sessionStorage.getItem("pendingBooking");
                if (pendingBookingStr) {
                    sessionStorage.removeItem("pendingBooking"); // Cleanup
                }

                if (!paymentId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/payments/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPayment(data);
                }
            } catch (error) {
                console.error("Error fetching payment info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentInfo();
    }, [paymentId, router]);

    // ✅ Hiển thị thông báo khác nhau dựa trên trạng thái
    const getStatusInfo = () => {
        switch (status) {
            case "completed":
                return {
                    icon: <CheckCircle className="h-16 w-16 text-green-500" />,
                    title: "Thanh toán thành công!",
                    description:
                        "Đặt sân của bạn đã được xác nhận và thanh toán thành công.",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                    textColor: "text-green-800",
                };
            case "failed":
                return {
                    icon: <XCircle className="h-16 w-16 text-red-500" />,
                    title: "Thanh toán thất bại!",
                    description:
                        error ||
                        "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                    textColor: "text-red-800",
                };
            default:
                return {
                    icon: <XCircle className="h-16 w-16 text-gray-500" />,
                    title: "Trạng thái không xác định",
                    description: "Không thể xác định trạng thái giao dịch.",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-800",
                };
        }
    };

    const statusInfo = getStatusInfo();

    // ✅ Hiển thị loading state khi đang fetch dữ liệu
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                    <p className="text-gray-600">
                                        Đang tải thông tin thanh toán...
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-16">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card className={`${statusInfo.borderColor} border-2`}>
                        <CardHeader
                            className={`${statusInfo.bgColor} text-center`}
                        >
                            <div className="flex justify-center mb-4">
                                {statusInfo.icon}
                            </div>
                            <CardTitle
                                className={`text-2xl ${statusInfo.textColor}`}
                            >
                                {statusInfo.title}
                            </CardTitle>
                            <p className={`${statusInfo.textColor} opacity-80`}>
                                {statusInfo.description}
                            </p>
                        </CardHeader>

                        {payment && (
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Mã giao dịch
                                            </p>
                                            <p className="font-semibold">
                                                #{payment.payment_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Số tiền
                                            </p>
                                            <p className="font-semibold text-lg text-blue-600">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                    </div>

                                    {payment.booking && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Receipt className="h-4 w-4" />
                                                Thông tin đặt sân
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Mã đặt sân:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            payment.booking
                                                                .booking_code
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Sân:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            payment.booking
                                                                .court?.name
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Địa điểm:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            payment.booking
                                                                .court
                                                                ?.venue_name
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Ngày:
                                                    </span>
                                                    <span className="font-medium">
                                                        {new Date(
                                                            payment.booking.date
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Thời gian:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            payment.booking
                                                                .start_time
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            payment.booking
                                                                .end_time
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Thời gian giao dịch:
                                            </span>
                                            <span>
                                                {new Date(
                                                    payment.created_at
                                                ).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                        {payment.paid_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Thời gian thanh toán:
                                                </span>
                                                <span>
                                                    {new Date(
                                                        payment.paid_at
                                                    ).toLocaleString("vi-VN")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        )}

                        <div className="p-6 border-t bg-gray-50 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="flex-1"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Về trang chủ
                            </Button>

                            {status === "completed" ? (
                                <Button
                                    onClick={() =>
                                        router.push("/profile/bookings")
                                    }
                                    className="flex-1"
                                >
                                    Xem đặt sân của tôi
                                </Button>
                            ) : status === "failed" ? (
                                <Button
                                    onClick={() => router.push("/booking")}
                                    className="flex-1"
                                >
                                    Thử đặt lại
                                </Button>
                            ) : null}
                        </div>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
