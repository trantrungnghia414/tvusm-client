// client/src/app/(admin)/dashboard/maintenances/components/MaintenancePriorityBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";
import type { Maintenance } from "../types/maintenance";

interface MaintenancePriorityBadgeProps {
    priority: Maintenance["priority"];
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function MaintenancePriorityBadge({
    priority,
    showIcon = true,
    size = "md",
}: MaintenancePriorityBadgeProps) {
    const getPriorityConfig = (priority: Maintenance["priority"]) => {
        switch (priority) {
            case "low":
                return {
                    label: "Thấp",
                    icon: <Info className="h-3 w-3" />,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                };
            case "medium":
                return {
                    label: "Trung bình",
                    icon: <AlertCircle className="h-3 w-3" />,
                    className:
                        "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                };
            case "high":
                return {
                    label: "Cao",
                    icon: <AlertTriangle className="h-3 w-3" />,
                    className:
                        "bg-orange-100 text-orange-800 hover:bg-orange-200",
                };
            case "critical":
                return {
                    label: "Khẩn cấp",
                    icon: <Zap className="h-3 w-3" />,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                };
            default:
                return {
                    label: "Không xác định",
                    icon: <Info className="h-3 w-3" />,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
                };
        }
    };

    const config = getPriorityConfig(priority);
    const sizeClass =
        size === "sm"
            ? "text-xs px-2 py-1"
            : size === "lg"
            ? "text-sm px-3 py-2"
            : "";

    return (
        <Badge
            variant="secondary"
            className={`${config.className} ${sizeClass} ${
                showIcon ? "flex items-center gap-1" : ""
            }`}
        >
            {showIcon && config.icon}
            {config.label}
        </Badge>
    );
}
