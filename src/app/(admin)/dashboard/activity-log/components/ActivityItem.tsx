// client/src/app/(admin)/dashboard/activity-log/components/ActivityItem.tsx
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

    const getSeverityColor = () => {
        const severityMap = {
            low: "bg-green-100 text-green-800",
            medium: "bg-yellow-100 text-yellow-800",
            high: "bg-orange-100 text-orange-800",
            critical: "bg-red-100 text-red-800",
        };
        return severityMap[activity.severity];
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
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Activity Icon */}
                    <div
                        className={`p-2 rounded-lg shrink-0 ${getActivityColor()}`}
                    >
                        {getActivityIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {getActionText()}
                                    </Badge>
                                    <Badge
                                        className={`text-xs ${getSeverityColor()}`}
                                    >
                                        {activity.severity}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 shrink-0 ml-2">
                                {formatDate(activity.timestamp)}
                            </p>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={activity.user.avatar} />
                                <AvatarFallback className="text-xs">
                                    {activity.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-xs text-gray-600">
                                <span className="font-medium">
                                    {activity.user.name}
                                </span>
                                <span className="mx-1">•</span>
                                <span>{activity.user.role}</span>
                            </div>
                        </div>

                        {/* Target Info */}
                        {activity.target && (
                            <div className="text-xs text-gray-500 mb-2">
                                Đối tượng:{" "}
                                <span className="font-medium">
                                    {activity.target.name}
                                </span>
                                <span className="mx-1">•</span>
                                <span>{activity.target.type}</span>
                            </div>
                        )}

                        {/* Metadata */}
                        {activity.metadata &&
                            Object.keys(activity.metadata).length > 0 && (
                                <div className="text-xs text-gray-500">
                                    {Object.entries(activity.metadata).map(
                                        ([key, value]) => (
                                            <span key={key} className="mr-3">
                                                {key}:{" "}
                                                <span className="font-medium">
                                                    {String(value)}
                                                </span>
                                            </span>
                                        )
                                    )}
                                </div>
                            )}

                        {/* IP Address */}
                        {activity.ip_address && (
                            <div className="text-xs text-gray-400 mt-1">
                                IP: {activity.ip_address}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
