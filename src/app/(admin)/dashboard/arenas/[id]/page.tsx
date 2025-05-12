"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
// import { fetchApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Arena } from "../types/arenaTypes";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Edit,
    Clock,
    MapPin,
    DollarSign,
    Calendar,
    Check,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function ArenaDetailPage() {
    const [arena, setArena] = useState<Arena | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const arenaId = params.id as string;

    useEffect(() => {
        const fetchArena = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                // In a real app, you would fetch data from API
                // const response = await fetchApi(`/arenas/${arenaId}`, {
                //   headers: { Authorization: `Bearer ${token}` },
                // });

                // Dummy data for demonstration
                // Simulating an API response with a timeout
                setTimeout(() => {
                    const dummyArena: Arena = {
                        id: parseInt(arenaId),
                        name: "Sân bóng đá TVU",
                        address:
                            "Trường Đại học Trà Vinh, Phường 4, TP. Trà Vinh",
                        description:
                            "Sân bóng đá cỏ nhân tạo với tiêu chuẩn FIFA. Được trang bị hệ thống đèn chiếu sáng hiện đại, nhà vệ sinh riêng biệt, có phòng thay đồ và chỗ để xe rộng rãi.",
                        type: "football",
                        status: "active",
                        images: [
                            "/images/stadiums/football1.jpg",
                            "/images/stadiums/football2.jpg",
                            "/images/stadiums/football3.jpg",
                        ],
                        price_per_hour: 300000,
                        open_time: "06:00",
                        close_time: "22:00",
                        created_at: "2023-01-15T07:00:00Z",
                        updated_at: "2023-04-10T08:30:00Z",
                        sub_arenas: [
                            {
                                id: 1,
                                name: "Sân bóng đá 5A",
                                type: "football_5",
                                status: "active",
                            },
                            {
                                id: 2,
                                name: "Sân bóng đá 5B",
                                type: "football_5",
                                status: "maintenance",
                            },
                            {
                                id: 3,
                                name: "Sân bóng đá 7",
                                type: "football_7",
                                status: "active",
                            },
                        ],
                        features: [
                            "Đèn chiếu sáng",
                            "Vòi tắm",
                            "Phòng thay đồ",
                            "Chỗ để xe",
                            "Wifi miễn phí",
                            "Sân cỏ nhân tạo",
                            "Hệ thống âm thanh",
                        ],
                        rules: [
                            "Không hút thuốc",
                            "Không mang thức ăn vào sân",
                            "Không mang giày đinh sắt",
                            "Không nói tục, chửi thề",
                            "Đến đúng giờ hẹn",
                        ],
                    };

                    setArena(dummyArena);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error fetching arena:", error);
                toast.error("Không thể tải thông tin sân");
                setLoading(false);
            }
        };

        if (arenaId) {
            fetchArena();
        }
    }, [arenaId, router]);

    // Format price to VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Get status details
    const getStatusDetails = (status: string) => {
        switch (status) {
            case "active":
                return {
                    label: "Hoạt động",
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    color: "text-green-600",
                };
            case "maintenance":
                return {
                    label: "Đang bảo trì",
                    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                    color: "text-amber-600",
                };
            case "inactive":
                return {
                    label: "Không hoạt động",
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                    color: "text-red-600",
                };
            default:
                return {
                    label: "Không xác định",
                    icon: <Info className="h-5 w-5 text-gray-500" />,
                    color: "text-gray-600",
                };
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="arenas">
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    if (!arena) {
        return (
            <DashboardLayout activeTab="arenas">
                <div className="text-center py-12">
                    <p className="text-red-500">
                        Không tìm thấy sân thể thao này
                    </p>
                    <Button onClick={() => router.back()} className="mt-4">
                        Quay lại
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const statusDetails = getStatusDetails(arena.status);

    return (
        <DashboardLayout activeTab="arenas">
            <div className="space-y-6">
                {/* Header with back button and actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">{arena.name}</h1>
                        <div
                            className={`flex items-center gap-1 ${statusDetails.color}`}
                        >
                            {statusDetails.icon}
                            <span className="text-sm font-medium">
                                {statusDetails.label}
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            router.push(`/dashboard/arenas/${arena.id}/edit`)
                        }
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Images and info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Image carousel */}
                        <Card>
                            <CardContent className="p-0 overflow-hidden rounded-lg">
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {arena.images.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative aspect-video w-full">
                                                    <Image
                                                        src={image}
                                                        alt={`${
                                                            arena.name
                                                        } - Ảnh ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-2" />
                                    <CarouselNext className="right-2" />
                                </Carousel>
                            </CardContent>
                        </Card>

                        {/* Tabs for details, sub-arenas, etc. */}
                        <Tabs defaultValue="details">
                            <TabsList className="mb-4">
                                <TabsTrigger value="details">
                                    Thông tin chi tiết
                                </TabsTrigger>
                                <TabsTrigger value="sub-arenas">
                                    Sân con
                                </TabsTrigger>
                                <TabsTrigger value="rules">
                                    Tiện ích & Quy định
                                </TabsTrigger>
                            </TabsList>

                            {/* Details tab */}
                            <TabsContent value="details">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Thông tin sân thể thao
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">
                                                        Địa chỉ
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {arena.address}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">
                                                        Giá thuê
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {formatPrice(
                                                            arena.price_per_hour
                                                        )}{" "}
                                                        / giờ
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">
                                                        Giờ hoạt động
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {arena.open_time} -{" "}
                                                        {arena.close_time} hàng
                                                        ngày
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">
                                                        Thời gian cập nhật
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {formatDate(
                                                            arena.updated_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-medium mb-2">
                                                Mô tả
                                            </p>
                                            <p className="text-gray-600">
                                                {arena.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Sub-arenas tab */}
                            <TabsContent value="sub-arenas">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Danh sách sân con</CardTitle>
                                        <CardDescription>
                                            {arena.sub_arenas.length > 0
                                                ? `Tổng số ${arena.sub_arenas.length} sân con`
                                                : "Sân thể thao này chưa có sân con nào"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {arena.sub_arenas.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Tên sân
                                                        </TableHead>
                                                        <TableHead>
                                                            Loại
                                                        </TableHead>
                                                        <TableHead>
                                                            Trạng thái
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {arena.sub_arenas.map(
                                                        (subArena) => (
                                                            <TableRow
                                                                key={
                                                                    subArena.id
                                                                }
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        subArena.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        subArena.type
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={
                                                                            subArena.status ===
                                                                            "active"
                                                                                ? "secondary"
                                                                                : subArena.status ===
                                                                                  "maintenance"
                                                                                ? "outline"
                                                                                : "destructive"
                                                                        }
                                                                    >
                                                                        {subArena.status ===
                                                                        "active"
                                                                            ? "Hoạt động"
                                                                            : subArena.status ===
                                                                              "maintenance"
                                                                            ? "Đang bảo trì"
                                                                            : "Không hoạt động"}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                Chưa có sân con nào được thêm
                                                vào
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Rules and features tab */}
                            <TabsContent value="rules">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tiện ích</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {arena.features &&
                                            arena.features.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {arena.features.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                                <span>
                                                                    {feature}
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500">
                                                    Chưa có thông tin về tiện
                                                    ích
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Quy định</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {arena.rules &&
                                            arena.rules.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {arena.rules.map(
                                                        (rule, index) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                                <span>
                                                                    {rule}
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500">
                                                    Chưa có thông tin về quy
                                                    định
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right column - Summary card */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tóm tắt</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-lg bg-gray-50 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Loại sân:
                                        </span>
                                        <span className="font-medium">
                                            {arena.type === "football"
                                                ? "Sân bóng đá"
                                                : arena.type === "basketball"
                                                ? "Sân bóng rổ"
                                                : arena.type === "volleyball"
                                                ? "Sân bóng chuyền"
                                                : arena.type === "badminton"
                                                ? "Sân cầu lông"
                                                : arena.type === "tennis"
                                                ? "Sân tennis"
                                                : arena.type === "swimming"
                                                ? "Hồ bơi"
                                                : "Khác"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Số sân con:
                                        </span>
                                        <span className="font-medium">
                                            {arena.sub_arenas.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Giá thuê:
                                        </span>
                                        <span className="font-medium">
                                            {formatPrice(arena.price_per_hour)}{" "}
                                            / giờ
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Trạng thái:
                                        </span>
                                        <span
                                            className={`font-medium ${statusDetails.color}`}
                                        >
                                            {statusDetails.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Thời gian hoạt động
                                    </h3>
                                    <div className="p-3 rounded bg-gray-50 text-center">
                                        <p className="text-lg font-semibold">
                                            {arena.open_time} -{" "}
                                            {arena.close_time}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Hàng ngày
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                            <p className="text-sm text-gray-600">
                                                {arena.address}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Tạo ngày:{" "}
                                                    {formatDate(
                                                        arena.created_at
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Cập nhật:{" "}
                                                    {formatDate(
                                                        arena.updated_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/arenas/${arena.id}/edit`
                                        )
                                    }
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa thông tin
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/bookings/new?arenaId=${arena.id}`
                                        )
                                    }
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Tạo lịch đặt sân
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
