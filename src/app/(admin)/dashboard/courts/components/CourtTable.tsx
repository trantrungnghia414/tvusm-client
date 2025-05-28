import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Edit,
    Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CourtStatusBadge from "./CourtStatusBadge";
import { Court } from "../types/courtTypes";

interface CourtTableProps {
    courts: Court[];
    onDelete: (courtId: number) => void;
    onToggleStatus: (
        courtId: number,
        newStatus: "available" | "maintenance"
    ) => void;
    onEdit: (courtId: number) => void;
}

export default function CourtTable({
    courts,
    onDelete,
    onToggleStatus,
    onEdit,
}: CourtTableProps) {
    const [courtToDelete, setCourtToDelete] = useState<number | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleDeleteClick = (courtId: number) => {
        setCourtToDelete(courtId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (courtToDelete !== null) {
            onDelete(courtToDelete);
            setConfirmDialogOpen(false);
        }
    };

    const getImageUrl = (path: string | undefined) => {
        if (!path) return undefined; // Thay đổi từ null sang undefined

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();

        return `http://localhost:3000${path}?timestamp=${timestamp}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (courts.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Không tìm thấy sân nào</p>
            </div>
        );
    }

    return (
        <>
            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">STT</TableHead>
                            <TableHead>Tên sân</TableHead>
                            <TableHead>Mã sân</TableHead>
                            <TableHead className="hidden md:table-cell">
                                Nhà thi đấu
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Loại sân
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Giá thuê/giờ
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Trạng thái
                            </TableHead>
                            <TableHead className="hidden xl:table-cell">
                                Ngày tạo
                            </TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courts.map((court, index) => (
                            <TableRow key={court.court_id}>
                                <TableCell className="text-center font-medium text-gray-500">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={getImageUrl(
                                                    court.image ?? undefined
                                                )}
                                                alt={court.name}
                                                className="object-cover"    
                                            />
                                            <AvatarFallback>
                                                {getInitials(court.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {court.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground hidden md:block">
                                                {court.is_indoor
                                                    ? "Trong nhà"
                                                    : "Ngoài trời"}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="font-mono"
                                    >
                                        {court.code}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {court.venue_name}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {court.type_name}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {formatPrice(court.hourly_rate)}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <CourtStatusBadge status={court.status} />
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    {formatDate(court.created_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <span className="sr-only">
                                                    Menu
                                                </span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                Hành động
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit(court.court_id)
                                                }
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Chỉnh sửa</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuLabel>
                                                Trạng thái
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                disabled={
                                                    court.status === "available"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        court.court_id,
                                                        "available"
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                <span>Sẵn sàng sử dụng</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={
                                                    court.status ===
                                                    "maintenance"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        court.court_id,
                                                        "maintenance"
                                                    )
                                                }
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                <span>Đang bảo trì</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        court.court_id
                                                    )
                                                }
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Xóa</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sân này? Hành động này
                            không thể hoàn tác và tất cả dữ liệu liên quan cũng
                            sẽ bị xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
