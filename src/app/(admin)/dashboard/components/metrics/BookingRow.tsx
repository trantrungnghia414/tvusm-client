// file BookingRow được sử dụng để hiển thị các thông tin của người dùng trong bảng thống kê người dùng

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";

interface BookingRowProps {
    id: string;
    user: string;
    field: string;
    time: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    onDetailClick?: (id: string) => void;
}

export default function BookingRow({
    id,
    user,
    field,
    time,
    status,
    onDetailClick,
}: BookingRowProps) {
    const statusConfig = {
        pending: {
            color: "bg-yellow-100 text-yellow-700",
            label: "Chờ xác nhận",
        },
        confirmed: { color: "bg-blue-100 text-blue-700", label: "Đã xác nhận" },
        completed: {
            color: "bg-green-100 text-green-700",
            label: "Hoàn thành",
        },
        cancelled: { color: "bg-red-100 text-red-700", label: "Đã hủy" },
    };

    return (
        <TableRow>
            <TableCell className="font-medium">
                {id.replace(/^B-/, "")}
            </TableCell>
            <TableCell>{user}</TableCell>
            <TableCell className="hidden md:table-cell">{field}</TableCell>
            <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                {time}
            </TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className={`${statusConfig[status].color} border-0`}
                >
                    {statusConfig[status].label}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onDetailClick?.(id)}
                >
                    Chi tiết
                </Button>
            </TableCell>
        </TableRow>
    );
}
