// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceTable.tsx
"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Play,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    MapPin,
    DollarSign,
    Clock,
    Plus,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Maintenance } from "../types/maintenance";
import MaintenanceStatusBadge from "./MaintenanceStatusBadge";
import MaintenancePriorityBadge from "./MaintenancePriorityBadge";
import MaintenanceTypeBadge from "./MaintenanceTypeBadge";
import { formatCurrency } from "@/lib/utils";

interface MaintenanceTableProps {
    maintenances: Maintenance[];
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, status: Maintenance["status"]) => void;
    loading?: boolean;
}

export default function MaintenanceTable({
    maintenances,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    loading = false,
}: MaintenanceTableProps) {
    const [sortBy, setSortBy] = useState<"date" | "priority" | "status">(
        "date"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const handleSort = (field: "date" | "priority" | "status") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    const sortedMaintenances = React.useMemo(() => {
        const sorted = [...maintenances].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "date":
                    comparison =
                        new Date(a.scheduled_date).getTime() -
                        new Date(b.scheduled_date).getTime();
                    break;
                case "priority":
                    const priorityOrder = {
                        critical: 4,
                        high: 3,
                        medium: 2,
                        low: 1,
                    };
                    comparison =
                        priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case "status":
                    comparison = a.status.localeCompare(b.status);
                    break;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [maintenances, sortBy, sortOrder]);

    const getOverdueStatus = (maintenance: Maintenance) => {
        if (maintenance.status === "completed") return false;
        const scheduledDate = new Date(maintenance.scheduled_date);
        const today = new Date();
        return scheduledDate < today;
    };

    const handleQuickStatusUpdate = (
        maintenance: Maintenance,
        newStatus: Maintenance["status"]
    ) => {
        onUpdateStatus(maintenance.maintenance_id, newStatus);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bảo trì</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (maintenances.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bảo trì</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Calendar className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chưa có bảo trì nào
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Tạo kế hoạch bảo trì đầu tiên để bắt đầu quản lý cơ
                            sở vật chất
                        </p>
                        <Button onClick={() => onEdit(0)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm bảo trì mới
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Danh sách bảo trì</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Sắp xếp theo:</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("date")}
                            className={sortBy === "date" ? "text-blue-600" : ""}
                        >
                            Ngày{" "}
                            {sortBy === "date" &&
                                (sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("priority")}
                            className={
                                sortBy === "priority" ? "text-blue-600" : ""
                            }
                        >
                            Mức độ{" "}
                            {sortBy === "priority" &&
                                (sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("status")}
                            className={
                                sortBy === "status" ? "text-blue-600" : ""
                            }
                        >
                            Trạng thái{" "}
                            {sortBy === "status" &&
                                (sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Mức độ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Địa điểm</TableHead>
                                <TableHead>Người phụ trách</TableHead>
                                <TableHead>Ngày lên lịch</TableHead>
                                <TableHead>Chi phí</TableHead>
                                <TableHead className="text-center">
                                    Thao tác
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedMaintenances.map((maintenance) => {
                                const isOverdue = getOverdueStatus(maintenance);

                                return (
                                    <TableRow
                                        key={maintenance.maintenance_id}
                                        className={`hover:bg-gray-50 ${
                                            isOverdue ? "bg-red-50" : ""
                                        }`}
                                    >
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {maintenance.title}
                                                    </span>
                                                    {isOverdue && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            Quá hạn
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {maintenance.description}
                                                </p>
                                                <div className="text-xs text-gray-500">
                                                    MT
                                                    {maintenance.maintenance_id
                                                        .toString()
                                                        .padStart(6, "0")}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <MaintenanceTypeBadge
                                                type={maintenance.type}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <MaintenancePriorityBadge
                                                priority={maintenance.priority}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <MaintenanceStatusBadge
                                                status={maintenance.status}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                {maintenance.venue && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3 text-gray-400" />
                                                        <span>
                                                            {
                                                                maintenance
                                                                    .venue.name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {maintenance.court && (
                                                    <div className="text-xs text-gray-600">
                                                        Sân:{" "}
                                                        {maintenance.court.name}
                                                    </div>
                                                )}
                                                {maintenance.equipment && (
                                                    <div className="text-xs text-gray-600">
                                                        TB:{" "}
                                                        {
                                                            maintenance
                                                                .equipment.name
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                {maintenance.assigned_user ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        <span>
                                                            {maintenance
                                                                .assigned_user
                                                                .fullname ||
                                                                maintenance
                                                                    .assigned_user
                                                                    .username}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Chưa phân công
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                maintenance.scheduled_date
                                                            ),
                                                            "dd/MM/yyyy",
                                                            { locale: vi }
                                                        )}
                                                    </span>
                                                </div>
                                                {maintenance.estimated_duration && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {
                                                                maintenance.estimated_duration
                                                            }
                                                            h
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                                {maintenance.estimated_cost && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <DollarSign className="h-3 w-3 text-gray-400" />
                                                        <span className="text-blue-600">
                                                            {formatCurrency(
                                                                maintenance.estimated_cost
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {maintenance.actual_cost && (
                                                    <div className="text-xs text-gray-600">
                                                        Thực tế:{" "}
                                                        {formatCurrency(
                                                            maintenance.actual_cost
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Quick Status Actions */}
                                                {maintenance.status ===
                                                    "scheduled" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleQuickStatusUpdate(
                                                                maintenance,
                                                                "in_progress"
                                                            )
                                                        }
                                                        className="text-green-600 hover:bg-green-50"
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {maintenance.status ===
                                                    "in_progress" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleQuickStatusUpdate(
                                                                maintenance,
                                                                "completed"
                                                            )
                                                        }
                                                        className="text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </Button>
                                                )}

                                                {/* More Actions Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onView(
                                                                    maintenance.maintenance_id
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onEdit(
                                                                    maintenance.maintenance_id
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />

                                                        {/* Status Updates */}
                                                        {maintenance.status !==
                                                            "in_progress" &&
                                                            maintenance.status !==
                                                                "completed" && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleQuickStatusUpdate(
                                                                            maintenance,
                                                                            "in_progress"
                                                                        )
                                                                    }
                                                                >
                                                                    <Play className="h-4 w-4 mr-2" />
                                                                    Bắt đầu thực
                                                                    hiện
                                                                </DropdownMenuItem>
                                                            )}

                                                        {maintenance.status ===
                                                            "in_progress" && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleQuickStatusUpdate(
                                                                            maintenance,
                                                                            "completed"
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                    Hoàn thành
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {maintenance.status !==
                                                            "completed" && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleQuickStatusUpdate(
                                                                        maintenance,
                                                                        "cancelled"
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Hủy bỏ
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onDelete(
                                                                    maintenance.maintenance_id
                                                                )
                                                            }
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
