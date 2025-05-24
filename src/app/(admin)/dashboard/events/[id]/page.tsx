"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import {
    ArrowLeft,
    Edit,
    Trash2,
    CalendarClock,
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    CheckCircle,
    CalendarX,
    Trophy,
    Info,
    GraduationCap,
    Calendar as CalendarIcon,
    User,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// import DashboardLayout from "../../../components/layout/DashboardLayout";
// import LoadingSpinner from "@/components/ui/loading-spinner";

import { Event, Participant } from "../types/eventTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EventDetailPage() {
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;

    // Fetch thông tin sự kiện và người tham gia
    const fetchEventDetails = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục");
                router.push("/login");
                return;
            }

            // Fetch event details
            const eventResponse = await fetchApi(`/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!eventResponse.ok) {
                if (eventResponse.status === 404) {
                    toast.error("Không tìm thấy sự kiện");
                    router.push("/dashboard/events");
                    return;
                }
                throw new Error("Không thể tải thông tin sự kiện");
            }

            const eventData = await eventResponse.json();
            setEvent(eventData);

            // Fetch participants
            const participantsResponse = await fetchApi(
                `/events/${eventId}/participants`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json();
                setParticipants(participantsData);
            }
        } catch (error) {
            console.error("Error fetching event details:", error);
            toast.error("Đã xảy ra lỗi khi tải thông tin sự kiện");
        } finally {
            setLoading(false);
        }
    }, [eventId, router]);

    useEffect(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    // Xử lý xóa sự kiện
    const handleDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/events/${eventId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa sự kiện");
            }

            toast.success("Xóa sự kiện thành công");
            router.push("/dashboard/events");
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa sự kiện"
            );
        }
    };

    // Xử lý cập nhật trạng thái người tham gia
    const updateParticipantStatus = async (
        participantId: number,
        newStatus: "registered" | "confirmed" | "attended" | "cancelled"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/events/${eventId}/participants/${participantId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật trạng thái người tham gia"
                );
            }

            // Cập nhật lại danh sách người tham gia
            const updatedParticipants = participants.map((p) =>
                p.id === participantId ? { ...p, status: newStatus } : p
            );
            setParticipants(updatedParticipants);
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating participant status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái người tham gia"
            );
        }
    };

    // Helper functions
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5); // Format: HH:MM
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "upcoming":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        <CalendarClock className="mr-1 h-3 w-3" />
                        Sắp diễn ra
                    </Badge>
                );
            case "ongoing":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        Đang diễn ra
                    </Badge>
                );
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Đã hoàn thành
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                    >
                        <CalendarX className="mr-1 h-3 w-3" />
                        Đã hủy
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getEventTypeBadge = (type: string) => {
        switch (type) {
            case "competition":
                return (
                    <Badge variant="secondary">
                        <Trophy className="mr-1 h-3 w-3" />
                        Thi đấu
                    </Badge>
                );
            case "training":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                    >
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Tập luyện
                    </Badge>
                );
            case "friendly":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                        <Users className="mr-1 h-3 w-3" />
                        Giao lưu
                    </Badge>
                );
            case "school_event":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                    >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        Sự kiện trường
                    </Badge>
                );
            case "other":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                    >
                        <Info className="mr-1 h-3 w-3" />
                        Khác
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getParticipantStatusBadge = (status: string) => {
        switch (status) {
            case "registered":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        Đã đăng ký
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        Đã xác nhận
                    </Badge>
                );
            case "attended":
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                        Đã tham gia
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                    >
                        Đã hủy
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="events">
                <LoadingSpinner message="Đang tải thông tin sự kiện..." />
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout activeTab="events">
                <div className="text-center py-10">
                    <p className="text-red-500">Không tìm thấy sự kiện</p>
                    <Button
                        onClick={() => router.push("/dashboard/events")}
                        className="mt-4"
                    >
                        Quay lại danh sách sự kiện
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="events">
            <div className="space-y-6">
                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/dashboard/events")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold">
                            Chi tiết sự kiện
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push(`/dashboard/events/${eventId}/edit`)
                            }
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Event information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Main info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-xl">
                                            {event.title}
                                        </div>
                                        {event.is_featured && (
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        )}
                                    </div>
                                    {getStatusBadge(event.status)}
                                </div>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    {getEventTypeBadge(event.event_type)}
                                    <span className="text-gray-400">•</span>
                                    {event.is_public ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-50 text-xs"
                                        >
                                            Công khai
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="bg-gray-100 text-xs"
                                        >
                                            Riêng tư
                                        </Badge>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Event image */}
                                {event.image && (
                                    <div className="relative h-60 rounded-md overflow-hidden">
                                        <Image
                                            src={getImageUrl(event.image) || ""}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* Event description */}
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-medium mb-2">
                                        Mô tả
                                    </h3>
                                    <p className="text-gray-700">
                                        {event.description ||
                                            "Không có mô tả chi tiết."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs for participants and other info */}
                        <Tabs defaultValue="participants">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="participants">
                                    <Users className="mr-2 h-4 w-4" />
                                    Người tham gia ({participants.length})
                                </TabsTrigger>
                                <TabsTrigger value="details">
                                    <Info className="mr-2 h-4 w-4" />
                                    Chi tiết khác
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="participants" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Danh sách người tham gia
                                        </CardTitle>
                                        <CardDescription>
                                            {event.max_participants
                                                ? `${event.current_participants}/${event.max_participants} người`
                                                : `${event.current_participants} người tham gia`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {participants.length > 0 ? (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                Người dùng
                                                            </TableHead>
                                                            <TableHead>
                                                                Mã sinh viên
                                                            </TableHead>
                                                            <TableHead>
                                                                Ngày đăng ký
                                                            </TableHead>
                                                            <TableHead>
                                                                Trạng thái
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Thao tác
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {participants.map(
                                                            (participant) => (
                                                                <TableRow
                                                                    key={
                                                                        participant.id
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 relative">
                                                                                {participant.avatar ? (
                                                                                    <Image
                                                                                        src={
                                                                                            getImageUrl(
                                                                                                participant.avatar
                                                                                            ) ||
                                                                                            ""
                                                                                        }
                                                                                        alt={
                                                                                            participant.fullname ||
                                                                                            ""
                                                                                        }
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                                                        <User className="h-4 w-4" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {participant.fullname ||
                                                                                        participant.username}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {
                                                                                        participant.email
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {participant.student_id ||
                                                                            "-"}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {formatDate(
                                                                            participant.registration_date
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {getParticipantStatusBadge(
                                                                            participant.status
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() =>
                                                                                    updateParticipantStatus(
                                                                                        participant.id,
                                                                                        "confirmed"
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    participant.status ===
                                                                                    "confirmed"
                                                                                }
                                                                            >
                                                                                Xác
                                                                                nhận
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() =>
                                                                                    updateParticipantStatus(
                                                                                        participant.id,
                                                                                        "attended"
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    participant.status ===
                                                                                    "attended"
                                                                                }
                                                                            >
                                                                                Đã
                                                                                tham
                                                                                gia
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="text-red-500"
                                                                                onClick={() =>
                                                                                    updateParticipantStatus(
                                                                                        participant.id,
                                                                                        "cancelled"
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    participant.status ===
                                                                                    "cancelled"
                                                                                }
                                                                            >
                                                                                Hủy
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">
                                                    Chưa có người tham gia
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="details" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Thông tin bổ sung
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:gap-8">
                                                <dt className="font-medium text-gray-500 sm:w-1/3">
                                                    Người tổ chức:
                                                </dt>
                                                <dd className="sm:w-2/3">
                                                    {event.organizer_name ||
                                                        "Không có thông tin"}
                                                </dd>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:gap-8">
                                                <dt className="font-medium text-gray-500 sm:w-1/3">
                                                    Ngày tạo:
                                                </dt>
                                                <dd className="sm:w-2/3">
                                                    {formatDate(
                                                        event.created_at
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:gap-8">
                                                <dt className="font-medium text-gray-500 sm:w-1/3">
                                                    Cập nhật lần cuối:
                                                </dt>
                                                <dd className="sm:w-2/3">
                                                    {formatDate(
                                                        event.updated_at
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:gap-8">
                                                <dt className="font-medium text-gray-500 sm:w-1/3">
                                                    Hạn đăng ký:
                                                </dt>
                                                <dd className="sm:w-2/3">
                                                    {event.registration_deadline
                                                        ? formatDate(
                                                              event.registration_deadline
                                                          )
                                                        : "Không giới hạn"}
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right column - Sidebar info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Thông tin sự kiện
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start">
                                    <Calendar className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Thời gian</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(event.start_date)}
                                            {event.end_date &&
                                                event.end_date !==
                                                    event.start_date &&
                                                ` - ${formatDate(
                                                    event.end_date
                                                )}`}
                                        </p>
                                        {event.start_time && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {formatTime(event.start_time)}
                                                {event.end_time &&
                                                    ` - ${formatTime(
                                                        event.end_time
                                                    )}`}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start">
                                    <MapPin className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Địa điểm</p>
                                        <p className="text-sm text-gray-600">
                                            {event.venue_name}
                                        </p>
                                        {event.court_name && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {event.court_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start">
                                    <Users className="mr-3 h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            Số người tham gia
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {event.current_participants} người
                                            {event.max_participants &&
                                                ` / ${event.max_participants} người`}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            router.push(`/events/${eventId}`);
                                        }}
                                    >
                                        Xem trang công khai
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Alert dialog for delete confirmation */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa sự kiện
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sự kiện này? Hành động này
                            không thể hoàn tác và tất cả dữ liệu liên quan cũng
                            sẽ bị xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
