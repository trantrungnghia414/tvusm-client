import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface NewsCardProps {
    id: number;
    title: string;
    summary: string;
    date: string;
    image: string;
    category: string;
    slug: string;
    view_count?: number;
    is_featured?: number;
}

export default function NewsCard({
    id,
    title,
    summary,
    date,
    image,
    category,
    slug,
    view_count,
    is_featured,
}: NewsCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={false}
                />
                <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-blue-100 text-blue-800">
                        {category}
                    </Badge>
                </div>
                <div className="absolute bottom-3 right-3 z-10">
                    <Badge
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm"
                    >
                        {date}
                    </Badge>
                </div>
                {is_featured === 1 && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800"
                        >
                            Nổi bật
                        </Badge>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {summary || "\u00A0"}
                </p>

                <div className="flex items-center justify-between">
                    {view_count !== undefined && (
                        <div className="flex items-center text-gray-500 text-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            {view_count} lượt xem
                        </div>
                    )}

                    <Link href={`/news/${slug || id}`}>
                        <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Đọc tiếp <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
