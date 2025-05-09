// file OverviewContent được sử dụng để hiển thị các thông tin tổng quan về hệ thống

"use client";

import React from "react";
import {
    Users,
    Calendar,
    CreditCard,
    ListChecks,
    Plus,
    Clock,
    // FileText,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    // TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import MetricCard from "@/app/(admin)/dashboard/components/metrics/MetricCard";
import BookingRow from "@/app/(admin)/dashboard/components/metrics/BookingRow";
import FieldStatusItem from "@/app/(admin)/dashboard/components/metrics/FieldStatusItem";
import TodayScheduleItem from "@/app/(admin)/dashboard/components/metrics/TodayScheduleItem";
import UserItem from "@/app/(admin)/dashboard/components/metrics/UserItem";
import ActivityItem from "@/app/(admin)/dashboard/components/metrics/ActivityItem";



interface OverviewContentProps {
    stats: {
        totalUsers: number;
        todayBookings: number;
        monthlyRevenue: number;
        pendingRequests: number;
    };
    recentBookings: Array<{
        id: string;
        user: string;
        field: string;
        time: string;
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    }>;
}

export default function OverviewContent({
    stats,
    recentBookings,
}: OverviewContentProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thao tác mới
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Tổng người dùng"
                    value={stats.totalUsers.toLocaleString()}
                    change="+12.3%"
                    trend="up"
                    description="so với tháng trước"
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    iconBg="bg-blue-100"
                />
                <MetricCard
                    title="Lượt đặt sân hôm nay"
                    value={stats.todayBookings}
                    change="+8.5%"
                    trend="up"
                    description="so với hôm qua"
                    icon={<Calendar className="h-5 w-5 text-green-600" />}
                    iconBg="bg-green-100"
                />
                <MetricCard
                    title="Doanh thu tháng (M VNĐ)"
                    value={stats.monthlyRevenue}
                    change="+23.1%"
                    trend="up"
                    description="so với tháng trước"
                    icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                    iconBg="bg-purple-100"
                />
                <MetricCard
                    title="Yêu cầu chờ xử lý"
                    value={stats.pendingRequests}
                    change="-3"
                    trend="down"
                    description="so với hôm qua"
                    icon={<ListChecks className="h-5 w-5 text-orange-600" />}
                    iconBg="bg-orange-100"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-base">
                                Đặt sân gần đây
                            </CardTitle>
                            <CardDescription>
                                10 lượt đặt sân mới nhất
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            Xem tất cả
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Người đặt</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Sân
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Thời gian
                                    </TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        id={booking.id}
                                        user={booking.user}
                                        field={booking.field}
                                        time={booking.time}
                                        status={booking.status}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Tình trạng sân bãi
                        </CardTitle>
                        <CardDescription>
                            Cập nhật thời gian thực
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                        <div className="space-y-4">
                            <FieldStatusItem
                                name="Sân bóng đá 1"
                                status="available"
                                utilizationRate={60}
                            />
                            <FieldStatusItem
                                name="Sân bóng đá 2"
                                status="in-use"
                                utilizationRate={85}
                            />
                            <FieldStatusItem
                                name="Sân cầu lông A"
                                status="maintenance"
                                utilizationRate={42}
                            />
                            <FieldStatusItem
                                name="Sân cầu lông B"
                                status="available"
                                utilizationRate={58}
                            />
                            <FieldStatusItem
                                name="Sân bóng rổ"
                                status="in-use"
                                utilizationRate={75}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Lịch đặt sân hôm nay
                        </CardTitle>
                        <CardDescription>
                            {new Date().toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <TodayScheduleItem
                                time="08:00 - 09:30"
                                field="Sân cầu lông A"
                                user="Trần Thị Bình"
                                status="ongoing"
                            />
                            <TodayScheduleItem
                                time="09:30 - 11:00"
                                field="Sân cầu lông B"
                                user="Lê Văn Cường"
                                status="upcoming"
                            />
                            <TodayScheduleItem
                                time="14:00 - 16:00"
                                field="Sân bóng đá 1"
                                user="Nguyễn Văn An"
                                status="upcoming"
                            />
                            <TodayScheduleItem
                                time="16:30 - 18:00"
                                field="Sân bóng đá 2"
                                user="Phạm Thị Diệp"
                                status="upcoming"
                            />
                            <TodayScheduleItem
                                time="19:00 - 21:00"
                                field="Sân bóng rổ"
                                user="Hoàng Văn Em"
                                status="upcoming"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Xem lịch đầy đủ
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Người dùng mới
                        </CardTitle>
                        <CardDescription>7 ngày gần đây</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <UserItem
                                name="Nguyễn Văn An"
                                email="nguyenvan.an@gmail.com"
                                role="Sinh viên"
                                isNew
                            />
                            <UserItem
                                name="Trần Thị Bình"
                                email="tranthi.binh@gmail.com"
                                role="Giảng viên"
                            />
                            <UserItem
                                name="Lê Văn Cường"
                                email="levan.cuong@gmail.com"
                                role="Sinh viên"
                                isNew
                            />
                            <UserItem
                                name="Phạm Thị Diệp"
                                email="pham.diep@gmail.com"
                                role="Khách"
                            />
                            <UserItem
                                name="Hoàng Văn Em"
                                email="hoangvan.em@gmail.com"
                                role="Sinh viên"
                                isNew
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Hoạt động hệ thống
                        </CardTitle>
                        <CardDescription>
                            Cập nhật và thông báo mới
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <ActivityItem
                                type="booking"
                                message="Nguyễn Văn An đã đặt Sân bóng đá 1"
                                time="15 phút trước"
                            />
                            <ActivityItem
                                type="payment"
                                message="Thanh toán thành công cho đặt sân #B-2022"
                                time="2 giờ trước"
                            />
                            <ActivityItem
                                type="user"
                                message="Tài khoản mới: Lê Văn Cường"
                                time="5 giờ trước"
                            />
                            <ActivityItem
                                type="maintenance"
                                message="Bảo trì Sân cầu lông A hoàn thành"
                                time="Hôm qua"
                            />
                            <ActivityItem
                                type="update"
                                message="Cập nhật giá thuê sân bóng đá"
                                time="2 ngày trước"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Clock className="mr-2 h-4 w-4" />
                            Xem tất cả hoạt động
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
