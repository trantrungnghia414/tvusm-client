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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Pencil,
    Trash,
    Settings,
    CheckCircle,
    Wrench,
    XCircle,
    Package,
} from "lucide-react";
import { Equipment } from "../types/equipmentTypes";
import { Badge } from "@/components/ui/badge";

interface EquipmentTableProps {
    equipment: Equipment[];
    onEdit: (equipmentId: number) => void;
    onDelete: (equipmentId: number) => void;
    onUpdateStatus: (
        equipmentId: number,
        status: "available" | "maintenance" | "unavailable"
    ) => void;
}

export default function EquipmentTable({
    equipment,
    onEdit,
    onDelete,
    onUpdateStatus,
}: EquipmentTableProps) {
    // Hàm định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Hàm lấy URL hình ảnh
    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    // Hàm trả về màu dựa trên trạng thái
    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-800";
            case "in_use":
                return "bg-blue-100 text-blue-800";
            case "maintenance":
                return "bg-orange-100 text-orange-800";
            case "unavailable":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Hàm chuyển đổi trạng thái thành tiếng Việt
    const translateStatus = (status: string) => {
        switch (status) {
            case "available":
                return "Sẵn sàng";
            case "in_use":
                return "Đang sử dụng";
            case "maintenance":
                return "Đang bảo trì";
            case "unavailable":
                return "Không khả dụng";
            default:
                return status;
        }
    };

    // Hiển thị thông báo nếu không có dữ liệu
    if (equipment.length === 0) {
        return (
            <div className="flex justify-center items-center py-8 border rounded-md">
                <p className="text-muted-foreground">
                    Không tìm thấy thiết bị nào
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Mã</TableHead>
                        <TableHead className="min-w-[200px]">
                            Thiết bị
                        </TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Khu vực</TableHead>
                        <TableHead className="text-center">SL</TableHead>
                        <TableHead className="text-center">
                            SL khả dụng
                        </TableHead>
                        <TableHead className="text-center">
                            Trạng thái
                        </TableHead>
                        <TableHead className="text-right">
                            Phí thuê/giờ
                        </TableHead>
                        <TableHead className="w-[80px] text-right">
                            Thao tác
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipment.map((item) => (
                        <TableRow key={item.equipment_id}>
                            <TableCell className="font-medium">
                                {item.code}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {item.image ? (
                                        <div className="relative h-10 w-10 rounded overflow-hidden border">
                                            <Image
                                                src={
                                                    getImageUrl(item.image) ||
                                                    "/placeholder-image.jpg"
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium">
                                            {item.name}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.category_name || "Không xác định"}
                            </TableCell>
                            <TableCell>
                                {item.venue_name || "Thiết bị chung"}
                            </TableCell>
                            <TableCell className="text-center">
                                {item.quantity}
                            </TableCell>
                            <TableCell className="text-center">
                                {item.available_quantity}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    className={`${getStatusColor(item.status)}`}
                                    variant="outline"
                                >
                                    {translateStatus(item.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(item.rental_fee)}
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
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onEdit(item.equipment_id)
                                            }
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>

                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Thay đổi trạng thái</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onUpdateStatus(
                                                                item.equipment_id,
                                                                "available"
                                                            )
                                                        }
                                                        disabled={
                                                            item.status ===
                                                            "available"
                                                        }
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        <span>Sẵn sàng</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onUpdateStatus(
                                                                item.equipment_id,
                                                                "maintenance"
                                                            )
                                                        }
                                                        disabled={
                                                            item.status ===
                                                            "maintenance"
                                                        }
                                                    >
                                                        <Wrench className="mr-2 h-4 w-4 text-orange-600" />
                                                        <span>
                                                            Đang bảo trì
                                                        </span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onUpdateStatus(
                                                                item.equipment_id,
                                                                "unavailable"
                                                            )
                                                        }
                                                        disabled={
                                                            item.status ===
                                                            "unavailable"
                                                        }
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                        <span>
                                                            Không khả dụng
                                                        </span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onDelete(item.equipment_id)
                                            }
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
