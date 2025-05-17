import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourtType } from "../types";

interface CourtTypeTableProps {
    courtTypes: CourtType[];
    onDelete: (typeId: number) => void;
    onEdit: (typeId: number) => void;
}

export default function CourtTypeTable({
    courtTypes,
    onDelete,
    onEdit,
}: CourtTypeTableProps) {
    const [typeToDelete, setTypeToDelete] = useState<number | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleDeleteClick = (typeId: number) => {
        setTypeToDelete(typeId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (typeToDelete !== null) {
            onDelete(typeToDelete);
            setConfirmDialogOpen(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // Hàm lấy URL ảnh
    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return undefined;

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        return `http://localhost:3000${path}?t=${timestamp}`;
    };

    // Hàm lấy chữ cái đầu để hiển thị khi không có ảnh
    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (courtTypes.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Không tìm thấy loại sân nào</p>
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
                            <TableHead>Tên loại sân</TableHead>
                            <TableHead className="hidden md:table-cell">
                                Kích thước tiêu chuẩn
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Mô tả
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
                        {courtTypes.map((type, index) => (
                            <TableRow key={type.type_id}>
                                <TableCell className="font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {/* Thêm Avatar cho loại sân */}
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={getImageUrl(type.image)}
                                                alt={type.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback>
                                                {getInitials(type.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">
                                            {type.name}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {type.standard_size || "Chưa có thông tin"}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell max-w-xs truncate">
                                    {type.description || "Chưa có thông tin"}
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    {formatDate(type.created_at)}
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
                                                    onEdit(type.type_id)
                                                }
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Chỉnh sửa</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        type.type_id
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
                            Bạn có chắc chắn muốn xóa loại sân này? Hành động
                            này không thể hoàn tác và sẽ ảnh hưởng đến tất cả
                            sân thuộc loại này.
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
