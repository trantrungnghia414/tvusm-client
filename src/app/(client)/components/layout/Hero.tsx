import React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: "20px 20px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="flex flex-col lg:flex-row items-center">
                    <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Khu phức hợp thể thao hiện đại tại{" "}
                            <span className="text-yellow-300">TVU</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8">
                            Hệ thống cơ sở vật chất thể thao đạt chuẩn quốc tế,
                            sẵn sàng phục vụ mọi nhu cầu rèn luyện sức khỏe và
                            tổ chức sự kiện của bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/booking">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
                                >
                                    <CalendarDays className="mr-2 h-5 w-5" />
                                    Đặt sân ngay
                                </Button>
                            </Link>
                            <Link href="/venues">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-white border-white hover:bg-white/10"
                                >
                                    Khám phá các sân
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                            {/* Decorative elements */}
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-50"></div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400 rounded-full opacity-50"></div>

                            <img
                                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=900&q=80"
                                alt="TVU Sports Complex"
                                className="w-full h-auto rounded-lg relative z-10"
                            />
                        </div>

                        {/* Stats overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-20">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-blue-700">
                                        10+
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Sân thể thao
                                    </p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-700">
                                        5k+
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Người sử dụng
                                    </p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-700">
                                        24/7
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Hoạt động
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
