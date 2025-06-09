"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import NewsCard from "../shared/NewsCard";

interface NewsArticle {
    news_id: number;
    title: string;
    content: string;
    summary?: string;
    thumbnail: string | null;
    created_at: string;
    category: string;
    category_name?: string;
    slug: string;
    view_count?: number;
    is_featured?: number;
}

export default function NewsSection() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);

                const response = await fetchApi(
                    "/news/public?limit=12&is_published=true"
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log("News data:", data);

                    // Sắp xếp để ưu tiên hiển thị tin đa dạng
                    // Trộn tin nổi bật và tin thường để tạo sự đa dạng
                    const sortedNews = [...data]
                        .sort((a, b) => {
                            // Chỉ ưu tiên tin nổi bật ở vị trí đầu tiên
                            if (
                                (a.is_featured === 1) !==
                                (b.is_featured === 1)
                            ) {
                                return a.is_featured === 1 ? -1 : 1;
                            }

                            // Chủ yếu sắp xếp theo thời gian tạo mới nhất
                            return (
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                            );
                        })
                        .slice(0, 3); // Lấy 3 bài viết đầu tiên

                    setNews(sortedNews);
                } else {
                    console.error("Failed to fetch news:", response.status);
                    setError("Không thể tải tin tức");
                }
            } catch (error) {
                console.error("Error fetching news:", error);
                setError("Đã xảy ra lỗi khi tải tin tức");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Định dạng ngày tháng (VD: 05/06/2025)
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // URL ảnh
    const getImageUrl = (path: string | null): string => {
        if (!path) return "/images/placeholder.jpg";
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Tin tức & Thông báo
                        </h2>
                        <p className="text-gray-600">
                            Thông tin mới nhất về sự kiện và hoạt động thể thao
                        </p>
                    </div>
                    <Link
                        href="/news"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem tất cả
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <span className="ml-2 text-gray-600">
                            Đang tải tin tức...
                        </span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {news.map((article) => (
                            <NewsCard
                                key={article.news_id}
                                id={article.news_id}
                                title={article.title}
                                summary={
                                    article.summary ||
                                    article.content.substring(0, 150) + "..."
                                }
                                date={formatDate(article.created_at)}
                                image={getImageUrl(article.thumbnail)}
                                category={
                                    article.category_name ||
                                    article.category ||
                                    "Tin tức"
                                }
                                slug={article.slug || `news-${article.news_id}`}
                                view_count={article.view_count}
                                is_featured={article.is_featured}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            Không có tin tức nào để hiển thị
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Hãy quay lại sau
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
