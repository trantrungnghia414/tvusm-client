// client/src/app/(admin)/dashboard/bookings/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Trash2,
    User,
    Calendar,
    DollarSign,
    Phone,
    Mail,
    CheckCircle2,
    XCircle,
} from "lucide-react";
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
import { Booking } from "../types/booking";
import BookingStatusBadge from "../components/BookingStatusBadge";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin đặt sân");
                }

                const data = await response.json();

                // Transform data to match interface
                const transformedBooking: Booking = {
                    booking_id: data.booking_id,
                    user_id: data.user_id,
                    court_id: data.court_id,
                    date: data.date || data.booking_date,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    total_amount: data.total_amount || data.total_price || 0,
                    status: data.status,
                    payment_status: data.payment_status || "unpaid",
                    notes: data.notes,
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
                    court: data.court
                        ? {
                              court_id: data.court.court_id,
                              name: data.court.name,
                              type_name:
                                  data.court.type_name ||
                                  data.court.court_type?.name ||
                                  "",
                              venue_name:
                                  data.court.venue_name ||
                                  data.court.venue?.name ||
                                  "",
                              hourly_rate: data.court.hourly_rate || 0,
                          }
                        : undefined,
                };

                setBooking(transformedBooking);
            } catch (error) {
                console.error("Error fetching booking detail:", error);
                toast.error("Không thể tải thông tin đặt sân");
                router.push("/dashboard/bookings");
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBookingDetail();
        }
    }, [bookingId, router]);

    const handleDelete = async () => {
        if (!booking) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/bookings/${booking.booking_id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa đặt sân");
            }

            toast.success("Xóa đặt sân thành công");
            router.push("/dashboard/bookings");
        } catch (error) {
            console.error("Error deleting booking:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa đặt sân"
            );
        }
    };

    const handleUpdateStatus = async (
        status: "pending" | "confirmed" | "completed" | "cancelled"
    ) => {
        if (!booking) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/bookings/${booking.booking_id}`, {
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

            setBooking({ ...booking, status });
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

    if (loading) {
        return (
            <DashboardLayout activeTab="bookings">
                <LoadingSpinner message="Đang tải thông tin đặt sân..." />
            </DashboardLayout>
        );
    }

    if (!booking) {
        return (
            <DashboardLayout activeTab="bookings">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy đặt sân
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Đặt sân này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/bookings")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="bookings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/bookings")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chi tiết đặt sân #
                                {booking.booking_id.toString().padStart(4, "0")}
                            </h1>
                            <p className="text-gray-600">
                                Tạo lúc{" "}
                                {format(
                                    new Date(booking.created_at),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi }
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Thông tin đặt sân
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Sân thể thao
                                        </p>
                                        <p className="font-medium">
                                            {booking.court?.name || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {booking.court?.type_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Địa điểm
                                        </p>
                                        <p className="font-medium">
                                            {booking.court?.venue_name || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ngày đặt
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(booking.date),
                                                "EEEE, dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Thời gian
                                        </p>
                                        <p className="font-medium">
                                            {booking.start_time} -{" "}
                                            {booking.end_time}
                                        </p>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ghi chú
                                        </p>
                                        <p className="font-medium">
                                            {booking.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        {booking.user && (
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
                                                {booking.user.fullname ||
                                                    booking.user.username}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Tên đăng nhập
                                            </p>
                                            <p className="font-medium">
                                                {booking.user.username}
                                            </p>
                                        </div>
                                        {booking.user.email && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Email
                                                </p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {booking.user.email}
                                                </p>
                                            </div>
                                        )}
                                        {booking.user.phone && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Số điện thoại
                                                </p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    {booking.user.phone}
                                                </p>
                                            </div>
                                        )}
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
                                        Trạng thái đặt sân
                                    </p>
                                    <BookingStatusBadge
                                        status={booking.status}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Trạng thái thanh toán
                                    </p>
                                    <BookingStatusBadge
                                        status={booking.status}
                                        paymentStatus={booking.payment_status}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Thông tin thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Giá theo giờ:
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                booking.court?.hourly_rate || 0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(
                                                booking.total_amount
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
                                {booking.status === "pending" && (
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleUpdateStatus("confirmed")
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Xác nhận đặt sân
                                    </Button>
                                )}

                                {["pending", "confirmed"].includes(
                                    booking.status
                                ) && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                        onClick={() =>
                                            handleUpdateStatus("cancelled")
                                        }
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Hủy đặt sân
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa đặt sân
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đặt sân này? Hành động này
                            không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
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
