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
    BarChart4,
    Settings,
    Shield,
    Wrench,
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

                const response = await fetchApi(`/equipment/${id}`, {
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

            const response = await fetchApi(`/equipment/${id}`, {
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

    const getWarrantyStatus = (warrantyDate: string | null) => {
        if (!warrantyDate) return null;

        const today = new Date();
        const warranty = new Date(warrantyDate);
        const diffTime = warranty.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                status: "expired",
                text: "Đã hết hạn",
                color: "text-red-600",
            };
        } else if (diffDays <= 30) {
            return {
                status: "expiring",
                text: "Sắp hết hạn",
                color: "text-orange-600",
            };
        } else {
            return {
                status: "valid",
                text: "Còn hiệu lực",
                color: "text-green-600",
            };
        }
    };

    const getMaintenanceStatus = (nextMaintenanceDate: string | null) => {
        if (!nextMaintenanceDate) return null;

        const today = new Date();
        const nextMaintenance = new Date(nextMaintenanceDate);
        const diffTime = nextMaintenance.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                status: "overdue",
                text: "Quá hạn",
                color: "text-red-600",
            };
        } else if (diffDays <= 7) {
            return {
                status: "due_soon",
                text: "Sắp đến hạn",
                color: "text-orange-600",
            };
        } else {
            return {
                status: "scheduled",
                text: "Đã lên lịch",
                color: "text-green-600",
            };
        }
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
                                    {equipment.court_name && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>
                                                Sân: {equipment.court_name} (
                                                {equipment.court_code})
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

                                {equipment.notes && (
                                    <div className="mt-4">
                                        <h3 className="text-base font-medium mb-2">
                                            Ghi chú
                                        </h3>
                                        <p className="text-gray-700">
                                            {equipment.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h3 className="text-base font-medium mb-3">
                                        Thông tin thiết bị
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {equipment.serial_number && (
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Tag className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">
                                                        Số serial
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold text-blue-700">
                                                    {equipment.serial_number}
                                                </p>
                                            </div>
                                        )}
                                        {equipment.manufacturer && (
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Package className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">
                                                        Nhà sản xuất
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold text-green-700">
                                                    {equipment.manufacturer}
                                                </p>
                                            </div>
                                        )}
                                        {equipment.model && (
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Settings className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-purple-800">
                                                        Model
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold text-purple-700">
                                                    {equipment.model}
                                                </p>
                                            </div>
                                        )}
                                        {equipment.location_detail && (
                                            <div className="bg-orange-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm font-medium text-orange-800">
                                                        Chi tiết vị trí
                                                    </span>
                                                </div>
                                                <p className="text-lg font-semibold text-orange-700">
                                                    {equipment.location_detail}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <CardTitle>
                                        Thông tin mua sắm & Bảo hành
                                    </CardTitle>
                                </div>
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
                                            Ngày hết hạn bảo hành
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-medium">
                                                {formatDate(
                                                    equipment.warranty_expiry
                                                )}
                                            </span>
                                            {equipment.warranty_expiry && (
                                                <span
                                                    className={`text-sm font-medium ${
                                                        getWarrantyStatus(
                                                            equipment.warranty_expiry
                                                        )?.color
                                                    }`}
                                                >
                                                    {
                                                        getWarrantyStatus(
                                                            equipment.warranty_expiry
                                                        )?.text
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {equipment.installation_date && (
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-gray-500">
                                                Ngày lắp đặt
                                            </span>
                                            <span className="text-lg font-medium">
                                                {formatDate(
                                                    equipment.installation_date
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {equipment.qr_code && (
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-gray-500">
                                                Mã QR
                                            </span>
                                            <span className="text-lg font-medium font-mono">
                                                {equipment.qr_code}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {(equipment.last_maintenance_date ||
                            equipment.next_maintenance_date) && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-5 w-5 text-green-600" />
                                        <CardTitle>Thông tin bảo trì</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {equipment.last_maintenance_date && (
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm text-gray-500">
                                                    Bảo trì gần nhất
                                                </span>
                                                <span className="text-lg font-medium">
                                                    {formatDate(
                                                        equipment.last_maintenance_date
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {equipment.next_maintenance_date && (
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm text-gray-500">
                                                    Bảo trì tiếp theo
                                                </span>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-lg font-medium">
                                                        {formatDate(
                                                            equipment.next_maintenance_date
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`text-sm font-medium ${
                                                            getMaintenanceStatus(
                                                                equipment.next_maintenance_date
                                                            )?.color
                                                        }`}
                                                    >
                                                        {
                                                            getMaintenanceStatus(
                                                                equipment.next_maintenance_date
                                                            )?.text
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
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
                                {equipment.added_by_name && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Được thêm bởi
                                        </span>
                                        <span className="font-medium">
                                            {equipment.added_by_name}
                                        </span>
                                    </div>
                                )}
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
