"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Menu,
    X,
    User,
    LogIn,
    LogOut,
    Search,
    Home,
    MapPin,
    Dumbbell,
    CalendarDays,
    Calendar,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

interface UserProfile {
    fullname?: string;
    role: string;
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Kiểm tra đăng nhập và xử lý scroll
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            fetchUserProfile(token);
        } else {
            setIsLoading(false);
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Đóng menu khi thay đổi kích thước màn hình
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [isMobileMenuOpen]);

    const fetchUserProfile = async (token: string) => {
        try {
            const response = await fetchApi("/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserProfile(null);
        toast.success("Đăng xuất thành công");
        router.push("/");
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled || isMobileMenuOpen
                    ? "bg-white shadow-md py-2"
                    : "bg-transparent py-4"
            }`}
        >
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src={
                            isScrolled || isMobileMenuOpen
                                ? "/images/logo-tvusm-blue.png"
                                : "/images/logo-tvusm-white.png"
                        }
                        alt="TVU Stadium Management"
                        width={180}
                        height={50}
                        className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop & Tablet Navigation */}
                <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                    <Link
                        href="/"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Trang chủ
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                    <Link
                        href="/venues"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Nhà thi đấu
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                    <Link
                        href="/courts"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Sân thể thao
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                    <Link
                        href="/booking"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Đặt sân
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                    <Link
                        href="/events"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Sự kiện
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                    <Link
                        href="/pricing"
                        className={`font-medium text-sm xl:text-base transition-colors relative group ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Bảng giá
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
                    </Link>
                </nav>

                {/* Desktop & Tablet Actions */}
                <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={
                            isScrolled
                                ? "text-gray-800 hover:text-blue-600"
                                : "text-white hover:text-blue-600"
                        }
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {!isLoading &&
                        (isLoggedIn ? (
                            <div className="flex items-center space-x-2">
                                <Link href="/profile">
                                    <Button
                                        variant="ghost"
                                        className={`flex items-center text-sm xl:text-base ${
                                            isScrolled
                                                ? "text-gray-800 hover:text-blue-600"
                                                : "text-white hover:text-blue-600"
                                        }`}
                                        size="sm"
                                    >
                                        <User className="mr-1.5 h-4 w-4" />
                                        <span className="hidden md:inline">
                                            {userProfile?.fullname ||
                                                "Tài khoản"}
                                        </span>
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    className={`text-sm xl:text-base ${
                                        isScrolled
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-white text-blue-600 hover:bg-blue-50"
                                    }`}
                                    size="sm"
                                >
                                    <LogOut className="mr-1.5 h-4 w-4" />
                                    <span className="hidden md:inline">
                                        Đăng xuất
                                    </span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        className={`flex items-center text-sm xl:text-base ${
                                            isScrolled
                                                ? "text-gray-800 hover:text-blue-600"
                                                : "text-white hover:text-blue-600"
                                        }`}
                                        size="sm"
                                    >
                                        <LogIn className="mr-1.5 h-4 w-4" />
                                        <span className="hidden md:inline">
                                            Đăng nhập
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        className={`text-sm xl:text-base ${
                                            isScrolled
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-white text-blue-600 hover:bg-blue-50"
                                        }`}
                                        size="sm"
                                    >
                                        <span>Đăng ký</span>
                                    </Button>
                                </Link>
                            </div>
                        ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 rounded-full"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="text-gray-800" size={24} />
                    ) : (
                        <Menu
                            className={
                                isScrolled ? "text-gray-800" : "text-white"
                            }
                            size={24}
                        />
                    )}
                </button>
            </div>

            {/* Mobile Menu - Full Screen với animation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[55px] bg-white z-50 overflow-y-auto animate-in slide-in-from-top">
                    <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <Home className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Trang chủ
                        </Link>
                        <Link
                            href="/venues"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <MapPin className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Nhà thi đấu
                        </Link>
                        <Link
                            href="/courts"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <Dumbbell className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Sân thể thao
                        </Link>
                        <Link
                            href="/booking"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <CalendarDays className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Đặt sân
                        </Link>
                        <Link
                            href="/events"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <Calendar className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Sự kiện
                        </Link>
                        <Link
                            href="/pricing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-[15px] xs:text-base"
                        >
                            <CreditCard className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Bảng giá
                        </Link>

                        <div className="pt-6 border-t border-gray-200 mt-4">
                            {!isLoading &&
                                (isLoggedIn ? (
                                    <div className="space-y-4">
                                        <Link
                                            href="/profile"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="flex items-center px-4 py-3 rounded-lg bg-blue-50 text-blue-700"
                                        >
                                            <User className="mr-3 h-5 w-5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-[15px] xs:text-base">
                                                    {userProfile?.fullname ||
                                                        "Tài khoản"}
                                                </p>
                                                <p className="text-xs xs:text-sm text-blue-600">
                                                    {userProfile?.role ===
                                                    "admin"
                                                        ? "Quản trị viên"
                                                        : "Người dùng"}
                                                </p>
                                            </div>
                                        </Link>

                                        <Button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full py-5 justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg text-[15px] xs:text-base"
                                        >
                                            <LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
                                            Đăng xuất
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Link
                                            href="/login"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full py-5 justify-center border-blue-600 text-blue-600 rounded-lg text-[15px] xs:text-base"
                                            >
                                                <LogIn className="mr-2 h-5 w-5 flex-shrink-0" />
                                                Đăng nhập
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="w-full"
                                        >
                                            <Button className="w-full py-5 justify-center bg-blue-600 hover:bg-blue-700 rounded-lg text-[15px] xs:text-base">
                                                Đăng ký tài khoản
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Footer info cho mobile */}
                    <div className="mt-auto py-6 px-4 text-center text-gray-500 text-xs xs:text-sm border-t border-gray-100 bg-gray-50">
                        <p>© {new Date().getFullYear()} TVU Sports Hub</p>
                        <p className="mt-1">Trường Đại học Trà Vinh</p>
                    </div>
                </div>
            )}
        </header>
    );
}
