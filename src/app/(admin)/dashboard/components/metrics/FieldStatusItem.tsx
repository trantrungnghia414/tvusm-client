// file FieldStatusItem được sử dụng để hiển thị các thông tin của sân trong bảng thống kê sân

import React from "react";
import { Badge } from "@/components/ui/badge";

interface FieldStatusItemProps {
    name: string;
    status: "available" | "in-use" | "maintenance";
    bookingCount: number;
}

export default function FieldStatusItem({
    name,
    status,
    bookingCount,
}: FieldStatusItemProps) {
    const statusColors = {
        available: {
            text: "text-green-600",
            bg: "bg-green-100",
            label: "Có sẵn",
        },
        "in-use": {
            text: "text-blue-600",
            bg: "bg-blue-100",
            label: "Đang sử dụng",
        },
        maintenance: {
            text: "text-orange-600",
            bg: "bg-orange-100",
            label: "Bảo trì",
        },
    };

    const statusStyle = statusColors[status];

    return (
        <div className="space-y-2 px-2">
            <div className="flex justify-between items-center">
                <div className="font-medium text-sm">{name}</div>
                <Badge
                    variant="outline"
                    className={`${statusStyle.bg} ${statusStyle.text} border-0`}
                >
                    {statusStyle.label}
                </Badge>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Số lượt đặt sân</span>
                    <span className="font-medium">{bookingCount} lượt</span>
                </div>
            </div>
        </div>
    );
}
