import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Edit,
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { Venue } from "../types/venueTypes";
import VenueStatusBadge from "@/app/(admin)/dashboard/venues/components/VenueStatusBadge";
// import VenueStatusBadge from "./VenueStatusBadge";

interface VenueTableProps {
    venues: Venue[];
    onDelete: (venueId: number) => void;
    onToggleStatus: (
        venueId: number,
        status: "active" | "maintenance" | "inactive"
    ) => void;
    onEdit: (venueId: number) => void;
}

export default function VenueTable({
    venues,
    onDelete,
    onToggleStatus,
    onEdit,
}: VenueTableProps) {
    const [venueToDelete, setVenueToDelete] = useState<number | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleDeleteClick = (venueId: number) => {
        setVenueToDelete(venueId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (venueToDelete !== null) {
            onDelete(venueToDelete);
            setConfirmDialogOpen(false);
        }
    };

    const getImageUrl = (path: string | undefined) => {
        if (!path) return null;

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

    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (venues.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Không tìm thấy nhà thi đấu nào</p>
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
                            <TableHead>Tên nhà thi đấu</TableHead>
                            <TableHead className="hidden md:table-cell">
                                Địa điểm
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Sức chứa
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Trạng thái
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Ngày tạo
                            </TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues.map((venue, index) => (
                            <TableRow key={venue.venue_id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-9 w-9">
                                            {venue.image ? (
                                                <AvatarImage
                                                    src={
                                                        getImageUrl(
                                                            venue.image
                                                        ) || undefined
                                                    }
                                                    alt={venue.name}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {getInitials(venue.name)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {venue.name}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {venue.location}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {venue.capacity || "Chưa có"}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <VenueStatusBadge status={venue.status} />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {formatDate(venue.created_at)}
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
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                Thao tác
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit(venue.venue_id)
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
                                                    venue.status === "active"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        venue.venue_id,
                                                        "active"
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                <span>Đang hoạt động</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={
                                                    venue.status ===
                                                    "maintenance"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        venue.venue_id,
                                                        "maintenance"
                                                    )
                                                }
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                <span>Đang bảo trì</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={
                                                    venue.status === "inactive"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        venue.venue_id,
                                                        "inactive"
                                                    )
                                                }
                                            >
                                                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                                                <span>Ngừng hoạt động</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        venue.venue_id
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
                            Bạn có chắc chắn muốn xóa nhà thi đấu này? Hành động
                            này không thể hoàn tác và tất cả dữ liệu liên quan
                            cũng sẽ bị xóa.
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
