import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
                    {/* Logo & Giới thiệu */}
                    <div className="mb-2 sm:mb-0">
                        <Link href="/" className="inline-block mb-3 sm:mb-4">
                            <Image
                                src="/images/logo-tvusm-white.png"
                                alt="TVU Stadium Management"
                                width={180}
                                height={50}
                                className="h-10 sm:h-12 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                            Hệ thống quản lý nhà thi đấu hiện đại tại Trường Đại
                            học Trà Vinh, cung cấp dịch vụ đặt sân và tổ chức sự
                            kiện thể thao chuyên nghiệp.
                        </p>
                        <div className="flex space-x-3 sm:space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Facebook className="h-4 sm:h-5 w-4 sm:w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Instagram className="h-4 sm:h-5 w-4 sm:w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter className="h-4 sm:h-5 w-4 sm:w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div className="mt-6 sm:mt-0">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 border-b border-gray-700 pb-2">
                            Liên kết nhanh
                        </h3>
                        <ul className="grid grid-cols-2 sm:block gap-2 text-sm sm:text-base">
                            <li className="sm:mb-2">
                                <Link
                                    href="/venues"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Nhà thi đấu
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/courts"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Sân thể thao
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/booking"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Đặt sân
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/events"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Sự kiện
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/pricing"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Bảng giá
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Thông tin */}
                    <div className="mt-6 sm:mt-0">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 border-b border-gray-700 pb-2">
                            Thông tin
                        </h3>
                        <ul className="grid grid-cols-2 sm:block gap-2 text-sm sm:text-base">
                            <li className="sm:mb-2">
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Giới thiệu
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/terms"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Điều khoản
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính sách
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/faq"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li className="sm:mb-2">
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div className="mt-6 lg:mt-0">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 border-b border-gray-700 pb-2">
                            Liên hệ
                        </h3>
                        <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                            <li className="flex items-start">
                                <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400">
                                    126 Nguyễn Thiện Thành, Phường 5, TP. Trà
                                    Vinh
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-400">
                                    +84 123 456 789
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-400">
                                    tvusportshub@tvu.edu.vn
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm">
                    <p>
                        &copy; {new Date().getFullYear()} TVU Sports Hub. Tất cả
                        quyền được bảo lưu.
                    </p>
                    <p className="mt-1 sm:mt-2">
                        Được phát triển bởi Trần Trung Nghĩa - Đồ án tốt nghiệp
                        Đại học Trà Vinh
                    </p>
                </div>
            </div>
        </footer>
    );
}
