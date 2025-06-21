// client/src/app/(admin)/dashboard/rentals/components/RentalStatusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle,
    Activity,
    RotateCcw,
    XCircle,
    AlertTriangle,
    CreditCard,
    DollarSign,
    RefreshCw,
} from "lucide-react";

interface RentalStatusBadgeProps {
    status:
        | "pending"
        | "approved"
        | "active"
        | "returned"
        | "cancelled"
        | "overdue";
    paymentStatus?: "pending" | "paid" | "refunded";
    size?: "sm" | "default" | "lg";
}

export default function RentalStatusBadge({
    status,
    paymentStatus,
    size = "default",
}: RentalStatusBadgeProps) {
    // Size classes
    const getSizeClasses = (size: "sm" | "default" | "lg") => {
        switch (size) {
            case "sm":
                return "text-xs px-2 py-0.5 h-5";
            case "lg":
                return "text-sm px-3 py-1 h-8";
            default:
                return "text-xs px-2.5 py-1 h-6";
        }
    };

    // Icon size
    const getIconSize = (size: "sm" | "default" | "lg") => {
        switch (size) {
            case "sm":
                return "h-2.5 w-2.5";
            case "lg":
                return "h-4 w-4";
            default:
                return "h-3 w-3";
        }
    };

    const iconSizeClass = getIconSize(size);
    const sizeClasses = getSizeClasses(size);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "Chờ duyệt",
                    variant: "secondary" as const,
                    className:
                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                    icon: <Clock className={iconSizeClass} />,
                };
            case "approved":
                return {
                    label: "Đã duyệt",
                    variant: "default" as const,
                    className: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: <CheckCircle className={iconSizeClass} />,
                };
            case "active":
                return {
                    label: "Đang thuê",
                    variant: "default" as const,
                    className: "bg-green-100 text-green-800 border-green-200",
                    icon: <Activity className={iconSizeClass} />,
                };
            case "returned":
                return {
                    label: "Đã trả",
                    variant: "default" as const,
                    className:
                        "bg-emerald-100 text-emerald-800 border-emerald-200",
                    icon: <RotateCcw className={iconSizeClass} />,
                };
            case "cancelled":
                return {
                    label: "Đã hủy",
                    variant: "destructive" as const,
                    className: "bg-red-100 text-red-800 border-red-200",
                    icon: <XCircle className={iconSizeClass} />,
                };
            case "overdue":
                return {
                    label: "Quá hạn",
                    variant: "destructive" as const,
                    className:
                        "bg-orange-100 text-orange-800 border-orange-200",
                    icon: <AlertTriangle className={iconSizeClass} />,
                };
            default:
                return {
                    label: status,
                    variant: "secondary" as const,
                    className: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: <Clock className={iconSizeClass} />,
                };
        }
    };

    const getPaymentStatusConfig = (paymentStatus: string) => {
        const paymentIconSize = getIconSize("sm");

        switch (paymentStatus) {
            case "pending":
                return {
                    label: "Chưa thanh toán",
                    className:
                        "bg-orange-100 text-orange-800 border-orange-200",
                    icon: <CreditCard className={paymentIconSize} />,
                };
            case "paid":
                return {
                    label: "Đã thanh toán",
                    className: "bg-green-100 text-green-800 border-green-200",
                    icon: <DollarSign className={paymentIconSize} />,
                };
            case "refunded":
                return {
                    label: "Đã hoàn tiền",
                    className:
                        "bg-purple-100 text-purple-800 border-purple-200",
                    icon: <RefreshCw className={paymentIconSize} />,
                };
            default:
                return {
                    label: paymentStatus,
                    className: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: <CreditCard className={paymentIconSize} />,
                };
        }
    };

    const statusConfig = getStatusConfig(status);
    const paymentConfig = paymentStatus
        ? getPaymentStatusConfig(paymentStatus)
        : null;

    return (
        <div className="flex flex-col gap-1">
            {/* Main status badge */}
            <Badge
                variant={statusConfig.variant}
                className={`${statusConfig.className} ${sizeClasses} flex items-center gap-1 w-fit`}
            >
                {statusConfig.icon}
                {statusConfig.label}
            </Badge>

            {/* Payment status badge */}
            {paymentConfig && (
                <Badge
                    variant="outline"
                    className={`${paymentConfig.className} ${getSizeClasses(
                        "sm"
                    )} flex items-center gap-1 w-fit`}
                >
                    {paymentConfig.icon}
                    {paymentConfig.label}
                </Badge>
            )}
        </div>
    );
}
