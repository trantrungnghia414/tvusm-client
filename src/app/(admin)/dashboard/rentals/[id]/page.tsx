// client/src/app/(admin)/dashboard/rentals/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Package,
    Clock,
    DollarSign,
    Phone,
    Mail,
    CheckCircle2,
    XCircle,
    Download,
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
import { Rental } from "../types/rental";
import RentalStatusBadge from "../components/RentalStatusBadge";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RentalDetailPage() {
    const router = useRouter();
    const params = useParams();
    const rentalId = params.id as string;

    const [rental, setRental] = useState<Rental | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchRentalDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/rentals/${rentalId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thuê thiết bị");
                }

                const data = await response.json();

                // Transform data to match interface
                const transformedRental: Rental = {
                    rental_id: data.rental_id,
                    user_id: data.user_id,
                    equipment_id: data.equipment_id,
                    quantity: data.quantity,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    total_amount: data.total_amount,
                    status: data.status,
                    payment_status: data.payment_status || "pending",
                    notes: data.notes || "",
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
                    equipment: data.equipment
                        ? {
                              equipment_id: data.equipment.equipment_id,
                              name: data.equipment.name,
                              code: data.equipment.code,
                              category_name:
                                  data.equipment.category_name ||
                                  data.equipment.category?.name ||
                                  "",
                              rental_fee: data.equipment.rental_fee,
                              available_quantity:
                                  data.equipment.available_quantity,
                              status: data.equipment.status,
                              image: data.equipment.image,
                          }
                        : undefined,
                };

                setRental(transformedRental);
            } catch (error) {
                console.error("Error fetching rental detail:", error);
                toast.error("Không thể tải thông tin thuê thiết bị");
                router.push("/dashboard/rentals");
            } finally {
                setLoading(false);
            }
        };

        if (rentalId) {
            fetchRentalDetail();
        }
    }, [rentalId, router]);

    const handleDelete = async () => {
        if (!rental) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/rentals/${rental.rental_id}`, {
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
            router.push("/dashboard/rentals");
        } catch (error) {
            console.error("Error deleting rental:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa thuê thiết bị"
            );
        }
    };

    const handleUpdateStatus = async (status: Rental["status"]) => {
        if (!rental) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/rentals/${rental.rental_id}`, {
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

            setRental({ ...rental, status });
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

    const calculateDays = () => {
        if (!rental) return 0;
        const start = new Date(rental.start_date);
        const end = new Date(rental.end_date);
        return Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="rentals">
                <LoadingSpinner message="Đang tải thông tin thuê thiết bị..." />
            </DashboardLayout>
        );
    }

    if (!rental) {
        return (
            <DashboardLayout activeTab="rentals">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy thuê thiết bị
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Thuê thiết bị này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/rentals")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="rentals">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/rentals")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chi tiết thuê thiết bị #RE
                                {rental.rental_id.toString().padStart(4, "0")}
                            </h1>
                            <p className="text-gray-600">
                                Tạo lúc{" "}
                                {format(
                                    new Date(rental.created_at),
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
                                router.push(
                                    `/dashboard/rentals/${rental.rental_id}/edit`
                                )
                            }
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>
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
                        {/* Rental Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Thông tin thuê thiết bị
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Thiết bị
                                        </p>
                                        <p className="font-medium">
                                            {rental.equipment?.name || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {rental.equipment?.code} •{" "}
                                            {rental.equipment?.category_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Số lượng
                                        </p>
                                        <p className="font-medium">
                                            {rental.quantity}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ngày bắt đầu
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(rental.start_date),
                                                "EEEE, dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ngày kết thúc
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(rental.end_date),
                                                "EEEE, dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Thời gian thuê
                                        </p>
                                        <p className="font-medium">
                                            {calculateDays()} ngày
                                        </p>
                                    </div>
                                </div>

                                {rental.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ghi chú
                                        </p>
                                        <p className="font-medium">
                                            {rental.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        {rental.user && (
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
                                                {rental.user.fullname ||
                                                    rental.user.username}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Tên đăng nhập
                                            </p>
                                            <p className="font-medium">
                                                {rental.user.username}
                                            </p>
                                        </div>
                                        {rental.user.email && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Email
                                                </p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    {rental.user.email}
                                                </p>
                                            </div>
                                        )}
                                        {rental.user.phone && (
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Số điện thoại
                                                </p>
                                                <p className="font-medium flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    {rental.user.phone}
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
                                        Trạng thái thuê
                                    </p>
                                    <RentalStatusBadge status={rental.status} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Trạng thái thanh toán
                                    </p>
                                    <RentalStatusBadge
                                        status={rental.status}
                                        paymentStatus={rental.payment_status}
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
                                            Giá thuê / ngày:
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                rental.equipment?.rental_fee ||
                                                    0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Số lượng:
                                        </span>
                                        <span>{rental.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Số ngày:
                                        </span>
                                        <span>{calculateDays()}</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                                        <span>Tổng cộng:</span>
                                        <span className="text-green-600">
                                            {formatCurrency(
                                                rental.total_amount
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
                                {rental.status === "pending" && (
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleUpdateStatus("approved")
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Duyệt đơn thuê
                                    </Button>
                                )}

                                {rental.status === "approved" && (
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleUpdateStatus("active")
                                        }
                                    >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Bắt đầu thuê
                                    </Button>
                                )}

                                {rental.status === "active" && (
                                    <Button
                                        className="w-full"
                                        onClick={() =>
                                            handleUpdateStatus("returned")
                                        }
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Đánh dấu đã trả
                                    </Button>
                                )}

                                {["pending", "approved"].includes(
                                    rental.status
                                ) && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                        onClick={() =>
                                            handleUpdateStatus("cancelled")
                                        }
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Hủy đơn thuê
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Tải hợp đồng
                                </Button>
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
                            Xác nhận xóa thuê thiết bị
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa thuê thiết bị này? Hành
                            động này không thể hoàn tác.
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
