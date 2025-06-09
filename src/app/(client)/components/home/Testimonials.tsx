import React from "react";
import { Star } from "lucide-react";
import Image from "next/image";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    avatar: string;
    content: string;
    rating: number;
}

export default function Testimonials() {
    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Nguyễn Văn An",
            role: "Sinh viên Khoa Kỹ thuật và Công nghệ",
            avatar: "/images/placeholder.jpg",
            content:
                "Tôi rất hài lòng với chất lượng sân cầu lông tại TVU Sports Hub. Hệ thống đặt sân trực tuyến rất dễ sử dụng và tiện lợi. Giá cả hợp lý cho sinh viên.",
            rating: 5,
        },
        {
            id: 2,
            name: "Trần Thị Bình",
            role: "Giảng viên Khoa Kinh tế",
            avatar: "/images/placeholder.jpg",
            content:
                "Nhà thi đấu TVU có cơ sở vật chất hiện đại, sạch sẽ và nhân viên phục vụ rất nhiệt tình. Tôi thường xuyên tổ chức các hoạt động thể thao cho sinh viên tại đây.",
            rating: 5,
        },
        {
            id: 3,
            name: "Lê Văn Cường",
            role: "Cựu sinh viên",
            avatar: "/images/placeholder.jpg",
            content:
                "Tôi đã tổ chức giải đấu bóng rổ tại TVU Sports Hub và rất hài lòng với dịch vụ. Hệ thống âm thanh, ánh sáng và các tiện nghi khác đều rất tốt.",
            rating: 4,
        },
    ];

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`h-4 w-4 ${
                    index < rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                }`}
            />
        ));
    };

    return (
        <section className="py-16 bg-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Đánh giá từ người dùng
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Khám phá những trải nghiệm và đánh giá từ sinh viên,
                        giảng viên và đối tác đã sử dụng dịch vụ tại nhà thi đấu
                        TVU
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        sizes="(max-width: 768px) 48px, 48px"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {testimonial.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {renderStars(testimonial.rating)}
                            </div>

                            <p className="text-gray-700 italic">
                                `{testimonial.content}`
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
