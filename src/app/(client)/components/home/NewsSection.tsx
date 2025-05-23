import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
    id: number;
    title: string;
    summary: string;
    date: string;
    image: string;
    category: string;
    slug: string;
}

export default function NewsSection() {
    const news: NewsArticle[] = [
        {
            id: 1,
            title: "Lễ khai mạc Hội thao sinh viên TVU 2025",
            summary:
                "Ngày 10/06/2025, Trường Đại học Trà Vinh tổ chức Lễ khai mạc Hội thao sinh viên năm 2025 với nhiều môn thi đấu hấp dẫn.",
            date: "05/06/2025",
            image: "/images/news-1.jpg",
            category: "Sự kiện",
            slug: "le-khai-mac-hoi-thao-sinh-vien-tvu-2025",
        },
        {
            id: 2,
            title: "Cập nhật giá thuê sân mới nhất năm 2025",
            summary:
                "TVU Sports Hub thông báo cập nhật bảng giá thuê sân áp dụng từ ngày 01/06/2025 với nhiều ưu đãi dành cho sinh viên.",
            date: "01/06/2025",
            image: "/images/news-2.jpg",
            category: "Thông báo",
            slug: "cap-nhat-gia-thue-san-moi-nhat-nam-2025",
        },
        {
            id: 3,
            title: "Hướng dẫn đặt sân trực tuyến trên TVU Sports Hub",
            summary:
                "Bài viết hướng dẫn chi tiết cách thức đặt sân trực tuyến trên hệ thống TVU Sports Hub mới được nâng cấp.",
            date: "28/05/2025",
            image: "/images/news-3.jpg",
            category: "Hướng dẫn",
            slug: "huong-dan-dat-san-truc-tuyen-tren-tvu-sports-hub",
        },
    ];

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {news.map((article) => (
                        <div
                            key={article.id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {article.category}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-3 right-3">
                                    <Badge
                                        variant="outline"
                                        className="bg-white/80 backdrop-blur-sm"
                                    >
                                        {article.date}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {article.summary}
                                </p>

                                <Link href={`/news/${article.slug}`}>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Đọc tiếp{" "}
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
