// client/src/app/(client)/news/components/NewsGrid.tsx
"use client";

import React from "react";
import { NewsArticle } from "../types/newsTypes";
import NewsCard from "./NewsCard";
import { Loader2 } from "lucide-react";

interface NewsGridProps {
    articles: NewsArticle[];
    loading?: boolean;
    variant?: "default" | "compact";
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export default function NewsGrid({
    articles,
    loading = false,
    variant = "default",
    columns = 3,
    className = "",
}: NewsGridProps) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    };

    if (loading) {
        return (
            <div
                className={`flex justify-center items-center py-20 ${className}`}
            >
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải tin tức...</p>
                </div>
            </div>
        );
    }

    if (!articles.length) {
        return (
            <div className={`text-center py-20 ${className}`}>
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không có tin tức nào
                    </h3>
                    <p className="text-gray-600">
                        Không tìm thấy tin tức phù hợp với bộ lọc của bạn.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
            {articles.map((article) => (
                <NewsCard
                    key={article.news_id}
                    article={article}
                    variant={variant}
                />
            ))}
        </div>
    );
}
