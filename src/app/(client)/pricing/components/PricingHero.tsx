// client/src/app/(client)/pricing/components/PricingHero.tsx
"use client";

import React from "react";
import { Calculator, Clock, Star, TrendingDown } from "lucide-react";

export default function PricingHero() {
    const features = [
        {
            icon: <Calculator className="h-6 w-6 text-blue-600" />,
            title: "Giá cả minh bạch",
            description: "Không phát sinh chi phí ẩn",
        },
        {
            icon: <Clock className="h-6 w-6 text-green-600" />,
            title: "Đặt sân linh hoạt",
            description: "Theo giờ, theo ngày hoặc gói tháng",
        },
        {
            icon: <Star className="h-6 w-6 text-yellow-600" />,
            title: "Chất lượng cao",
            description: "Cơ sở vật chất hiện đại",
        },
        {
            icon: <TrendingDown className="h-6 w-6 text-purple-600" />,
            title: "Ưu đãi sinh viên",
            description: "Giảm giá đặc biệt cho sinh viên TVU",
        },
    ];

    return (
        <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Bảng Giá Dịch Vụ
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Trải nghiệm thể thao đỉnh cao với mức giá hợp lý tại TVU
                        Sports Hub. Chúng tôi cam kết mang đến giá trị tốt nhất
                        cho sinh viên và cộng đồng.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <a
                            href="/booking"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Đặt sân ngay
                        </a>
                        <a
                            href="#contact"
                            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Liên hệ tư vấn
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {feature.icon}
                                <h3 className="font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Promotion Banner */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mt-12 text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">
                        🎉 Ưu đãi đặc biệt cho sinh viên TVU!
                    </h3>
                    <p className="text-lg opacity-90 mb-4">
                        Giảm ngay 20% khi đặt sân vào các ngày trong tuần
                    </p>
                    <span className="bg-white text-orange-500 px-4 py-2 rounded-full font-semibold text-sm">
                        Sử dụng mã: TVUSTUDENT
                    </span>
                </div>
            </div>
        </section>
    );
}
