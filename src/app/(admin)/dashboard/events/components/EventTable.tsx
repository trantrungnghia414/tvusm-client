import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    CalendarClock,
    CalendarX,
    Star,
    Trophy,
    GraduationCap,
    Users2,
    Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

import { Event } from "../types/eventTypes";

interface EventTableProps {
    events: Event[];
    onDelete: (eventId: number) => void;
    onEdit: (eventId: number) => void;
    onView: (eventId: number) => void;
    onUpdateStatus: (
        eventId: number,
        newStatus: "upcoming" | "ongoing" | "completed" | "cancelled"
    ) => void;
    confirmDeleteOpen: boolean;
    setConfirmDeleteOpen: (open: boolean) => void;
    confirmDelete: () => void;
}

export default function EventTable({
    events,
    onDelete,
    onEdit,
    onView,
    onUpdateStatus,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    confirmDelete,
}: EventTableProps) {
    // Thêm state cho hủy sự kiện
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [eventToCancel, setEventToCancel] = useState<number | null>(null);

    // Thêm hàm xử lý hủy sự kiện
    const handleCancelClick = (eventId: number) => {
        setEventToCancel(eventId);
        setConfirmCancelOpen(true);
    };

    // Hàm xác nhận hủy sự kiện
    const confirmCancel = () => {
        if (eventToCancel) {
            onUpdateStatus(eventToCancel, "cancelled");
        }
        setConfirmCancelOpen(false);
    };

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
                        <CheckCircle2 className="mr-1 h-3 w-3" />
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
                        <Users2 className="mr-1 h-3 w-3" />
                        Giao lưu
                    </Badge>
                );
            case "school_event":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                    >
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Sự kiện trường
                    </Badge>
                );
            case "other":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                    >
                        <Plus className="mr-1 h-3 w-3" />
                        Khác
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return undefined; // Thay thế null bằng undefined
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên sự kiện</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Địa điểm</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Người tham gia</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center h-32 text-muted-foreground"
                                >
                                    Không có dữ liệu sự kiện nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.event_id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0">
                                                {event.image ? (
                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                event.image
                                                            ) || ""
                                                        } // Thêm fallback là chuỗi rỗng
                                                        alt={event.title}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-blue-100 text-blue-500">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {event.title}
                                                    {event.is_featured && (
                                                        <Star className="inline-block ml-1 h-3 w-3 text-amber-500 fill-amber-500" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {event.description ||
                                                        "Không có mô tả"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getEventTypeBadge(event.event_type)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start">
                                            <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                                            <span className="text-sm">
                                                {event.venue_name ||
                                                    "Chưa có địa điểm"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {formatDate(
                                                        event.start_date
                                                    )}
                                                    {event.end_date &&
                                                        event.end_date !==
                                                            event.start_date &&
                                                        ` - ${formatDate(
                                                            event.end_date
                                                        )}`}
                                                </span>
                                            </div>
                                            {event.start_time && (
                                                <div className="flex items-center mt-1">
                                                    <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {formatTime(
                                                            event.start_time
                                                        )}
                                                        {event.end_time &&
                                                            ` - ${formatTime(
                                                                event.end_time
                                                            )}`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {event.current_participants}
                                                {event.max_participants &&
                                                    `/${event.max_participants}`}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(event.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <span className="sr-only">
                                                        Mở menu
                                                    </span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="h-4 w-4"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="1"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="5"
                                                            r="1"
                                                        />
                                                        <circle
                                                            cx="12"
                                                            cy="19"
                                                            r="1"
                                                        />
                                                    </svg>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onView(event.event_id)
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>Xem chi tiết</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onEdit(event.event_id)
                                                    }
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Chỉnh sửa</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuLabel>
                                                    Trạng thái
                                                </DropdownMenuLabel>

                                                {/* Chỉ hiển thị nút "Hủy sự kiện" nếu sự kiện chưa hủy hoặc hoàn thành */}
                                                {event.status !== "cancelled" &&
                                                    event.status !==
                                                        "completed" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleCancelClick(
                                                                    event.event_id
                                                                )
                                                            }
                                                        >
                                                            <CalendarX className="mr-2 h-4 w-4 text-red-500" />
                                                            <span>
                                                                Hủy sự kiện
                                                            </span>
                                                        </DropdownMenuItem>
                                                    )}

                                                {/* Hiển thị trạng thái hiện tại */}
                                                <DropdownMenuItem
                                                    disabled
                                                    className="opacity-50"
                                                >
                                                    {event.status ===
                                                        "upcoming" && (
                                                        <>
                                                            <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />
                                                            <span>
                                                                Sắp diễn ra (tự
                                                                động)
                                                            </span>
                                                        </>
                                                    )}
                                                    {event.status ===
                                                        "ongoing" && (
                                                        <>
                                                            <Clock className="mr-2 h-4 w-4 text-green-500" />
                                                            <span>
                                                                Đang diễn ra (tự
                                                                động)
                                                            </span>
                                                        </>
                                                    )}
                                                    {event.status ===
                                                        "completed" && (
                                                        <>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-gray-500" />
                                                            <span>
                                                                Đã hoàn thành
                                                                (tự động)
                                                            </span>
                                                        </>
                                                    )}
                                                    {event.status ===
                                                        "cancelled" && (
                                                        <>
                                                            <CalendarX className="mr-2 h-4 w-4 text-red-500" />
                                                            <span>Đã hủy</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        onDelete(event.event_id)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Xóa sự kiện</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog xác nhận xóa sự kiện */}
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

            {/* Thêm dialog xác nhận hủy sự kiện */}
            <AlertDialog
                open={confirmCancelOpen}
                onOpenChange={setConfirmCancelOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận hủy sự kiện
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy sự kiện này? Hành động này
                            sẽ thay đổi trạng thái sự kiện thành &quot;Đã hủy&quot; và
                            người dùng sẽ không thể tham gia sự kiện này nữa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hủy sự kiện
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
