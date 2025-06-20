// client/src/app/(client)/pricing/components/PricingContact.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    MessageCircle,
    Send,
    CheckCircle2,
    Users,
    Star,
} from "lucide-react";
import { toast } from "sonner";

interface ContactFormData {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    preferredContact: "phone" | "email" | "both";
}

export default function PricingContact() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
        preferredContact: "phone",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contactInfo = [
        {
            icon: <Phone className="h-6 w-6 text-blue-600" />,
            title: "Điện thoại",
            value: "0292.3855.246",
            description: "Hỗ trợ 24/7",
        },
        {
            icon: <Mail className="h-6 w-6 text-green-600" />,
            title: "Email",
            value: "sports@tvu.edu.vn",
            description: "Phản hồi trong 2h",
        },
        {
            icon: <MapPin className="h-6 w-6 text-red-600" />,
            title: "Địa chỉ",
            value: "Trường ĐH Trà Vinh",
            description: "126 Nguyễn Thiện Thành, Trà Vinh",
        },
        {
            icon: <Clock className="h-6 w-6 text-purple-600" />,
            title: "Giờ làm việc",
            value: "6:00 - 22:00",
            description: "Tất cả các ngày trong tuần",
        },
    ];

    const subjects = [
        "Tư vấn giá cả dịch vụ",
        "Đặt sân theo gói",
        "Ưu đãi sinh viên",
        "Tổ chức sự kiện",
        "Khiếu nại dịch vụ",
        "Đối tác kinh doanh",
        "Khác",
    ];

    const handleInputChange = (field: keyof ContactFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.phone ||
            !formData.subject ||
            !formData.message
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Implement API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.success(
                "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất."
            );

            // Reset form
            setFormData({
                name: "",
                phone: "",
                email: "",
                subject: "",
                message: "",
                preferredContact: "phone",
            });
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
            console.error("Error submitting contact form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Liên Hệ Tư Vấn
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Cần tư vấn về giá cả hoặc muốn đặt sân theo gói? Hãy
                            liên hệ với chúng tôi để được hỗ trợ tốt nhất!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Contact Methods */}
                            <div className="space-y-4">
                                {contactInfo.map((info, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {info.title}
                                            </h4>
                                            <p className="text-blue-600 font-medium">
                                                {info.value}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {info.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <h3 className="font-bold text-lg mb-4">
                                    Tại sao chọn chúng tôi?
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5" />
                                        <span className="text-sm">
                                            Phục vụ hơn 10,000+ khách hàng
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Star className="h-5 w-5" />
                                        <span className="text-sm">
                                            Đánh giá 4.8/5 sao
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm">
                                            Cam kết giá tốt nhất
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-semibold text-red-800 mb-2">
                                    Liên hệ khẩn cấp
                                </h4>
                                <p className="text-red-700 text-sm mb-2">
                                    Nếu bạn cần hỗ trợ gấp ngoài giờ làm việc:
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    <Phone className="h-4 w-4 mr-2" />
                                    0905.123.456
                                </Button>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    Gửi yêu cầu tư vấn
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Name */}
                                    <div>
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Họ và tên *
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nhập họ và tên của bạn"
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <Label
                                            htmlFor="phone"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Số điện thoại *
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nhập số điện thoại"
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Email */}
                                    <div>
                                        <Label
                                            htmlFor="email"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="email@example.com"
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Preferred Contact */}
                                    <div>
                                        <Label
                                            htmlFor="contact-method"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Hình thức liên hệ
                                        </Label>
                                        <Select
                                            value={formData.preferredContact}
                                            onValueChange={(
                                                value:
                                                    | "phone"
                                                    | "email"
                                                    | "both"
                                            ) =>
                                                handleInputChange(
                                                    "preferredContact",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="phone">
                                                    Gọi điện thoại
                                                </SelectItem>
                                                <SelectItem value="email">
                                                    Gửi email
                                                </SelectItem>
                                                <SelectItem value="both">
                                                    Cả hai
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="mb-6">
                                    <Label
                                        htmlFor="subject"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Chủ đề *
                                    </Label>
                                    <Select
                                        value={formData.subject}
                                        onValueChange={(value) =>
                                            handleInputChange("subject", value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn chủ đề tư vấn" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem
                                                    key={subject}
                                                    value={subject}
                                                >
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Message */}
                                <div className="mb-6">
                                    <Label
                                        htmlFor="message"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Nội dung *
                                    </Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "message",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Mô tả chi tiết yêu cầu của bạn..."
                                        rows={4}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Gửi yêu cầu tư vấn
                                        </>
                                    )}
                                </Button>

                                {/* Note */}
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    Bằng cách gửi form này, bạn đồng ý để chúng
                                    tôi liên hệ tư vấn. Thông tin của bạn sẽ
                                    được bảo mật tuyệt đối.
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Map or Additional Info */}
                    <div className="mt-12 bg-gray-50 rounded-xl p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="h-8 w-8 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Tư vấn miễn phí
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Đội ngũ chuyên viên giàu kinh nghiệm sẵn
                                    sàng tư vấn
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Phản hồi nhanh
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Cam kết phản hồi trong vòng 30 phút trong
                                    giờ làm việc
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Giá tốt nhất
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Cam kết mức giá cạnh tranh và nhiều ưu đãi
                                    hấp dẫn
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
