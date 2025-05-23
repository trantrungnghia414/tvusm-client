import React from "react";
import Link from "next/link";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
    return (
        <section className="relative bg-gradient-to-r from-blue-700 to-indigo-800 py-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: "30px 30px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Sẵn sàng trải nghiệm cơ sở vật chất thể thao hàng đầu?
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                        Đặt sân ngay hôm nay để tận hưởng những trải nghiệm thể
                        thao tuyệt vời tại TVU Sports Hub!
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        <Link href="/booking">
                            <Button
                                size="lg"
                                className="bg-white text-blue-700 hover:bg-blue-50"
                            >
                                <CalendarDays className="mr-2 h-5 w-5" />
                                Đặt sân ngay
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-white border-white hover:bg-white/10"
                            >
                                Liên hệ với chúng tôi
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                        <div className="flex items-center justify-center space-x-2">
                            <Phone className="h-5 w-5 text-blue-200" />
                            <span className="text-blue-100">
                                +84 123 456 789
                            </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <Mail className="h-5 w-5 text-blue-200" />
                            <span className="text-blue-100">
                                tvusportshub@tvu.edu.vn
                            </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 md:col-span-2">
                            <MapPin className="h-5 w-5 text-blue-200" />
                            <span className="text-blue-100">
                                126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
