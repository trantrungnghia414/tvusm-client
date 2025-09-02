"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

interface CustomerData {
    customer: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        phone?: string;
    };
    bookingCount: number;
    totalSpent: number;
    lastBooking: string;
}

interface CustomerHistoryData {
    customer: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        phone?: string;
    };
    totalBookings: number;
    totalSpent: number;
    bookings: Array<{
        booking_id: number;
        booking_code: string;
        court_name: string;
        date: string;
        start_time: string;
        end_time: string;
        total_amount: number;
        status: string;
        payment_status: string;
        created_at: string;
    }>;
}

interface CustomerHistoryModalProps {
    customer: CustomerData;
}

export default function CustomerHistoryModal({
    customer,
}: CustomerHistoryModalProps) {
    const [historyData, setHistoryData] = useState<CustomerHistoryData | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    return;
                }

                const response = await fetchApi(
                    `/reports/customer/${customer.customer.user_id}/history`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) {
                    throw new Error("Không thể tải lịch sử khách hàng");
                }

                const data = await response.json();
                setHistoryData(data);
            } catch (error) {
                console.error("Error fetching customer history:", error);
                toast.error("Không thể tải lịch sử khách hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerHistory();
    }, [customer.customer.user_id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Đã xác nhận
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Hoàn thành
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Chờ xử lý
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        {status}
                    </Badge>
                );
        }
    };

    const getPaymentStatusBadge = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "paid":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Đã thanh toán
                    </Badge>
                );
            case "unpaid":
                return (
                    <Badge className="bg-red-100 text-red-800">
                        Chưa thanh toán
                    </Badge>
                );
            case "partial":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Thanh toán 1 phần
                    </Badge>
                );
            case "refunded":
                return (
                    <Badge className="bg-purple-100 text-purple-800">
                        Đã hoàn tiền
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        {paymentStatus}
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!historyData) {
        return (
            <div className="flex items-center justify-center h-32 text-gray-500">
                Không thể tải dữ liệu lịch sử
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4" />
                        Tổng lượt đặt
                    </div>
                    <div className="text-2xl font-bold">
                        {historyData.totalBookings}
                    </div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Tổng chi tiêu
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(historyData.totalSpent)}
                    </div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Chi tiêu TB
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(
                            historyData.totalSpent / historyData.totalBookings
                        )}
                    </div>
                </div>
            </div>

            {/* Booking History Table */}
            <div>
                <h4 className="text-lg font-semibold mb-4">Lịch sử đặt sân</h4>
                <div className="max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã đặt sân</TableHead>
                                <TableHead>Sân</TableHead>
                                <TableHead>Ngày & Giờ</TableHead>
                                <TableHead className="text-right">
                                    Số tiền
                                </TableHead>
                                <TableHead className="text-center">
                                    Trạng thái
                                </TableHead>
                                <TableHead className="text-center">
                                    Thanh toán
                                </TableHead>
                                <TableHead className="text-center">
                                    Ngày đặt
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyData.bookings.map((booking) => (
                                <TableRow key={booking.booking_id}>
                                    <TableCell className="font-medium">
                                        {booking.booking_code}
                                    </TableCell>
                                    <TableCell>{booking.court_name}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {formatDate(booking.date)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                {booking.start_time} -{" "}
                                                {booking.end_time}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(booking.total_amount)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(booking.status)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getPaymentStatusBadge(
                                            booking.payment_status
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-gray-500">
                                        {formatDateTime(booking.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {historyData.bookings.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-500">
                    Khách hàng chưa có lịch sử đặt sân
                </div>
            )}
        </div>
    );
}
