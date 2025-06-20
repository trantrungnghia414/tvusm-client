// client/src/app/(client)/news/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    ArrowLeft,
    Calendar,
    User,
    Eye,
    Share2,
    Facebook,
    Twitter,
    Link as LinkIcon,
    Star,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/app/(client)/components/layout/FixedNavbar";
import Footer from "@/app/(client)/components/layout/Footer";
import NewsCard from "../components/NewsCard";
import { NewsArticle } from "../types/newsTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);

                // Fetch article by slug
                const response = await fetchApi(`/news/slug/${slug}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        router.push("/news");
                        toast.error("Không tìm thấy tin tức");
                        return;
                    }
                    throw new Error("Failed to fetch article");
                }

                const articleData = await response.json();
                setArticle(articleData);

                // Fetch related news
                if (articleData.category_id) {
                    try {
                        const relatedResponse = await fetchApi(
                            `/news/categories/${articleData.category_id}?limit=3`
                        );
                        if (relatedResponse.ok) {
                            const relatedData = await relatedResponse.json();
                            // Filter out current article
                            const filtered = relatedData.filter(
                                (item: NewsArticle) =>
                                    item.news_id !== articleData.news_id
                            );
                            setRelatedNews(filtered.slice(0, 3));
                        }
                    } catch (error) {
                        console.error("Error fetching related news:", error);
                    }
                }
            } catch (error) {
                console.error("Error fetching article:", error);
                toast.error("Không thể tải tin tức");
                router.push("/news");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug, router]);

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

    const formatFullDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), "HH:mm 'ngày' dd/MM/yyyy", {
                locale: vi,
            });
        } catch {
            return "";
        }
    };

    const handleShare = async (platform?: "facebook" | "twitter" | "copy") => {
        const currentUrl = window.location.href;
        const title = article?.title || "Tin tức từ TVU Sports Hub";

        if (platform === "facebook") {
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    currentUrl
                )}`,
                "_blank"
            );
        } else if (platform === "twitter") {
            window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    currentUrl
                )}&text=${encodeURIComponent(title)}`,
                "_blank"
            );
        } else {
            // Copy to clipboard
            try {
                await navigator.clipboard.writeText(currentUrl);
                toast.success("Đã sao chép liên kết");
            } catch {
                toast.error("Không thể sao chép liên kết");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center py-20 mt-16">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải tin tức...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-20 mt-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Không tìm thấy tin tức
                    </h1>
                    <Button onClick={() => router.push("/news")}>
                        Quay lại trang tin tức
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-14">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/news")}
                                className="gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Tin tức
                            </Button>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-600">
                                {article.category_name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <article className="py-12">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {/* Header */}
                        <header className="mb-8">
                            {/* Categories and badges */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <Badge
                                    variant="default"
                                    className="bg-blue-600"
                                >
                                    {article.category_name}
                                </Badge>
                                {article.is_featured === 1 && (
                                    <Badge
                                        variant="destructive"
                                        className="gap-1"
                                    >
                                        <Star className="h-3 w-3 fill-current" />
                                        Nổi bật
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            {/* Summary */}
                            {article.summary && (
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    {article.summary}
                                </p>
                            )}

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <span>
                                        {article.author_name || "Admin"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>
                                        {formatFullDate(
                                            article.published_at ||
                                                article.created_at
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>
                                        {formatDate(
                                            article.published_at ||
                                                article.created_at
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    <span>
                                        {article.view_count.toLocaleString()}{" "}
                                        lượt xem
                                    </span>
                                </div>
                            </div>

                            {/* Share buttons */}
                            <div className="flex items-center gap-3 pb-8 border-b">
                                <span className="text-gray-600 font-medium">
                                    Chia sẻ:
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare("facebook")}
                                        className="gap-2"
                                    >
                                        <Facebook className="h-4 w-4" />
                                        Facebook
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare("twitter")}
                                        className="gap-2"
                                    >
                                        <Twitter className="h-4 w-4" />
                                        Twitter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare("copy")}
                                        className="gap-2"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        Sao chép
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {article.thumbnail && (
                            <div className="mb-12">
                                <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
                                    <Image
                                        src={getImageUrl(article.thumbnail)}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: article.content,
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 pt-8 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    Cập nhật lần cuối:{" "}
                                    {formatFullDate(article.updated_at)}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 text-sm">
                                        Chia sẻ:
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleShare()}
                                        className="gap-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Chia sẻ
                                    </Button>
                                </div>
                            </div>
                        </footer>
                    </div>
                </article>

                {/* Related News */}
                {relatedNews.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Tin tức liên quan
                                </h2>
                                <p className="text-gray-600">
                                    Những tin tức khác trong cùng danh mục
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {relatedNews.map((relatedArticle) => (
                                    <NewsCard
                                        key={relatedArticle.news_id}
                                        article={relatedArticle}
                                        variant="default"
                                    />
                                ))}
                            </div>

                            <div className="text-center mt-12">
                                <Button
                                    onClick={() => router.push("/news")}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    Xem tất cả tin tức
                                    <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
