'use client'

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    Calendar,
    Users,
    Settings,
    FileText,
    BookOpen,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Trang chủ", icon: <Home className="w-5 h-5" />, href: "/" },
    {
        name: "Đặt sân",
        icon: <Calendar className="w-5 h-5" />,
        href: "/booking",
    },
    {
        name: "Lịch đặt sân",
        icon: <FileText className="w-5 h-5" />,
        href: "/schedule",
    },
    { name: "Nội quy", icon: <BookOpen className="w-5 h-5" />, href: "/rules" },
    { name: "Người dùng", icon: <Users className="w-5 h-5" />, href: "/users" },
    {
        name: "Cài đặt",
        icon: <Settings className="w-5 h-5" />,
        href: "/settings",
    },
];

export default function Nav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-[64px] left-0 w-full bg-white border-b border-gray-200 z-40">
            <div className="container mx-auto px-4">
                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-4 h-12">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                )}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Button
                        variant="ghost"
                        className="w-full flex justify-between items-center py-3"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="font-medium">Menu</span>
                        <Menu className="h-5 w-5" />
                    </Button>

                    {isOpen && (
                        <ul className="py-2 space-y-1">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                                            pathname === item.href
                                                ? "text-blue-600 bg-blue-50"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                        )}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}
