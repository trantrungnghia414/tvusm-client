// client/src/app/(admin)/dashboard/feedbacks/components/StatusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Feedback } from "../types/feedback";

interface StatusBadgeProps {
    status: Feedback["status"];
    size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case "pending":
                return {
                    label: "Chờ duyệt",
                    variant: "secondary" as const,
                    icon: <Clock className="h-3 w-3" />,
                    className: "bg-orange-50 text-orange-700 border-orange-200",
                };
            case "approved":
                return {
                    label: "Đã duyệt",
                    variant: "secondary" as const,
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: "bg-green-50 text-green-700 border-green-200",
                };
            case "rejected":
                return {
                    label: "Đã từ chối",
                    variant: "secondary" as const,
                    icon: <XCircle className="h-3 w-3" />,
                    className: "bg-red-50 text-red-700 border-red-200",
                };
            default:
                return {
                    label: "Không xác định",
                    variant: "outline" as const,
                    icon: null,
                    className: "",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge
            variant={config.variant}
            className={`flex items-center gap-1 ${config.className} ${
                size === "sm"
                    ? "text-xs px-2 py-1"
                    : size === "lg"
                    ? "text-sm px-3 py-1"
                    : "text-xs px-2 py-1"
            }`}
        >
            {config.icon}
            {config.label}
        </Badge>
    );
}
