"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Star, StarHalf, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Rating {
    rating_id: number;
    user_id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface CourtRatingsProps {
    ratings: Rating[];
    averageRating: number;
}

export default function CourtRatings({
    ratings,
    averageRating,
}: CourtRatingsProps) {
    const [showAll, setShowAll] = useState(false);
    const displayRatings = showAll ? ratings : ratings.slice(0, 5);

    // Render số sao dựa trên rating
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={`star-${i}`}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <StarHalf
                    key="half-star"
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star
                    key={`empty-star-${i}`}
                    className="h-4 w-4 text-gray-300"
                />
            );
        }

        return stars;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Không xác định";
        }
    };

    if (ratings.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="mb-6">
                    <User className="h-12 w-12 mx-auto text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có đánh giá nào
                </h3>
                <p className="text-gray-500">
                    Hãy là người đầu tiên đánh giá sân này sau khi bạn sử dụng
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        Đánh giá từ người dùng
                    </h2>
                    <div className="flex items-center">
                        <div className="flex mr-2">
                            {renderStars(averageRating)}
                        </div>
                        <span className="font-bold text-xl">
                            {averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 ml-2">
                            ({ratings.length} đánh giá)
                        </span>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    {displayRatings.map((rating) => (
                        <div
                            key={rating.rating_id}
                            className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium mr-3">
                                        {rating.user_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {rating.user_name}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                            {formatDate(rating.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    {renderStars(rating.rating)}
                                </div>
                            </div>
                            <p className="text-gray-700 mt-2">
                                {rating.comment}
                            </p>
                        </div>
                    ))}
                </div>

                {ratings.length > 5 && (
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll
                                ? "Hiển thị ít hơn"
                                : `Xem thêm ${ratings.length - 5} đánh giá`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
