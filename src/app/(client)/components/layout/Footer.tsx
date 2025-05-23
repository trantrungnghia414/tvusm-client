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
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Logo & Giới thiệu */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/images/logo-tvusm-white.png"
                                alt="TVU Stadium Management"
                                width={180}
                                height={50}
                                className="h-12 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-400 mb-4">
                            Hệ thống quản lý nhà thi đấu hiện đại tại Trường Đại
                            học Trà Vinh, cung cấp dịch vụ đặt sân và tổ chức sự
                            kiện thể thao chuyên nghiệp.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/venues"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Nhà thi đấu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/courts"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Sân thể thao
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/booking"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Đặt sân
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/events"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Sự kiện
                                </Link>
                            </li>
                            <li>
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
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
                            Thông tin
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                            <li>
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
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
                            Liên hệ
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400">
                                    126 Nguyễn Thiện Thành, Phường 5, TP. Trà
                                    Vinh
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-400">
                                    +84 123 456 789
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-gray-400">
                                    tvusportshub@tvu.edu.vn
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-500 text-sm">
                    <p>
                        &copy; {new Date().getFullYear()} TVU Sports Hub. Tất cả
                        quyền được bảo lưu.
                    </p>
                    <p className="mt-2">
                        Được phát triển bởi Trần Trung Nghĩa - Đồ án tốt
                        nghiệp Đại học Trà Vinh
                    </p>
                </div>
            </div>
        </footer>
    );
}
