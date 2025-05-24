import React from "react";
import { FileText, BookOpen, Clock, Archive, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsStatsType } from "../types/newsTypes";

interface NewsStatsProps {
    stats: NewsStatsType;
}

export default function NewsStats({ stats }: NewsStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tổng số tin tức
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalNews}</div>
                    <p className="text-xs text-muted-foreground">
                        Bài viết trong hệ thống
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Đã xuất bản
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.publishedNews}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tin tức đã xuất bản
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Bản nháp
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.draftNews}</div>
                    <p className="text-xs text-muted-foreground">
                        Tin tức đang soạn thảo
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tin nổi bật
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.featuredNews}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tin được đánh dấu nổi bật
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
