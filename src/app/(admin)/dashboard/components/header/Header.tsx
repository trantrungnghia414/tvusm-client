"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchApi } from "@/lib/api";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    avatar?: string;
}

export default function Header({
    mobileMenuOpen,
    setMobileMenuOpen,
}: HeaderProps) {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            localStorage.removeItem("token");
            await signOut({ redirect: false });
            router.push("/login");
            toast.success("Đăng xuất thành công");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Đăng xuất thất bại");
        }
    };

    const handleProfileClick = () => {
        router.push("/profile");
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6 shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>

            {/* <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="w-full bg-gray-50 pl-8 focus-visible:ring-blue-500"
                />
            </div> */}

            <div className="flex items-center gap-2 ml-auto">
                {/* ✅ Thay thế notification cũ bằng NotificationDropdown mới */}
                <NotificationDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="relative h-9 w-9"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {userProfile?.fullname ||
                                        userProfile?.username}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userProfile?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfileClick}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Thông tin cá nhân</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Cài đặt</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
