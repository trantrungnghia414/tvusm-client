// client/src/app/(admin)/dashboard/payments/components/PaymentStatusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Payment } from "../types/payment";

interface PaymentStatusBadgeProps {
    status: Payment["status"];
    size?: "sm" | "md" | "lg";
}

export default function PaymentStatusBadge({
    status,
    size = "md",
}: PaymentStatusBadgeProps) {
    const getStatusConfig = (status: Payment["status"]) => {
        switch (status) {
            case "pending":
                return {
                    label: "Chờ xử lý",
                    variant: "secondary" as const,
                    className:
                        "bg-orange-100 text-orange-800 hover:bg-orange-200",
                };
            case "completed":
                return {
                    label: "Thành công",
                    variant: "default" as const,
                    className: "bg-green-100 text-green-800 hover:bg-green-200",
                };
            case "failed":
                return {
                    label: "Thất bại",
                    variant: "destructive" as const,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                };
            case "refunded":
                return {
                    label: "Đã hoàn tiền",
                    variant: "outline" as const,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                };
            case "cancelled":
                return {
                    label: "Đã hủy",
                    variant: "secondary" as const,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
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
