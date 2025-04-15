"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginDialog from "@/components/auth/Login";
import RegisterDialog from "@/components/auth/Register";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-[#1e3a8a] text-white">
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] border-b border-blue-700">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2">
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

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-4">
                            <Button
                                variant="ghost"
                                className="text-white hover:text-blue-900 transition-colors"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                variant="secondary"
                                className="bg-white text-blue-900 hover:bg-blue-100 transition-colors"
                                onClick={() => setShowRegisterDialog(true)}
                            >
                                Đăng ký ngay
                            </Button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-blue-700">
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className="w-full text-white hover:text-blue-900 transition-colors"
                                    onClick={() => {
                                        setShowLoginDialog(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full bg-white text-blue-900 hover:bg-blue-100 transition-colors"
                                    onClick={() => {
                                        setShowRegisterDialog(true);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Đăng ký ngay
                                </Button>
                            </div>
                        </div>
                    )}
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
