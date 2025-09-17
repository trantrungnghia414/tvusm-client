// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceStatusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Maintenance } from "../types/maintenance";

interface MaintenanceStatusBadgeProps {
    status: Maintenance["status"];
    size?: "sm" | "md" | "lg";
}

export default function MaintenanceStatusBadge({
    status,
    size = "md",
}: MaintenanceStatusBadgeProps) {
    const getStatusConfig = (status: Maintenance["status"]) => {
        switch (status) {
            case "scheduled":
                return {
                    label: "Đã lên lịch",
                    variant: "secondary" as const,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                };
            case "in_progress":
                return {
                    label: "Đang thực hiện",
                    variant: "default" as const,
                    className:
                        "bg-purple-100 text-purple-800 hover:bg-purple-200",
                };
            case "completed":
                return {
                    label: "Hoàn thành",
                    variant: "default" as const,
                    className: "bg-green-100 text-green-800 hover:bg-green-200",
                };
            case "cancelled":
                return {
                    label: "Đã hủy",
                    variant: "secondary" as const,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
                };
            case "overdue":
                return {
                    label: "Quá hạn",
                    variant: "destructive" as const,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                };
            default:
                return {
                    label: "Không xác định",
                    variant: "outline" as const,
                    className: "bg-gray-100 text-gray-600",
                };
        }
    };

    const config = getStatusConfig(status);
    const sizeClass =
        size === "sm"
            ? "text-xs px-2 py-1"
            : size === "lg"
            ? "text-sm px-3 py-2"
            : "";

    return (
        <Badge
            variant={config.variant}
            className={`${config.className} ${sizeClass}`}
        >
            {config.label}
        </Badge>
    );
}
