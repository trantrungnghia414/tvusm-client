import React from "react";
import { InfoIcon } from "lucide-react";

interface VenueDescriptionProps {
    description: string;
    isLoading?: boolean;
}

export default function VenueDescription({
    description,
    isLoading = false,
}: VenueDescriptionProps) {
    // Chuẩn hóa mô tả thành mảng các đoạn văn
    const formatDescription = (text: string) => {
        if (!text) return [];
        return text.split("\n").filter((paragraph) => paragraph.trim() !== "");
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-10 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
                <InfoIcon className="mr-2 h-5 w-5 text-blue-600" />
                Giới thiệu
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
                {formatDescription(description).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
}
