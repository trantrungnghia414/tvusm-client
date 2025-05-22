import React from "react";
import { Star } from "lucide-react";

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
            role: "Sinh viên",
            avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            content:
                "Tôi rất hài lòng với chất lượng sân cầu lông tại TVU Sports Hub. Hệ thống đặt sân trực tuyến rất dễ sử dụng và tiện lợi.",
            rating: 5,
        },
        {
            id: 2,
            name: "Trần Thị Bình",
            role: "Giảng viên",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            content:
                "Nhà thi đấu TVU có cơ sở vật chất hiện đại, sạch sẽ và nhân viên phục vụ rất nhiệt tình. Tôi thường xuyên tổ chức các hoạt động thể thao cho sinh viên tại đây.",
            rating: 5,
        },
        {
            id: 3,
            name: "Lê Văn Cường",
            role: "Cựu sinh viên",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            content:
                "Tôi đã tổ chức giải đấu bóng rổ tại TVU Sports Hub và rất hài lòng với dịch vụ. Hệ thống âm thanh, ánh sáng và các tiện nghi khác đều rất tốt.",
            rating: 4,
        },
    ];

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                }`}
            />
        ));
    };

    return (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Đánh giá từ người dùng
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Hãy xem những gì mọi người nói về trải nghiệm sử dụng
                        dịch vụ tại TVU Sports Hub
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {renderStars(testimonial.rating)}
                            </div>

                            <p className="text-gray-700">
                                {testimonial.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
