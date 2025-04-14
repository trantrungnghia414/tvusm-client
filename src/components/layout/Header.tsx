"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import LoginDialog from "@/components/auth/Login";
import RegisterDialog from "@/components/auth/Register";
import { Button } from "@/components/ui/button";

export default function Header() {
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMenuClick = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else {
            setIsMenuOpen(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className="bg-[#1e3a8a] text-white">
            {/* Top header - Fixed */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] border-b border-blue-700">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/images/logotvu.png"
                                alt="Logo TVU"
                                width={50}
                                height={50}
                                className="w-8 h-8 md:w-12 md:h-12"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-sm md:text-lg font-bold leading-tight">
                                    NHÀ THI ĐẤU TVU
                                </h1>
                                <p className="text-xs md:text-sm hidden sm:block">
                                    Trường Đại học Trà Vinh
                                </p>
                            </div>
                        </Link>

                        {/* Mobile navigation wrapper - Contains both button and menu */}
                        <div ref={menuRef} className="md:hidden">
                            {/* Mobile buttons */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white text-xs px-2 py-1"
                                    onClick={() => setShowLoginDialog(true)}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white text-blue-900 text-xs px-2 py-1"
                                    onClick={() => setShowRegisterDialog(true)}
                                >
                                    Đăng ký
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 p-1"
                                    onClick={handleMenuClick}
                                    aria-label={
                                        isMenuOpen ? "Close menu" : "Open menu"
                                    }
                                >
                                    {isMenuOpen ? (
                                        <X size={20} className="text-white" />
                                    ) : (
                                        <Menu
                                            size={20}
                                            className="text-white"
                                        />
                                    )}
                                </Button>
                            </div>

                            {/* Mobile menu content */}
                            <div
                                className={`${
                                    isMenuOpen ? "block" : "hidden"
                                } absolute left-0 right-0 top-[53px] border-t bg-[#1e3a8a]`}
                            >
                                <div className="container mx-auto px-4">
                                    <nav className="py-2">
                                        <ul className="flex flex-col gap-2">
                                            <li>
                                                <Link
                                                    href="/"
                                                    className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                >
                                                    Trang chủ
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/bookings"
                                                    className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                >
                                                    Đặt sân
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/events"
                                                    className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                >
                                                    Sự kiện thể thao
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/facilities"
                                                    className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                >
                                                    Cơ sở vật chất
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/news"
                                                    className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                >
                                                    Tin tức
                                                </Link>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Desktop navigation */}
                        <nav className="hidden md:flex items-center gap-4">
                            <Button
                                variant="ghost"
                                className="text-white hover:text-blue-900 transition-colors hover:cursor-pointer"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                variant="secondary"
                                className="bg-white text-blue-900 hover:bg-blue-100 transition-colors hover:cursor-pointer"
                                onClick={() => setShowRegisterDialog(true)}
                            >
                                Đăng ký ngay
                            </Button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Content wrapper with padding for fixed header */}
            <div className="pt-[60px] md:pt-[68px] max-sm:hidden">
                {/* Mobile menu */}
                <div className="bg-[#1e3a8a] md:relative">
                    <div className="container mx-auto px-4">
                        <nav className="hidden md:block py-2 md:py-4">
                            <ul className="flex flex-col md:flex-row gap-2 md:gap-6">
                                <li>
                                    <Link
                                        href="/"
                                        className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Trang chủ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/bookings"
                                        className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Đặt sân
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/events"
                                        className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sự kiện thể thao
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/facilities"
                                        className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Cơ sở vật chất
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/news"
                                        className="block py-2 px-3 hover:bg-blue-800 md:hover:bg-transparent md:p-0 md:hover:text-blue-200 text-sm md:text-base"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Tin tức
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <LoginDialog
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                onSwitchToRegister={() => {
                    setShowLoginDialog(false);
                    setShowRegisterDialog(true);
                }}
            />
            <RegisterDialog
                open={showRegisterDialog}
                onOpenChange={setShowRegisterDialog}
                onSwitchToLogin={() => {
                    setShowRegisterDialog(false);
                    setShowLoginDialog(true);
                }}
            />
        </header>
    );
}
