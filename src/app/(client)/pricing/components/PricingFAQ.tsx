// client/src/app/(client)/pricing/components/PricingFAQ.tsx
"use client";

import React, { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    HelpCircle,
    MessageCircle,
    Phone,
    Mail,
} from "lucide-react";
import { PricingFAQItem } from "../types/pricingTypes";

interface PricingFAQProps {
    faqs?: PricingFAQItem[];
    loading?: boolean;
}

export default function PricingFAQ({
    faqs = defaultFAQs,
    loading = false,
}: PricingFAQProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const categories = [
        { id: "all", label: "Tất cả", count: faqs.length },
        {
            id: "general",
            label: "Chung",
            count: faqs.filter((f) => f.category === "general").length,
        },
        {
            id: "booking",
            label: "Đặt sân",
            count: faqs.filter((f) => f.category === "booking").length,
        },
        {
            id: "payment",
            label: "Thanh toán",
            count: faqs.filter((f) => f.category === "payment").length,
        },
        {
            id: "cancellation",
            label: "Hủy sân",
            count: faqs.filter((f) => f.category === "cancellation").length,
        },
    ];

    const filteredFAQs =
        selectedCategory === "all"
            ? faqs
            : faqs.filter((faq) => faq.category === selectedCategory);

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="h-8 bg-gray-200 rounded mx-auto w-48 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mx-auto w-96"></div>
                        </div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg p-6 animate-pulse"
                                >
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                            <HelpCircle className="h-8 w-8 text-blue-600" />
                            Câu Hỏi Thường Gặp
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Tìm hiểu thêm về chính sách giá cả, quy trình đặt
                            sân và các dịch vụ của chúng tôi
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={
                                    selectedCategory === category.id
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className={`gap-2 ${
                                    selectedCategory === category.id
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-blue-50"
                                }`}
                            >
                                {category.label}
                                <Badge
                                    variant="secondary"
                                    className={`${
                                        selectedCategory === category.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {category.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFAQs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border-gray-100"
                                >
                                    <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-sm font-semibold">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900 pr-4">
                                                {faq.question}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4">
                                        <div className="ml-9 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* Contact Support */}
                    <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Vẫn cần hỗ trợ thêm?
                        </h3>
                        <p className="text-lg opacity-90 mb-6">
                            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ
                            bạn
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
                            >
                                <Phone className="h-5 w-5" />
                                Gọi ngay: 0292.3855.246
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-blue-600 gap-2"
                            >
                                <Mail className="h-5 w-5" />
                                Email hỗ trợ
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-blue-600 gap-2"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Chat trực tuyến
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Default FAQ data
const defaultFAQs: PricingFAQItem[] = [
    {
        question: "Giá thuê sân có bao gồm những gì?",
        answer: "Giá thuê sân bao gồm: sử dụng sân trong thời gian đã đặt, thiết bị cơ bản (lưới, cột), ánh sáng, và dịch vụ vệ sinh. Không bao gồm: thiết bị thể thao cá nhân (vợt, bóng), nước uống, và các dịch vụ bổ sung khác.",
        category: "general",
    },
    {
        question: "Có thể đặt sân trước bao lâu?",
        answer: "Bạn có thể đặt sân trước tối đa 30 ngày. Đối với các sự kiện đặc biệt hoặc đặt sân thường xuyên, vui lòng liên hệ trực tiếp với chúng tôi để được hỗ trợ tốt nhất.",
        category: "booking",
    },
    {
        question: "Chính sách thanh toán như thế nào?",
        answer: "Chúng tôi chấp nhận thanh toán bằng tiền mặt khi đến sân hoặc chuyển khoản ngân hàng. Đối với đặt sân online, bạn cần thanh toán 100% giá trị đặt sân để xác nhận booking.",
        category: "payment",
    },
    {
        question: "Có thể hủy sân không? Phí hủy sân là bao nhiêu?",
        answer: "Bạn có thể hủy sân miễn phí nếu hủy trước 24 giờ so với thời gian đã đặt. Hủy trong vòng 24 giờ sẽ bị tính phí 50% giá trị đặt sân. Hủy trong vòng 2 giờ hoặc không đến sẽ mất 100% tiền đặt cọc.",
        category: "cancellation",
    },
    {
        question: "Sinh viên TVU có được giảm giá không?",
        answer: "Có! Sinh viên TVU được giảm 20% cho tất cả các dịch vụ khi xuất trình thẻ sinh viên hợp lệ. Ưu đãi này áp dụng cho cả đặt sân và các dịch vụ bổ sung.",
        category: "general",
    },
    {
        question: "Giờ cao điểm được tính như thế nào?",
        answer: "Giờ cao điểm từ 18:00 - 22:00 các ngày trong tuần và cả ngày thứ 7, chủ nhật. Trong khung giờ này, giá sân sẽ tăng 20-30% so với giờ bình thường tùy theo loại sân.",
        category: "general",
    },
    {
        question: "Có thể thay đổi thời gian đặt sân không?",
        answer: "Bạn có thể thay đổi thời gian đặt sân miễn phí nếu thực hiện trước 4 giờ so với thời gian đã đặt và có sân trống ở thời gian mới. Thay đổi trong vòng 4 giờ sẽ tính phí 10% giá trị đặt sân.",
        category: "booking",
    },
    {
        question: "Có dịch vụ đặt sân theo gói tháng không?",
        answer: "Có! Chúng tôi có gói đặt sân theo tháng với mức giá ưu đãi lên đến 15%. Gói tháng bao gồm 8-12 lượt chơi tùy theo loại sân, có thể sử dụng linh hoạt trong tháng.",
        category: "booking",
    },
    {
        question: "Thanh toán online có an toàn không?",
        answer: "Tuyệt đối an toàn! Chúng tôi sử dụng cổng thanh toán được mã hóa SSL và tuân thủ các tiêu chuẩn bảo mật quốc tế. Thông tin thẻ của bạn sẽ được bảo vệ tuyệt đối.",
        category: "payment",
    },
    {
        question: "Nếu trời mưa thì sao?",
        answer: "Đối với sân ngoài trời: nếu trời mưa trong thời gian đã đặt, bạn có thể chuyển sang sân trong nhà (nếu có) hoặc đổi lịch miễn phí. Đối với sân trong nhà: không bị ảnh hưởng bởi thời tiết.",
        category: "cancellation",
    },
];
