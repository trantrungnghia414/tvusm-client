import {
    BookText,
    FileText,
    Archive,
    Star,
    // Eye,
    // ArrowUpRight,
    Newspaper,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewsStats as NewsStatsType } from "../types/newsTypes";

interface StatsCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ReactNode;
    iconBg: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
}

function StatsCard({
    title,
    value,
    description,
    icon,
    iconBg,
}: StatsCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold mt-1">{value}</h3>
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <div
                        className={`${iconBg} p-3 rounded-full h-12 w-12 flex items-center justify-center`}
                    >
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface NewsStatsProps {
    stats: NewsStatsType;
}

export default function NewsStats({ stats }: NewsStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
                title="Tổng số tin tức"
                value={stats.totalNews}
                icon={<Newspaper className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-50"
            />
            <StatsCard
                title="Đã xuất bản"
                value={stats.publishedNews}
                icon={<BookText className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-50"
            />
            <StatsCard
                title="Bản nháp"
                value={stats.draftNews}
                icon={<FileText className="h-5 w-5 text-amber-600" />}
                iconBg="bg-amber-50"
            />
            <StatsCard
                title="Đã lưu trữ"
                value={stats.archivedNews}
                icon={<Archive className="h-5 w-5 text-gray-600" />}
                iconBg="bg-gray-100"
            />
            <StatsCard
                title="Tin nổi bật"
                value={stats.featuredNews}
                icon={<Star className="h-5 w-5 text-purple-600" />}
                iconBg="bg-purple-50"
            />
        </div>
    );
}
