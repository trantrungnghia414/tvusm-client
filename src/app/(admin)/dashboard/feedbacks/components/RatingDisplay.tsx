// client/src/app/(admin)/dashboard/feedbacks/components/RatingDisplay.tsx
"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingDisplayProps {
    rating: number;
    size?: "sm" | "md" | "lg";
    showNumber?: boolean;
    className?: string;
}

export default function RatingDisplay({
    rating,
    size = "md",
    showNumber = true,
    className = "",
}: RatingDisplayProps) {
    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const starSize = sizeClasses[size];

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        className={`${starSize} ${
                            index < rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
            {showNumber && (
                <span
                    className={`text-gray-600 font-medium ${
                        size === "sm"
                            ? "text-xs"
                            : size === "lg"
                            ? "text-base"
                            : "text-sm"
                    }`}
                >
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
