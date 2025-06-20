// client/src/app/(client)/pricing/components/CourtPricingCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Home,
    Building,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import { CourtPricing } from "../types/pricingTypes";
import { formatCurrency } from "@/lib/utils";

interface CourtPricingCardProps {
    court: CourtPricing;
    className?: string;
}

export default function CourtPricingCard({
    court,
    className = "",
}: CourtPricingCardProps) {
    const getImageUrl = (path: string | undefined): string => {
        if (!path) return "/images/placeholder-court.jpg";
        if (path.startsWith("http")) return path;
        return `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }${path}`;
    };

    const hasDiscount =
        court.discount_percentage && court.discount_percentage > 0;
    const discountedPrice = hasDiscount
        ? court.hourly_rate * (1 - court.discount_percentage! / 100)
        : court.hourly_rate;

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={getImageUrl(court.image)}
                    alt={court.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="default" className="bg-blue-600">
                        {court.type_name}
                    </Badge>
                    {court.is_indoor ? (
                        <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                        >
                            <Building className="h-3 w-3 mr-1" />
                            Trong nhà
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-700"
                        >
                            <Home className="h-3 w-3 mr-1" />
                            Ngoài trời
                        </Badge>
                    )}
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="destructive" className="bg-red-500">
                            -{court.discount_percentage}%
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {court.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {court.venue_name}
                    </div>
                </div>

                {/* Description */}
                {court.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {court.description}
                    </p>
                )}

                {/* Surface Type */}
                {court.surface_type && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-gray-500">Mặt sân:</span>
                        <Badge variant="outline" className="text-xs">
                            {court.surface_type}
                        </Badge>
                    </div>
                )}

                {/* Amenities */}
                {court.amenities && court.amenities.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Tiện ích:
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                            {court.amenities
                                .slice(0, 3)
                                .map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-xs text-gray-600"
                                    >
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        {amenity}
                                    </div>
                                ))}
                            {court.amenities.length > 3 && (
                                <div className="text-xs text-blue-600">
                                    +{court.amenities.length - 3} tiện ích khác
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="border-t pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                            Giá cơ bản:
                        </span>
                        <div className="flex items-center gap-2">
                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(court.hourly_rate)}
                                </span>
                            )}
                            <span className="font-bold text-lg text-blue-600">
                                {formatCurrency(discountedPrice)} / giờ
                            </span>
                        </div>
                    </div>

                    {/* Peak Hours */}
                    {court.peak_rate && (
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                                Giờ cao điểm (18h-22h):
                            </span>
                            <span className="text-sm font-medium text-orange-600">
                                {formatCurrency(court.peak_rate)} / giờ
                            </span>
                        </div>
                    )}

                    {/* Weekend Rate */}
                    {court.weekend_rate && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Cuối tuần:
                            </span>
                            <span className="text-sm font-medium text-purple-600">
                                {formatCurrency(court.weekend_rate)} / giờ
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link href={`/courts/${court.court_id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                            Chi tiết
                        </Button>
                    </Link>
                    <Link
                        href={`/booking?court_id=${court.court_id}`}
                        className="flex-1"
                    >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 group">
                            Đặt ngay
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
