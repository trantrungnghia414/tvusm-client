import React from "react";

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({
    message = "Đang tải dữ liệu...",
}: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">{message}</p>
            </div>
        </div>
    );
}
