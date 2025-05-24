import React from "react";
import {
    CalendarClock,
    Clock,
    CheckCircle,
    CalendarX,
    Star,
    Calendar,
} from "lucide-react";
import { EventStats as EventStatsType } from "../types/eventTypes";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

function StatsCard({
    title,
    value,
    icon,
    description,
    bgColor,
    textColor,
    borderColor,
}: StatsCardProps) {
    return (
        <div className={`rounded-lg p-4 ${bgColor} ${borderColor} border`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold mt-1 ${textColor}`}>
                        {value}
                    </p>
                    {description && (
                        <p className="text-xs text-gray-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                <div
                    className={`p-2 rounded-full ${bgColor} ${textColor} border ${borderColor}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface EventStatsProps {
    stats: EventStatsType;
}

export default function EventStats({ stats }: EventStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatsCard
                title="Tổng số sự kiện"
                value={stats.totalEvents}
                icon={<Calendar className="h-5 w-5" />}
                bgColor="bg-gray-50"
                textColor="text-gray-700"
                borderColor="border-gray-200"
            />
            <StatsCard
                title="Sắp diễn ra"
                value={stats.upcomingEvents}
                icon={<CalendarClock className="h-5 w-5" />}
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-200"
            />
            <StatsCard
                title="Đang diễn ra"
                value={stats.ongoingEvents}
                icon={<Clock className="h-5 w-5" />}
                bgColor="bg-green-50"
                textColor="text-green-700"
                borderColor="border-green-200"
            />
            <StatsCard
                title="Đã hoàn thành"
                value={stats.completedEvents}
                icon={<CheckCircle className="h-5 w-5" />}
                bgColor="bg-gray-50"
                textColor="text-gray-700"
                borderColor="border-gray-200"
            />
            <StatsCard
                title="Đã hủy"
                value={stats.cancelledEvents}
                icon={<CalendarX className="h-5 w-5" />}
                bgColor="bg-red-50"
                textColor="text-red-700"
                borderColor="border-red-200"
            />
            <StatsCard
                title="Sự kiện nổi bật"
                value={stats.featuredEvents}
                icon={<Star className="h-5 w-5" />}
                description={
                    stats.mostPopularEvent
                        ? `Nhiều người tham gia nhất: ${stats.mostPopularEvent.title}`
                        : undefined
                }
                bgColor="bg-amber-50"
                textColor="text-amber-700"
                borderColor="border-amber-200"
            />
        </div>
    );
}
