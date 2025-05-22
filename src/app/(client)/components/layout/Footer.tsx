import React from "react";
import Link from "next/link";
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo & About */}
                    <div>
                        <Link
                            href="/"
                            className="flex items-center space-x-2 mb-4"
                        >
                            <span className="font-bold text-2xl text-white">
                                TVU
                            </span>
                            <span className="font-medium text-lg">
                                Sports Hub
                            </span>
                        </Link>
                        <p className="mb-4 text-sm">
                            Hệ thống quản lý nhà thi đấu và sân thể thao tại
                            Trường Đại học Trà Vinh, cung cấp dịch vụ đặt sân,
                            tổ chức sự kiện và các hoạt động thể thao.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-lg">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/venues"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Nhà thi đấu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/courts"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Sân thể thao
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/booking"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Đặt sân
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/events"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Sự kiện
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Bảng giá
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/equipment"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Thuê thiết bị
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-lg">
                            Hỗ trợ
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/faq"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Trợ giúp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-4 text-lg">
                            Thông tin liên hệ
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span>
                                    126 Nguyễn Thiện Thành, Khóm 4, Phường 5,
                                    TP. Trà Vinh, Tỉnh Trà Vinh
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                                <span>+84 123 456 789</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                                <span>support@tvuhub.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
                    <p>
                        &copy; {new Date().getFullYear()} TVU Sports Hub. Đã
                        đăng ký bản quyền.
                    </p>
                    <p className="mt-2 text-gray-500">
                        Trang web chính thức của Hệ thống quản lý nhà thi đấu và
                        sân thể thao Trường Đại học Trà Vinh.
                    </p>
                </div>
            </div>
        </footer>
    );
}
