// client/src/app/(admin)/dashboard/maintenances/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    User,
    DollarSign,
    Clock,
    MapPin,
    FileText,
    Play,
    CheckCircle2,
    XCircle,
    History,
    AlertTriangle,
    Building,
    Wrench,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "../../../../../components/ui/loading-spinner";
import MaintenanceStatusBadge from "../components/MaintenanceStatusBadge";
import MaintenancePriorityBadge from "../components/MaintenancePriorityBadge";
import MaintenanceTypeBadge from "../components/MaintenanceTypeBadge";
import { Maintenance } from "../types/maintenance";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function MaintenanceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const maintenanceId = params.id as string;

    const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaintenanceDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(
                    `/maintenances/${maintenanceId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin bảo trì");
                }

                const data = await response.json();
                setMaintenance(data);
            } catch (error) {
                console.error("Error fetching maintenance detail:", error);
                toast.error("Không thể tải thông tin bảo trì");
                router.push("/dashboard/maintenances");
            } finally {
                setLoading(false);
            }
        };

        if (maintenanceId) {
            fetchMaintenanceDetail();
        }
    }, [maintenanceId, router]);

    const handleUpdateStatus = async (status: Maintenance["status"]) => {
        if (!maintenance) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const updateData: {
                status: Maintenance["status"];
                started_date?: string;
                completed_date?: string;
            } = { status };

            // Set timestamps based on status
            if (status === "in_progress" && !maintenance.started_date) {
                updateData.started_date = new Date().toISOString();
            }
            if (status === "completed") {
                updateData.completed_date = new Date().toISOString();
            }

            const response = await fetchApi(
                `/maintenances/${maintenance.maintenance_id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            setMaintenance({
                ...maintenance,
                status,
                started_date:
                    status === "in_progress" && !maintenance.started_date
                        ? new Date().toISOString()
                        : maintenance.started_date,
                completed_date:
                    status === "completed"
                        ? new Date().toISOString()
                        : maintenance.completed_date,
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

    const handleDelete = async () => {
        if (!maintenance) return;

        if (!confirm("Bạn có chắc chắn muốn xóa bảo trì này?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/maintenances/${maintenance.maintenance_id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa bảo trì");
            }

            toast.success("Xóa bảo trì thành công");
            router.push("/dashboard/maintenances");
        } catch (error) {
            console.error("Error deleting maintenance:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa bảo trì"
            );
        }
    };

    const getOverdueStatus = () => {
        if (!maintenance || maintenance.status === "completed") return false;
        const scheduledDate = new Date(maintenance.scheduled_date);
        const today = new Date();
        return scheduledDate < today;
    };

    const calculateProgress = () => {
        if (!maintenance) return 0;

        switch (maintenance.status) {
            case "scheduled":
                // Nếu chưa bắt đầu thì 0%
                return 0;

            case "in_progress":
                // Tính % dựa trên thời gian đã trôi qua
                if (
                    !maintenance.started_date ||
                    !maintenance.estimated_duration
                ) {
                    return 10; // Mặc định 10% nếu thiếu thông tin
                }

                const startTime = new Date(maintenance.started_date).getTime();
                const currentTime = new Date().getTime();
                const elapsedHours =
                    (currentTime - startTime) / (1000 * 60 * 60);
                const estimatedHours = maintenance.estimated_duration;

                // Tính % hoàn thành, giới hạn trong khoảng 1-99%
                const progressPercent = Math.min(
                    Math.max(
                        Math.round((elapsedHours / estimatedHours) * 100),
                        1
                    ),
                    99
                );

                return progressPercent;

            case "completed":
                return 100;

            case "cancelled":
                // Cancelled giữ % tại thời điểm hủy
                if (
                    maintenance.started_date &&
                    maintenance.estimated_duration
                ) {
                    const startTime = new Date(
                        maintenance.started_date
                    ).getTime();
                    const currentTime = new Date().getTime();
                    const elapsedHours =
                        (currentTime - startTime) / (1000 * 60 * 60);
                    const estimatedHours = maintenance.estimated_duration;

                    return Math.min(
                        Math.max(
                            Math.round((elapsedHours / estimatedHours) * 100),
                            0
                        ),
                        100
                    );
                }
                return 0;

            case "overdue":
                // Overdue có thể có % > 100% để thể hiện quá hạn
                if (
                    maintenance.started_date &&
                    maintenance.estimated_duration
                ) {
                    const startTime = new Date(
                        maintenance.started_date
                    ).getTime();
                    const currentTime = new Date().getTime();
                    const elapsedHours =
                        (currentTime - startTime) / (1000 * 60 * 60);
                    const estimatedHours = maintenance.estimated_duration;

                    return Math.round((elapsedHours / estimatedHours) * 100);
                } else {
                    // Nếu chưa bắt đầu nhưng đã quá ngày scheduled
                    const scheduledTime = new Date(
                        maintenance.scheduled_date
                    ).getTime();
                    const currentTime = new Date().getTime();

                    if (currentTime > scheduledTime) {
                        return 0; // Quá hạn nhưng chưa bắt đầu
                    }
                }
                return 0;

            default:
                return 0;
        }
    };

    const getLocationInfo = () => {
        if (!maintenance) return null;

        const items = [];

        if (maintenance.venue) {
            items.push({
                icon: <Building className="h-4 w-4" />,
                label: "Địa điểm",
                value: `${maintenance.venue.name} - ${maintenance.venue.location}`,
            });
        }

        if (maintenance.court) {
            items.push({
                icon: <MapPin className="h-4 w-4" />,
                label: "Sân",
                value: maintenance.court.name,
            });
        }

        if (maintenance.equipment) {
            items.push({
                icon: <Wrench className="h-4 w-4" />,
                label: "Thiết bị",
                value: `${maintenance.equipment.name} (${maintenance.equipment.code})`,
            });
        }

        return items;
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="maintenances">
                <LoadingSpinner message="Đang tải thông tin bảo trì..." />
            </DashboardLayout>
        );
    }

    if (!maintenance) {
        return (
            <DashboardLayout activeTab="maintenances">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy bảo trì
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Bảo trì này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/maintenances")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const isOverdue = getOverdueStatus();
    const progress = calculateProgress();
    const locationInfo = getLocationInfo();

    return (
        <DashboardLayout activeTab="maintenances">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.push("/dashboard/maintenances")
                            }
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Bảo trì #MT
                                    {maintenance.maintenance_id
                                        .toString()
                                        .padStart(6, "0")}
                                </h1>
                                {isOverdue && (
                                    <Badge
                                        variant="destructive"
                                        className="flex items-center gap-1"
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        Quá hạn
                                    </Badge>
                                )}
                            </div>
                            <p className="text-gray-600">
                                Tạo lúc{" "}
                                {format(
                                    new Date(maintenance.created_at),
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
                                    `/dashboard/maintenances/${maintenance.maintenance_id}/edit`
                                )
                            }
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                    Tiến độ thực hiện
                                </span>
                                <span
                                    className={
                                        progress > 100
                                            ? "text-red-600 font-semibold"
                                            : ""
                                    }
                                >
                                    {progress}%
                                    {progress > 100 &&
                                        " (Quá thời gian dự kiến)"}
                                </span>
                            </div>
                            <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        maintenance.status === "completed"
                                            ? "bg-green-500"
                                            : maintenance.status ===
                                              "in_progress"
                                            ? progress > 100
                                                ? "bg-red-500"
                                                : "bg-blue-500"
                                            : maintenance.status === "cancelled"
                                            ? "bg-gray-500"
                                            : maintenance.status === "overdue"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                    }`}
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                        ...(progress > 100 && {
                                            animation: "pulse 2s infinite",
                                        }),
                                    }}
                                />
                                {/* Indicator cho overdue */}
                                {progress > 100 && (
                                    <div className="absolute top-0 right-0 h-2 w-1 bg-red-700 animate-pulse" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {maintenance.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <MaintenanceTypeBadge
                                            type={maintenance.type}
                                        />
                                        <MaintenancePriorityBadge
                                            priority={maintenance.priority}
                                        />
                                        <MaintenanceStatusBadge
                                            status={maintenance.status}
                                        />
                                    </div>
                                </div>

                                {maintenance.description && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Mô tả
                                        </p>
                                        <p className="text-gray-900">
                                            {maintenance.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Ngày lên lịch
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                {format(
                                                    new Date(
                                                        maintenance.scheduled_date
                                                    ),
                                                    "dd/MM/yyyy",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {maintenance.started_date && (
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Ngày bắt đầu
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Play className="h-4 w-4 text-green-500" />
                                                <span className="font-medium text-green-600">
                                                    {format(
                                                        new Date(
                                                            maintenance.started_date
                                                        ),
                                                        "dd/MM/yyyy HH:mm",
                                                        { locale: vi }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {maintenance.completed_date && (
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Ngày hoàn thành
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium text-blue-600">
                                                    {format(
                                                        new Date(
                                                            maintenance.completed_date
                                                        ),
                                                        "dd/MM/yyyy HH:mm",
                                                        { locale: vi }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Người tạo
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                {maintenance.creator
                                                    ?.fullname ||
                                                    maintenance.creator
                                                        ?.username ||
                                                    "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Equipment */}
                        {locationInfo && locationInfo.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Vị trí và thiết bị
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {locationInfo.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="text-gray-400">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    {item.label}
                                                </p>
                                                <p className="font-medium">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        {maintenance.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Ghi chú
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {maintenance.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái & hành động</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Trạng thái hiện tại
                                    </p>
                                    <MaintenanceStatusBadge
                                        status={maintenance.status}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {maintenance.status === "scheduled" && (
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    "in_progress"
                                                )
                                            }
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Bắt đầu thực hiện
                                        </Button>
                                    )}

                                    {maintenance.status === "in_progress" && (
                                        <>
                                            <Button
                                                className="w-full"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        "completed"
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Hoàn thành
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        "cancelled"
                                                    )
                                                }
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Hủy bỏ
                                            </Button>
                                        </>
                                    )}

                                    {maintenance.status !== "completed" && (
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() =>
                                                handleUpdateStatus("cancelled")
                                            }
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Hủy bỏ
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Phân công
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {maintenance.assigned_user ? (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Người phụ trách
                                        </p>
                                        <div className="mt-1">
                                            <p className="font-medium">
                                                {maintenance.assigned_user
                                                    .fullname ||
                                                    maintenance.assigned_user
                                                        .username}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {
                                                    maintenance.assigned_user
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Người phụ trách
                                        </p>
                                        <p className="text-gray-400 italic">
                                            Chưa phân công
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cost & Duration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Chi phí & thời gian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {maintenance.estimated_cost && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Chi phí ước tính
                                        </p>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {formatCurrency(
                                                maintenance.estimated_cost
                                            )}
                                        </p>
                                    </div>
                                )}

                                {maintenance.actual_cost && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Chi phí thực tế
                                        </p>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(
                                                maintenance.actual_cost
                                            )}
                                        </p>
                                    </div>
                                )}

                                {maintenance.estimated_duration && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Thời gian ước tính
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">
                                                {maintenance.estimated_duration}{" "}
                                                giờ
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {maintenance.actual_duration && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Thời gian thực tế
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-green-600">
                                                {maintenance.actual_duration}{" "}
                                                giờ
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Lịch sử
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Ngày tạo:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(
                                                    maintenance.created_at
                                                ),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </div>

                                    {maintenance.started_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Bắt đầu:
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                {format(
                                                    new Date(
                                                        maintenance.started_date
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {maintenance.completed_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Hoàn thành:
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                                {format(
                                                    new Date(
                                                        maintenance.completed_date
                                                    ),
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
                                                new Date(
                                                    maintenance.updated_at
                                                ),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
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
