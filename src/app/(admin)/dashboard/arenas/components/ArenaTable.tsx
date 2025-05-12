import React from "react";
import Image from "next/image";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
    AlertTriangle,
    XCircle,
} from "lucide-react";
import { Arena } from "../types/arenaTypes";
import ArenaStatus from "@/app/(admin)/dashboard/arenas/components/ArenaStatus";
// import ArenaStatus from "./ArenaStatus";

interface ArenaTableProps {
    arenas: Arena[];
    onDelete: (id: number) => void;
    onStatusChange: (id: number, newStatus: string) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
}

export default function ArenaTable({
    arenas,
    onDelete,
    onStatusChange,
    onView,
    onEdit,
}: ArenaTableProps) {
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
        }).format(date);
    };

    // Get icon and color for arena type
    const getArenaTypeInfo = (type: string) => {
        switch (type) {
            case "football":
                return {
                    label: "Sân bóng đá",
                    color: "bg-green-100 text-green-800",
                };
            case "volleyball":
                return {
                    label: "Sân bóng chuyền",
                    color: "bg-yellow-100 text-yellow-800",
                };
            case "basketball":
                return {
                    label: "Sân bóng rổ",
                    color: "bg-orange-100 text-orange-800",
                };
            case "badminton":
                return {
                    label: "Sân cầu lông",
                    color: "bg-blue-100 text-blue-800",
                };
            case "tennis":
                return {
                    label: "Sân tennis",
                    color: "bg-purple-100 text-purple-800",
                };
            case "swimming":
                return { label: "Hồ bơi", color: "bg-cyan-100 text-cyan-800" };
            default:
                return { label: "Khác", color: "bg-gray-100 text-gray-800" };
        }
    };

    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sân thể thao</TableHead>
                        <TableHead className="hidden md:table-cell">
                            Loại
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Giá / Giờ
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Trạng thái
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                            Số sân con
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                            Ngày tạo
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {arenas.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center py-10 text-gray-500"
                            >
                                Không có sân thể thao nào
                            </TableCell>
                        </TableRow>
                    ) : (
                        arenas.map((arena) => (
                            <TableRow key={arena.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 relative rounded-md overflow-hidden">
                                            <Image
                                                src={
                                                    arena.images[0] ||
                                                    "/images/placeholder.jpg"
                                                }
                                                alt={arena.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {arena.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {arena.address}
                                            </div>
                                            <div className="md:hidden text-xs mt-1">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        getArenaTypeInfo(
                                                            arena.type
                                                        ).color
                                                    }`}
                                                >
                                                    {
                                                        getArenaTypeInfo(
                                                            arena.type
                                                        ).label
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            getArenaTypeInfo(arena.type).color
                                        }`}
                                    >
                                        {getArenaTypeInfo(arena.type).label}
                                    </span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {formatPrice(arena.price_per_hour)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <ArenaStatus status={arena.status} />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                        {arena.sub_arenas.length}
                                    </span>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-gray-500 text-sm">
                                    {formatDate(arena.created_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => onView(arena.id)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>Xem chi tiết</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onEdit(arena.id)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Chỉnh sửa</span>
                                            </DropdownMenuItem>

                                            {/* Status change options */}
                                            {arena.status !== "active" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onStatusChange(
                                                            arena.id,
                                                            "active"
                                                        )
                                                    }
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>
                                                        Đánh dấu hoạt động
                                                    </span>
                                                </DropdownMenuItem>
                                            )}

                                            {arena.status !== "maintenance" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onStatusChange(
                                                            arena.id,
                                                            "maintenance"
                                                        )
                                                    }
                                                >
                                                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                                                    <span>
                                                        Đánh dấu bảo trì
                                                    </span>
                                                </DropdownMenuItem>
                                            )}

                                            {arena.status !== "inactive" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onStatusChange(
                                                            arena.id,
                                                            "inactive"
                                                        )
                                                    }
                                                >
                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <span>
                                                        Đánh dấu không hoạt động
                                                    </span>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() =>
                                                    onDelete(arena.id)
                                                }
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Xóa sân</span>
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
    );
}
