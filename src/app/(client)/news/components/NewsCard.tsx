// client/src/app/(client)/news/components/NewsCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, Calendar, User, Star } from "lucide-react";
import { NewsArticle } from "../types/newsTypes";

interface NewsCardProps {
    article: NewsArticle;
    variant?: "default" | "featured" | "compact";
    className?: string;
}

export default function NewsCard({
    article,
    variant = "default",
    className = "",
}: NewsCardProps) {
    const getImageUrl = (path: string | undefined): string => {
        if (!path) return "/images/placeholder-news.jpg";
        if (path.startsWith("http")) return path;
        return `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }${path}`;
    };

    const formatDate = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi,
            });
        } catch {
            return "Vừa xong";
        }
    };

    if (variant === "featured") {
        return (
            <Link
                href={`/news/${article.slug}`}
                className={`group ${className}`}
            >
                <article className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    {/* Featured Badge */}
                    {article.is_featured === 1 && (
                        <div className="absolute top-4 left-4 z-10">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Nổi bật
                            </div>
                        </div>
                    )}

                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                        <Image
                            src={getImageUrl(article.thumbnail)}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Category */}
                        <div className="absolute bottom-4 left-4">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {article.category_name || "Tin tức"}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                        </h3>

                        {article.summary && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {article.summary}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {article.author_name || "Admin"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(
                                        article.published_at ||
                                            article.created_at
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {article.view_count.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }

    if (variant === "compact") {
        return (
            <Link
                href={`/news/${article.slug}`}
                className={`group ${className}`}
            >
                <article className="flex gap-4 bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
                    {/* Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                            src={getImageUrl(article.thumbnail)}
                            alt={article.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                            {article.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>
                                {formatDate(
                                    article.published_at || article.created_at
                                )}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.view_count}
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/news/${article.slug}`} className={`group ${className}`}>
            <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={getImageUrl(article.thumbnail)}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {article.category_name || "Tin tức"}
                        </span>
                        {article.is_featured === 1 && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Hot
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                    </h3>

                    {article.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {article.summary}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {article.author_name || "Admin"}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(
                                    article.published_at || article.created_at
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.view_count}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
