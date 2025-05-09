// file UserItem được sử dụng để hiển thị các thông tin của người dùng trong bảng thống kê người dùng

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UserRole = "Sinh viên" | "Giảng viên" | "Khách";

interface UserItemProps {
    name: string;
    email: string;
    role: UserRole;
    isNew?: boolean;
}

export default function UserItem({
    name,
    email,
    role,
    isNew = false,
}: UserItemProps) {
    const roleColors = {
        "Sinh viên": "bg-blue-50 text-blue-700 border-blue-200",
        "Giảng viên": "bg-purple-50 text-purple-700 border-purple-200",
        Khách: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{name}</p>
                    {isNew && (
                        <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                            Mới
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-500">{email}</p>
                <Badge
                    variant="outline"
                    className={`text-xs font-normal ${
                        roleColors[role] || "bg-gray-50"
                    }`}
                >
                    {role}
                </Badge>
            </div>
        </div>
    );
}
