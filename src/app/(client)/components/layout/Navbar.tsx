"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <header
            className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
            }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src={
                            isScrolled
                                ? "/images/logo-tvusm-blue.png"
                                : "/images/logo-tvusm-white.png"
                        }
                        alt="TVU Stadium Management"
                        width={180}
                        height={50}
                        className="h-10 w-auto"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link
                        href="/"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        href="/venues"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Nhà thi đấu
                    </Link>
                    <Link
                        href="/courts"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Sân thể thao
                    </Link>
                    <Link
                        href="/bookings"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Đặt sân
                    </Link>
                    <Link
                        href="/events"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Sự kiện
                    </Link>
                    <Link
                        href="/contact"
                        className={`font-medium hover:text-primary transition-colors ${
                            isScrolled ? "text-gray-800" : "text-white"
                        }`}
                    >
                        Liên hệ
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3">
                    {isLoggedIn ? (
                        <>
                            <Link href="/profile">
                                <Button
                                    variant="ghost"
                                    className={
                                        isScrolled
                                            ? "text-gray-800"
                                            : "text-white"
                                    }
                                >
                                    Tài khoản
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className={
                                    isScrolled
                                        ? "border-primary text-primary"
                                        : "border-white text-white"
                                }
                            >
                                Đăng xuất
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className={
                                        isScrolled
                                            ? "text-gray-800"
                                            : "text-white"
                                    }
                                >
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    variant="outline"
                                    className={
                                        isScrolled
                                            ? "border-primary text-primary"
                                            : "border-white text-white"
                                    }
                                >
                                    Đăng ký
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md text-gray-800"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X
                            className={
                                isScrolled ? "text-gray-800" : "text-white"
                            }
                            size={24}
                        />
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

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    <div className="px-4 py-3 space-y-3">
                        <Link
                            href="/"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/venues"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Nhà thi đấu
                        </Link>
                        <Link
                            href="/courts"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sân thể thao
                        </Link>
                        <Link
                            href="/bookings"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Đặt sân
                        </Link>
                        <Link
                            href="/events"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sự kiện
                        </Link>
                        <Link
                            href="/contact"
                            className="block font-medium text-gray-800 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Liên hệ
                        </Link>

                        <div className="pt-3 border-t border-gray-200">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/profile">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start mb-2"
                                        >
                                            Tài khoản
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="w-full border-primary text-primary"
                                    >
                                        Đăng xuất
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start mb-2"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button
                                            variant="outline"
                                            className="w-full border-primary text-primary"
                                        >
                                            Đăng ký
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
