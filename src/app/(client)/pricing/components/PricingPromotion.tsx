// client/src/app/(client)/pricing/components/PricingPromotion.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Gift,
    Clock,
    CheckCircle2,
    ArrowRight,
    Percent,
    Calendar,
    Users,
} from "lucide-react";
import { PricingPromotion } from "../types/pricingTypes";
import { formatDate } from "@/lib/utils";

interface PricingPromotionProps {
    promotions: PricingPromotion[];
    loading?: boolean;
}

export default function PricingPromotionComponent({
    promotions,
    loading = false,
}: PricingPromotionProps) {
    const getApplicableToText = (type: string) => {
        switch (type) {
            case "courts":
                return "Sân thể thao";
            case "services":
                return "Dịch vụ khác";
            case "all":
                return "Tất cả dịch vụ";
            default:
                return type;
        }
    };

    const isValidPromotion = (promotion: PricingPromotion) => {
        const now = new Date();
        const validTo = new Date(promotion.valid_to);
        return validTo > now;
    };

    const getTimeRemaining = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return `Còn ${diffDays} ngày`;
        } else if (diffDays > 0) {
            return `Còn ${diffDays} ngày`;
        } else {
            return "Hết hạn";
        }
    };

    if (loading) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                            >
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const validPromotions = promotions.filter(isValidPromotion);

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Khuyến Mãi Đặc Biệt
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Đừng bỏ lỡ các ưu đãi hấp dẫn dành riêng cho sinh viên
                        TVU và cộng đồng thể thao.
                    </p>
                </div>

                {/* Promotions Grid */}
                {validPromotions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {validPromotions.map((promotion) => (
                            <div
                                key={promotion.promotion_id}
                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full transform translate-x-16 -translate-y-16"></div>

                                {/* Header */}
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                            <Gift className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">
                                                {promotion.title}
                                            </h3>
                                            <Badge
                                                variant="secondary"
                                                className="bg-orange-100 text-orange-700 mt-1"
                                            >
                                                {getApplicableToText(
                                                    promotion.applicable_to
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Discount Badge */}
                                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-full flex items-center gap-1 font-bold">
                                        <Percent className="h-4 w-4" />-
                                        {promotion.discount_percentage}%
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 mb-4 relative z-10">
                                    {promotion.description}
                                </p>

                                {/* Conditions */}
                                {promotion.conditions &&
                                    promotion.conditions.length > 0 && (
                                        <div className="mb-4 relative z-10">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                Điều kiện áp dụng:
                                            </h4>
                                            <ul className="space-y-1">
                                                {promotion.conditions.map(
                                                    (condition, index) => (
                                                        <li
                                                            key={index}
                                                            className="text-sm text-gray-600 flex items-start gap-2"
                                                        >
                                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                                            {condition}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {/* Validity Period */}
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {formatDate(promotion.valid_from)} -{" "}
                                            {formatDate(promotion.valid_to)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span className="text-orange-600">
                                            {getTimeRemaining(
                                                promotion.valid_to
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="relative z-10">
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold group"
                                        size="lg"
                                    >
                                        Sử dụng ưu đãi ngay
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Hiện tại chưa có khuyến mãi nào
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Hãy theo dõi trang web để cập nhật các ưu đãi mới
                            nhất
                        </p>
                        <Button variant="outline">Xem tất cả dịch vụ</Button>
                    </div>
                )}

                {/* Student Discount Banner */}
                <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Users className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">
                            Ưu đãi sinh viên TVU
                        </h3>
                    </div>
                    <p className="text-lg opacity-90 mb-6">
                        Giảm giá 20% cho tất cả các dịch vụ dành riêng cho sinh
                        viên Trường Đại học Trà Vinh
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                            Đăng ký ngay
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-blue-600"
                        >
                            Tìm hiểu thêm
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
