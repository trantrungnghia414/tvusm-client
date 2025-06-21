// client/src/app/(admin)/dashboard/payments/components/PaymentMethodBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Smartphone, Building } from "lucide-react";
import { Payment } from "../types/payment";

interface PaymentMethodBadgeProps {
    method: Payment["payment_method"];
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function PaymentMethodBadge({
    method,
    showIcon = true,
    size = "md",
}: PaymentMethodBadgeProps) {
    const getMethodConfig = (method: Payment["payment_method"]) => {
        switch (method) {
            case "cash":
                return {
                    label: "Tiền mặt",
                    icon: <Banknote className="h-3 w-3" />,
                    className: "bg-green-100 text-green-800 hover:bg-green-200",
                };
            case "bank_transfer":
                return {
                    label: "Chuyển khoản",
                    icon: <Building className="h-3 w-3" />,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                };
            case "vnpay":
                return {
                    label: "VNPay",
                    icon: <CreditCard className="h-3 w-3" />,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                };
            case "momo":
                return {
                    label: "MoMo",
                    icon: <Smartphone className="h-3 w-3" />,
                    className: "bg-pink-100 text-pink-800 hover:bg-pink-200",
                };
            default:
                return {
                    label: "Khác",
                    icon: <CreditCard className="h-3 w-3" />,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
                };
        }
    };

    const config = getMethodConfig(method);
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
