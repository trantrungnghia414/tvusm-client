"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Calendar,
    CreditCard,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Users,
    FileText,
    Home,
    MapPin,
    CalendarClock,
    BookOpen,
    ShoppingBag,
    AlertTriangle,
    Dumbbell,
    BadgePercent,
    Layers,
    GridIcon,
} from "lucide-react";
import SidebarCategory from "@/app/(admin)/dashboard/components/sidebar/SidebarCategory";
import SidebarItem from "@/app/(admin)/dashboard/components/sidebar/SidebarItem";
import Image from "next/image";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    mobileMenuOpen: boolean;
}

export default function Sidebar({ activeTab, mobileMenuOpen }: SidebarProps) {
    const router = useRouter();

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col md:relative transform transition-transform duration-200 md:translate-x-0 ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex h-14 items-center border-b px-4 flex-shrink-0 gap-2">
                <Image
                    src="/images/logotvu.png"
                    alt="LogoTVU"
                    width={4000}
                    height={4000}
                    className="h-10 w-10 rounded-full"
                />
                <h2 className="text-lg font-semibold">TVU Sports Center</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                <nav className="grid items-start px-2 text-sm">
                    <SidebarCategory label="TỔNG QUAN" />
                    <SidebarItem
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        title="Dashboard"
                        active={activeTab === "overview"}
                        onClick={() => router.push("/dashboard")}
                    />
                    <SidebarItem
                        icon={<Home className="h-4 w-4" />}
                        title="Trang chủ"
                        onClick={() => router.push("/")}
                    />

                    <SidebarCategory label="QUẢN LÝ CƠ SỞ" />
                    <SidebarItem
                        icon={<MapPin className="h-4 w-4" />}
                        title="Nhà thi đấu"
                        active={activeTab === "venues"}
                        onClick={() => router.push("/dashboard/venues")}
                    />
                    {/* Thêm mục Loại Sân mới */}
                    <SidebarItem
                        icon={<Layers className="h-4 w-4" />}
                        title="Loại sân"
                        active={activeTab === "court-types"}
                        onClick={() => router.push("/dashboard/court-types")}
                    />
                    <SidebarItem
                        icon={<Calendar className="h-4 w-4" />}
                        title="Sân thể thao"
                        active={activeTab === "courts"}
                        onClick={() => router.push("/dashboard/courts")}
                    />
                    <SidebarItem
                        icon={<GridIcon className="h-4 w-4" />}
                        title="Quản lý ghép sân"
                        active={activeTab === "court-mappings"}
                        onClick={() => router.push("/dashboard/court-mappings")}
                    />
                    <SidebarItem
                        icon={<Dumbbell className="h-4 w-4" />}
                        title="Thiết bị"
                        active={activeTab === "equipments"}
                        onClick={() => router.push("/dashboard/equipments")}
                    />
                    <SidebarItem
                        icon={<BadgePercent className="h-4 w-4" />}
                        title="Bảng giá"
                        active={activeTab === "pricings"}
                        onClick={() => router.push("/dashboard/pricings")}
                    />

                    <SidebarCategory label="QUẢN LÝ DỊCH VỤ" />
                    <SidebarItem
                        icon={<Calendar className="h-4 w-4" />}
                        title="Đặt sân"
                        active={activeTab === "bookings"}
                        onClick={() => router.push("/dashboard/bookings")}
                        count={8}
                    />
                    <SidebarItem
                        icon={<ShoppingBag className="h-4 w-4" />}
                        title="Thuê thiết bị"
                        active={activeTab === "rentals"}
                        onClick={() => router.push("/dashboard/rentals")}
                    />
                    <SidebarItem
                        icon={<CreditCard className="h-4 w-4" />}
                        title="Thanh toán"
                        active={activeTab === "payments"}
                        onClick={() => router.push("/dashboard/payments")}
                    />
                    <SidebarItem
                        icon={<AlertTriangle className="h-4 w-4" />}
                        title="Bảo trì"
                        active={activeTab === "maintenances"}
                        onClick={() => router.push("/dashboard/maintenances")}
                    />

                    <SidebarCategory label="QUẢN LÝ NỘI DUNG" />
                    <SidebarItem
                        icon={<CalendarClock className="h-4 w-4" />}
                        title="Sự kiện"
                        active={activeTab === "events"}
                        onClick={() => router.push("/dashboard/events")}
                    />
                    <SidebarItem
                        icon={<BookOpen className="h-4 w-4" />}
                        title="Tin tức"
                        active={activeTab === "news"}
                        onClick={() => router.push("/dashboard/news")}
                    />
                    <SidebarItem
                        icon={<MessageSquare className="h-4 w-4" />}
                        title="Phản hồi"
                        active={activeTab === "feedback"}
                        onClick={() => router.push("/dashboard/feedback")}
                        count={5}
                    />

                    <SidebarCategory label="QUẢN LÝ HỆ THỐNG" />
                    <SidebarItem
                        icon={<Users className="h-4 w-4" />}
                        title="Người dùng"
                        active={activeTab === "users"}
                        onClick={() => router.push("/dashboard/users")}
                    />
                    <SidebarItem
                        icon={<BarChart className="h-4 w-4" />}
                        title="Báo cáo & Thống kê"
                        active={activeTab === "reports"}
                        onClick={() => router.push("/dashboard/reports")}
                    />
                    <SidebarItem
                        icon={<FileText className="h-4 w-4" />}
                        title="Nhật ký hoạt động"
                        active={activeTab === "logs"}
                        onClick={() => router.push("/dashboard/logs")}
                    />
                    <SidebarItem
                        icon={<Settings className="h-4 w-4" />}
                        title="Cài đặt hệ thống"
                        active={activeTab === "settings"}
                        onClick={() => router.push("/dashboard/settings")}
                    />
                </nav>
            </div>
        </aside>
    );
}
