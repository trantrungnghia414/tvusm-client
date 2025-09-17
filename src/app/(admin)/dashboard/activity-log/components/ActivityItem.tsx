// client/src/app/(admin)/dashboard/activity-log/components/ActivityItem.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    CreditCard,
    User,
    Settings,
    FileText,
    Globe,
    MapPin,
    Activity,
} from "lucide-react";
import { ActivityLogItem } from "../types/activityTypes";
import { formatDate } from "@/lib/utils";

interface ActivityItemProps {
    activity: ActivityLogItem;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
    const getActivityIcon = () => {
        const iconMap = {
            booking: <Calendar className="h-4 w-4" />,
            payment: <CreditCard className="h-4 w-4" />,
            user: <User className="h-4 w-4" />,
            maintenance: <Settings className="h-4 w-4" />,
            system: <Globe className="h-4 w-4" />,
            event: <Activity className="h-4 w-4" />,
            news: <FileText className="h-4 w-4" />,
            venue: <MapPin className="h-4 w-4" />,
        };
        return iconMap[activity.type] || <Activity className="h-4 w-4" />;
    };

    const getActivityColor = () => {
        const colorMap = {
            booking: "text-blue-600 bg-blue-50",
            payment: "text-green-600 bg-green-50",
            user: "text-purple-600 bg-purple-50",
            maintenance: "text-orange-600 bg-orange-50",
            system: "text-gray-600 bg-gray-50",
            event: "text-indigo-600 bg-indigo-50",
            news: "text-cyan-600 bg-cyan-50",
            venue: "text-pink-600 bg-pink-50",
        };
        return colorMap[activity.type] || "text-gray-600 bg-gray-50";
    };

    const getActionText = () => {
        const actionMap = {
            create: "tạo mới",
            update: "cập nhật",
            delete: "xóa",
            login: "đăng nhập",
            logout: "đăng xuất",
            cancel: "hủy",
            approve: "phê duyệt",
            reject: "từ chối",
        };
        return actionMap[activity.action] || activity.action;
    };

    return (
        <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            {/* Activity Icon */}
            <div className={`p-2 rounded-lg shrink-0 ${getActivityColor()}`}>
                {getActivityIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                                {activity.user.name}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <Badge
                                variant="outline"
                                className="text-xs py-0 h-5"
                            >
                                {getActionText()}
                            </Badge>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2 shrink-0">
                        {formatDate(activity.timestamp)}
                    </div>
                </div>
            </div>
        </div>
    );
}
