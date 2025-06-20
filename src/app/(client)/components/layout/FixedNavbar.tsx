"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
    Newspaper, // ✅ Thêm icon cho tin tức
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

interface UserProfile {
    fullname?: string;
    role: string;
}

export default function FixedNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // ✅ Thêm tin tức vào danh sách routes
    const routes = [
        { path: "/", label: "Trang chủ" },
        { path: "/courts", label: "Sân thể thao" },
        { path: "/booking", label: "Đặt sân" },
        { path: "/venues", label: "Nhà thi đấu" },
        { path: "/events", label: "Sự kiện" },
        { path: "/news", label: "Tin tức" }, // ✅ Thêm tin tức
        { path: "/pricing", label: "Bảng giá" },
    ];

    // Kiểm tra đường dẫn hiện tại có khớp với route không
    const isActive = (path: string): boolean => {
        if (path === "/" && pathname === "/") return true;
        return path !== "/" && pathname.startsWith(path);
    };

    // Kiểm tra đăng nhập
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            fetchUserProfile(token);
        } else {
            setIsLoading(false);
        }

        // Event listener cho auth-state-changed
        const handleAuthChange = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
            if (token) {
                fetchUserProfile(token);
            }
        };

        // Đóng menu khi thay đổi kích thước màn hình
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("auth-state-changed", handleAuthChange);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("auth-state-changed", handleAuthChange);
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
            } else {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    setUserProfile(null);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setUserProfile(null);
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
        <header className="fixed top-0 w-full z-50 bg-white shadow-md py-2">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/logo-tvusm-blue.png"
                        alt="TVU Sports Hub"
                        width={180}
                        height={50}
                        className="h-8 sm:h-9 lg:h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop & Tablet Navigation */}
                <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                    {routes.map((route) => (
                        <Link
                            key={route.path}
                            href={route.path}
                            className={`font-medium text-sm xl:text-base transition-colors relative group text-gray-800
                                ${isActive(route.path) ? "font-bold" : ""}`}
                        >
                            {route.label}
                            <span
                                className={`absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transform origin-left transition-transform ${
                                    isActive(route.path)
                                        ? "scale-x-100"
                                        : "scale-x-0 group-hover:scale-x-100"
                                }`}
                            ></span>
                        </Link>
                    ))}
                </nav>

                {/* Desktop & Tablet Actions */}
                <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-800 hover:text-blue-600"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {!isLoading &&
                        (isLoggedIn ? (
                            <div className="flex items-center space-x-2">
                                <Link href="/profile">
                                    <Button
                                        variant="ghost"
                                        className={`flex items-center text-sm xl:text-base text-gray-800 hover:text-blue-600 ${
                                            isActive("/profile")
                                                ? "font-bold"
                                                : ""
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
                                    className="text-sm xl:text-base bg-blue-600 text-white hover:bg-blue-700"
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
                                        className={`flex items-center text-sm xl:text-base text-gray-800 hover:text-blue-600 ${
                                            isActive("/login")
                                                ? "font-bold"
                                                : ""
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
                                        className={`text-sm xl:text-base bg-blue-600 text-white hover:bg-blue-700 ${
                                            isActive("/register")
                                                ? "font-bold"
                                                : ""
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
                        <Menu className="text-gray-800" size={24} />
                    )}
                </button>
            </div>

            {/* Mobile Menu - Full Screen với animation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[55px] bg-white z-50 overflow-y-auto animate-in slide-in-from-top">
                    <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                        {/* Navigation Links */}
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <Home className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Trang chủ
                            {isActive("/") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        <Link
                            href="/courts"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/courts")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <Dumbbell className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Sân thể thao
                            {isActive("/courts") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        <Link
                            href="/booking"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/booking")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <CalendarDays className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Đặt sân
                            {isActive("/booking") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        <Link
                            href="/venues"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/venues")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <MapPin className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Nhà thi đấu
                            {isActive("/venues") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        <Link
                            href="/events"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/events")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <Calendar className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Sự kiện
                            {isActive("/events") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        {/* ✅ Thêm Tin tức vào mobile menu */}
                        <Link
                            href="/news"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/news")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <Newspaper className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Tin tức
                            {isActive("/news") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        <Link
                            href="/pricing"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center py-3 px-4 font-medium text-gray-800 transition-colors text-[15px] xs:text-base rounded-lg 
                                ${
                                    isActive("/pricing")
                                        ? "bg-blue-50 text-blue-700 font-bold"
                                        : "hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <CreditCard className="mr-3 h-5 w-5 text-blue-600 flex-shrink-0" />
                            Bảng giá
                            {isActive("/pricing") && (
                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                            )}
                        </Link>

                        {/* User Actions Section */}
                        <div className="pt-6 border-t border-gray-200 mt-4">
                            {!isLoading &&
                                (isLoggedIn ? (
                                    <div className="space-y-4">
                                        <Link
                                            href="/profile"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className={`flex items-center px-4 py-3 rounded-lg ${
                                                isActive("/profile")
                                                    ? "bg-blue-100 text-blue-800 font-bold"
                                                    : "bg-blue-50 text-blue-700"
                                            }`}
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
                                            {isActive("/profile") && (
                                                <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                                            )}
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
                                                className={`w-full py-5 justify-center border-blue-600 rounded-lg text-[15px] xs:text-base
                                                    ${
                                                        isActive("/login")
                                                            ? "bg-blue-100 text-blue-800 font-bold"
                                                            : "text-blue-600"
                                                    }`}
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
                                            <Button
                                                className={`w-full py-5 justify-center bg-blue-600 hover:bg-blue-700 rounded-lg text-[15px] xs:text-base
                                                    ${
                                                        isActive("/register")
                                                            ? "font-bold"
                                                            : ""
                                                    }`}
                                            >
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
