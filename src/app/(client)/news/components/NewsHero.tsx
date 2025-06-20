// client/src/app/(client)/news/components/NewsHero.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsArticle } from "../types/newsTypes";
import { Calendar, User, Eye, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NewsHeroProps {
    featuredNews: NewsArticle[];
}

export default function NewsHero({ featuredNews }: NewsHeroProps) {
    if (!featuredNews.length) return null;

    const mainNews = featuredNews[0];
    const sideNews = featuredNews.slice(1, 3);

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

    return (
        <section className="bg-gradient-to-br from-blue-50 to-white py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Tin tức & Thông báo
                    </h1>
                    <p className="text-xl text-gray-600">
                        Cập nhật thông tin mới nhất về hoạt động thể thao tại
                        TVU
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Featured News */}
                    <div className="lg:col-span-2">
                        <Link href={`/news/${mainNews.slug}`} className="group">
                            <article className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="relative h-96 overflow-hidden">
                                    <Image
                                        src={getImageUrl(mainNews.thumbnail)}
                                        alt={mainNews.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <div className="mb-4">
                                            <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                                Tin nổi bật
                                            </span>
                                        </div>

                                        <h2 className="text-white text-3xl font-bold mb-4 line-clamp-2 group-hover:text-blue-300 transition-colors">
                                            {mainNews.title}
                                        </h2>

                                        {mainNews.summary && (
                                            <p className="text-gray-200 text-lg mb-4 line-clamp-2">
                                                {mainNews.summary}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-6 text-gray-300 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {mainNews.author_name ||
                                                    "Admin"}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(
                                                    mainNews.published_at ||
                                                        mainNews.created_at
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                {mainNews.view_count.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </div>

                    {/* Side Featured News */}
                    <div className="space-y-6">
                        {sideNews.map((article) => (
                            <Link
                                key={article.news_id}
                                href={`/news/${article.slug}`}
                                className="group"
                            >
                                <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="relative h-32 overflow-hidden">
                                        <Image
                                            src={getImageUrl(article.thumbnail)}
                                            alt={article.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                {article.category_name ||
                                                    "Tin tức"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {article.title}
                                        </h3>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                {formatDate(
                                                    article.published_at ||
                                                        article.created_at
                                                )}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {article.view_count}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}

                        {/* View All Button */}
                        <div className="text-center">
                            <Link
                                href="#latest-news"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            >
                                Xem tất cả tin tức
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
