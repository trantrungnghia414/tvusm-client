// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceTypeBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Wrench, Zap, Calendar } from "lucide-react";
import type { Maintenance } from "../types/maintenance";

interface MaintenanceTypeBadgeProps {
    type: Maintenance["type"];
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function MaintenanceTypeBadge({
    type,
    showIcon = true,
    size = "md",
}: MaintenanceTypeBadgeProps) {
    const getTypeConfig = (type: Maintenance["type"]) => {
        switch (type) {
            case "preventive":
                return {
                    label: "Dự phòng",
                    icon: <Shield className="h-3 w-3" />,
                    className: "bg-green-100 text-green-800 hover:bg-green-200",
                };
            case "corrective":
                return {
                    label: "Sửa chữa",
                    icon: <Wrench className="h-3 w-3" />,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                };
            case "emergency":
                return {
                    label: "Khẩn cấp",
                    icon: <Zap className="h-3 w-3" />,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                };
            case "routine":
                return {
                    label: "Định kỳ",
                    icon: <Calendar className="h-3 w-3" />,
                    className:
                        "bg-purple-100 text-purple-800 hover:bg-purple-200",
                };
            default:
                return {
                    label: "Khác",
                    icon: <Wrench className="h-3 w-3" />,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
                };
        }
    };

    const config = getTypeConfig(type);
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
