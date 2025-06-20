// client/src/app/(client)/pricing/components/ServicePricingCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star,
    CheckCircle2,
    Users,
    Wrench,
    GraduationCap,
    ArrowRight,
} from "lucide-react";
import { ServicePricing } from "../types/pricingTypes";
import { formatCurrency } from "@/lib/utils";

interface ServicePricingCardProps {
    service: ServicePricing;
    className?: string;
}

export default function ServicePricingCard({
    service,
    className = "",
}: ServicePricingCardProps) {
    const getImageUrl = (path: string | undefined): string => {
        if (!path) return "/images/placeholder-service.jpg";
        if (path.startsWith("http")) return path;
        return `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }${path}`;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "equipment":
                return <Wrench className="h-4 w-4" />;
            case "coaching":
                return <GraduationCap className="h-4 w-4" />;
            case "facility":
                return <Users className="h-4 w-4" />;
            default:
                return <Star className="h-4 w-4" />;
        }
    };

    const getCategoryName = (category: string) => {
        switch (category) {
            case "equipment":
                return "Thiết bị";
            case "coaching":
                return "Huấn luyện";
            case "facility":
                return "Tiện ích";
            default:
                return "Khác";
        }
    };

    const getUnitText = (unit: string) => {
        switch (unit) {
            case "hour":
                return "giờ";
            case "day":
                return "ngày";
            case "session":
                return "buổi";
            case "piece":
                return "cái";
            default:
                return unit;
        }
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative ${className}`}
        >
            {/* Popular Badge */}
            {service.popular && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Phổ biến
                    </Badge>
                </div>
            )}

            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={getImageUrl(service.image)}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <Badge
                        variant="default"
                        className="bg-blue-600 flex items-center gap-1"
                    >
                        {getCategoryIcon(service.category)}
                        {getCategoryName(service.category)}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                        {service.description}
                    </p>
                </div>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Bao gồm:
                        </h4>
                        <div className="space-y-1">
                            {service.features
                                .slice(0, 3)
                                .map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-xs text-gray-600"
                                    >
                                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        {feature}
                                    </div>
                                ))}
                            {service.features.length > 3 && (
                                <div className="text-xs text-blue-600">
                                    +{service.features.length - 3} tính năng
                                    khác
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="border-t pt-4 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Giá:</span>
                        <div className="text-right">
                            <span className="font-bold text-xl text-blue-600">
                                {formatCurrency(service.price)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                                / {getUnitText(service.unit)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                        Chi tiết
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 group">
                        Đặt ngay
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
