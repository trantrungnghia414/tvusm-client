import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#1e3a8a] to-[#1e3a8a]/95 text-white">
            <div className="container mx-auto px-4 py-6 md:py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo và thông tin - Full width on mobile, half on tablet/desktop */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-4">
                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg max-w-fit">
                            <Image
                                src="/images/logotvu.png"
                                alt="Logo TVU"
                                width={40}
                                height={40}
                                className="w-8 h-8 md:w-10 md:h-10"
                            />
                            <div>
                                <h3 className="font-bold text-xs md:text-sm tracking-wide">
                                    NHÀ THI ĐẤU TVU
                                </h3>
                                <p className="text-[10px] md:text-xs text-blue-200">
                                    Trường Đại học Trà Vinh
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs md:text-sm">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-200">
                                Số 126 Nguyễn Thiện Thành, P5, TP. Trà Vinh
                            </p>
                        </div>
                    </div>

                    {/* Services, Contact, Working Hours - Stack on mobile, row on tablet/desktop */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Dịch vụ */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-blue-200">
                                Dịch vụ
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    "Đặt sân trực tuyến",
                                    "Đăng ký sự kiện",
                                    "Thuê thiết bị",
                                ].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-xs md:text-sm text-gray-200 hover:text-white transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-200 rounded-full"></span>
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Liên hệ */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-blue-200">
                                Liên hệ
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-gray-200">
                                    <Phone className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                                    <span className="text-xs md:text-sm">
                                        (0294) 3855246
                                    </span>
                                </li>
                                <li className="flex items-center gap-2 text-gray-200">
                                    <Mail className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                                    <span className="text-xs md:text-sm">
                                        nhathidau@tvu.edu.vn
                                    </span>
                                </li>
                            </ul>
                            <div className="flex gap-3 pt-2">
                                {[Facebook, Instagram].map((Icon, index) => (
                                    <Link
                                        key={index}
                                        href="#"
                                        className="p-1.5 md:p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200"
                                    >
                                        <Icon className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Giờ làm việc */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-blue-200">
                                Giờ làm việc
                            </h3>
                            <ul className="space-y-2">
                                {[
                                    "Thứ 2 - Thứ 6: 7:00 - 21:00",
                                    "Thứ 7, CN: 7:00 - 17:00",
                                    "Ngày lễ: Theo thông báo",
                                ].map((time) => (
                                    <li
                                        key={time}
                                        className="flex items-center gap-2 text-gray-200"
                                    >
                                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-200" />
                                        <span className="text-xs md:text-sm">
                                            {time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 mt-6 md:mt-8 pt-4 md:pt-6 text-center">
                    <p className="text-xs md:text-sm text-gray-300">
                        © {new Date().getFullYear()} Nhà Thi Đấu - Trường Đại
                        học Trà Vinh
                    </p>
                </div>
            </div>
        </footer>
    );
}
