// file TodayScheduleItem được sử dụng để hiển thị các thông tin của người dùng trong bảng thống kê người dùng

import React from "react";

interface TodayScheduleItemProps {
    time: string;
    field: string;
    user: string;
    status: "ongoing" | "upcoming" | "completed";
}

export default function TodayScheduleItem({
    time,
    field,
    user,
    status,
}: TodayScheduleItemProps) {
    const statusColors = {
        ongoing: "text-green-600",
        upcoming: "text-blue-600",
        completed: "text-gray-500",
    };

    return (
        <div className="flex items-start gap-3">
            <div className="pt-1">
                <div
                    className={`h-2.5 w-2.5 rounded-full ${
                        status === "ongoing" ? "bg-green-500" : "bg-blue-500"
                    }`}
                ></div>
            </div>
            <div className="space-y-1">
                <p className={`text-sm font-medium ${statusColors[status]}`}>
                    {time}
                </p>
                <p className="text-sm">{field}</p>
                <p className="text-xs text-gray-500">Người đặt: {user}</p>
            </div>
        </div>
    );
}
