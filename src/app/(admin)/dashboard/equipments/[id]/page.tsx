"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Equipment } from "../types/equipmentTypes";
import {
    Pencil,
    Trash2,
    Calendar,
    Tag,
    MapPin,
    Package,
    CheckSquare,
    BarChart4,
} from "lucide-react";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EquipmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/equipments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thiết bị");
                }

                const data = await response.json();
                setEquipment(data);
            } catch (error) {
                console.error("Error fetching equipment:", error);
                toast.error("Không thể tải thông tin thiết bị");
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [id, router]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/equipments/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa thiết bị");
            }

            toast.success("Xóa thiết bị thành công");
            router.push("/dashboard/equipments");
        } catch (error) {
            console.error("Error deleting equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa thiết bị"
            );
        } finally {
            setConfirmDelete(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Chưa cập nhật";
        return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        Có sẵn
                    </Badge>
                );
            case "in_use":
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Đang sử dụng
                    </Badge>
                );
            case "maintenance":
                return (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        Đang bảo trì
                    </Badge>
                );
            case "unavailable":
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                        Không khả dụng
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="equipments">
                <LoadingSpinner message="Đang tải thông tin thiết bị..." />
            </DashboardLayout>
        );
    }

    if (!equipment) {
        return (
            <DashboardLayout activeTab="equipments">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không thể tải thông tin thiết bị
                    </p>
                    <button
                        className="mt-4 text-blue-600 underline"
                        onClick={() => router.push("/dashboard/equipments")}
                    >
                        Quay lại danh sách thiết bị
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="equipments">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chi tiết thiết bị</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard/equipments")}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push(`/dashboard/equipments/${id}/edit`)
                            }
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Thông tin chính */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    {getStatusBadge(equipment.status)}
                                </div>
                                <CardTitle className="text-2xl">
                                    {equipment.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        <span>Mã: {equipment.code}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BarChart4 className="h-4 w-4 mr-1" />
                                        <span>
                                            Danh mục: {equipment.category_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            Ngày mua:{" "}
                                            {formatDate(
                                                equipment.purchase_date
                                            )}
                                        </span>
                                    </div>
                                    {equipment.venue_name && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>
                                                Địa điểm: {equipment.venue_name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {equipment.description && (
                                    <div className="mt-4">
                                        <h3 className="text-base font-medium mb-2">
                                            Mô tả
                                        </h3>
                                        <p className="text-gray-700">
                                            {equipment.description}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h3 className="text-base font-medium mb-3">
                                        Thông tin số lượng
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Package className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800">
                                                    Tổng số lượng
                                                </span>
                                            </div>
                                            <p className="text-xl font-semibold text-blue-700">
                                                {equipment.quantity}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckSquare className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">
                                                    Số lượng có sẵn
                                                </span>
                                            </div>
                                            <p className="text-xl font-semibold text-green-700">
                                                {equipment.available_quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tài chính</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-sm text-gray-500">
                                            Giá mua
                                        </span>
                                        <span className="text-lg font-medium">
                                            {equipment.purchase_price
                                                ? formatCurrency(
                                                      equipment.purchase_price
                                                  )
                                                : "Chưa cập nhật"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-sm text-gray-500">
                                            Phí thuê (giờ)
                                        </span>
                                        <span className="text-lg font-medium">
                                            {formatCurrency(
                                                equipment.rental_fee
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ảnh thiết bị</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {equipment.image ? (
                                    <div className="relative w-full h-64 overflow-hidden rounded-md border">
                                        <Image
                                            src={
                                                getImageUrl(equipment.image) ||
                                                ""
                                            }
                                            alt={equipment.name}
                                            fill
                                            className="object-contain"
                                            unoptimized={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md border">
                                        <p className="text-gray-500">
                                            Không có ảnh
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin khác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Ngày tạo
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(equipment.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Cập nhật lần cuối
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(equipment.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa thiết bị
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa thiết bị này? Hành động
                            này không thể hoàn tác và tất cả dữ liệu liên quan
                            cũng sẽ bị xóa.
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
