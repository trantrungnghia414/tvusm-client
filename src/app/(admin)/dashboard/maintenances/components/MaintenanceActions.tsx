// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    RefreshCcw,
    Download,
    Upload,
    MoreHorizontal,
    FileSpreadsheet,
    FileText,
    Calendar,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { Maintenance } from "../types/maintenance";
import { useRouter } from "next/navigation";

interface MaintenanceActionsProps {
    maintenances: Maintenance[];
    onRefresh: () => void;
    loading?: boolean;
}

export default function MaintenanceActions({
    maintenances,
    onRefresh,
    loading = false,
}: MaintenanceActionsProps) {
    const router = useRouter();
    const [exporting, setExporting] = useState(false);

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            // Implement Excel export logic
            const exportData = maintenances.map((maintenance) => ({
                "Mã bảo trì": `MT${maintenance.maintenance_id
                    .toString()
                    .padStart(6, "0")}`,
                "Tiêu đề": maintenance.title,
                Loại: maintenance.type,
                "Mức độ": maintenance.priority,
                "Trạng thái": maintenance.status,
                "Địa điểm": maintenance.venue?.name || "N/A",
                "Người phụ trách":
                    maintenance.assigned_user?.fullname || "Chưa phân công",
                "Ngày lên lịch": new Date(
                    maintenance.scheduled_date
                ).toLocaleDateString("vi-VN"),
                "Chi phí ước tính": maintenance.estimated_cost
                    ? `${maintenance.estimated_cost.toLocaleString()}đ`
                    : "N/A",
                "Chi phí thực tế": maintenance.actual_cost
                    ? `${maintenance.actual_cost.toLocaleString()}đ`
                    : "N/A",
                "Ngày tạo": new Date(maintenance.created_at).toLocaleDateString(
                    "vi-VN"
                ),
            }));

            // Create Excel file (using a library like xlsx)
            const XLSX = await import("xlsx");
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách bảo trì");

            const fileName = `maintenance-list-${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success("Xuất Excel thành công");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Không thể xuất file Excel");
        } finally {
            setExporting(false);
        }
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            // Implement PDF export logic
            toast.info("Tính năng xuất PDF đang được phát triển");
        } catch (error) {
            console.error("Export PDF error:", error);
            toast.error("Không thể xuất file PDF");
        } finally {
            setExporting(false);
        }
    };

    const handleScheduleReport = () => {
        toast.info("Tính năng lập lịch báo cáo đang được phát triển");
    };

    const handleBulkActions = () => {
        toast.info("Tính năng thao tác hàng loạt đang được phát triển");
    };

    const getQuickStats = () => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        return {
            total: maintenances.length,
            scheduled: maintenances.filter((m) => m.status === "scheduled")
                .length,
            inProgress: maintenances.filter((m) => m.status === "in_progress")
                .length,
            todayScheduled: maintenances.filter(
                (m) =>
                    m.scheduled_date.startsWith(todayStr) &&
                    m.status === "scheduled"
            ).length,
            highPriority: maintenances.filter(
                (m) =>
                    ["high", "critical"].includes(m.priority) &&
                    m.status !== "completed"
            ).length,
        };
    };

    const stats = getQuickStats();

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <span className="font-medium">{stats.total}</span>{" "}
                            tổng cộng
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-blue-600">
                                {stats.scheduled}
                            </span>
                            đã lên lịch
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-purple-600">
                                {stats.inProgress}
                            </span>
                            đang thực hiện
                        </span>
                        {stats.todayScheduled > 0 && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    <span className="font-medium text-orange-600">
                                        {stats.todayScheduled}
                                    </span>
                                    hôm nay
                                </span>
                            </>
                        )}
                        {stats.highPriority > 0 && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-medium text-red-600">
                                        {stats.highPriority}
                                    </span>
                                    ưu tiên cao
                                </span>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <RefreshCcw
                                className={`h-4 w-4 mr-2 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Làm mới
                        </Button>

                        {/* Add New Button */}
                        <Button
                            size="sm"
                            onClick={() =>
                                router.push("/dashboard/maintenances/add")
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm bảo trì
                        </Button>

                        {/* Export Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={exporting}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Xuất dữ liệu
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleExportExcel}>
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Xuất Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportPDF}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Xuất PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleScheduleReport}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Lập lịch báo cáo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* More Actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleBulkActions}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Thao tác hàng loạt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        toast.info("Tính năng đang phát triển")
                                    }
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Nhập từ Excel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            "/dashboard/maintenances/templates"
                                        )
                                    }
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Mẫu bảo trì
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
