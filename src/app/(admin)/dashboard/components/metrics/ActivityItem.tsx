// file ActivityItem được sử dụng để hiển thị các hoạt động gần đây của người dùng

import React from "react";
import { Calendar, CreditCard, User, Settings, FileText } from "lucide-react";

interface ActivityItemProps {
    type: "booking" | "payment" | "user" | "maintenance" | "update";
    message: string;
    time: string;
}
//booking là đặt sân, payment là thanh toán, user là người dùng, maintenance là bảo trì, update là cập nhật

//ActivityItem được sử dụng để hiển thị các hoạt động gần đây của người dùng
export default function ActivityItem({
    type,
    message,
    time,
}: ActivityItemProps) {
    const typeConfig = {
        booking: {
            icon: <Calendar className="h-4 w-4 text-blue-600" />,
            bg: "bg-blue-50",
        },
        payment: {
            icon: <CreditCard className="h-4 w-4 text-green-600" />,
            bg: "bg-green-50",
        },
        user: {
            icon: <User className="h-4 w-4 text-purple-600" />,
            bg: "bg-purple-50",
        },
        maintenance: {
            icon: <Settings className="h-4 w-4 text-orange-600" />,
            bg: "bg-orange-50",
        },
        update: {
            icon: <FileText className="h-4 w-4 text-gray-600" />,
            bg: "bg-gray-50",
        },
    };

    return (
        <div className="flex gap-3">
            <div
                className={`${typeConfig[type].bg} p-2 rounded-full h-9 w-9 flex items-center justify-center shrink-0`}
            >
                {typeConfig[type].icon}
            </div>
            <div className="space-y-1">
                <p className="text-sm">{message}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}
