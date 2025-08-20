import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

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
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    CheckCircle,
    // WrenchIcon,
    Wrench, // Thay thế bằng biểu tượng Wrench
    AlertOctagon,
    // Image,
} from "lucide-react";
import { Equipment } from "../types/equipmentTypes";

interface EquipmentTableProps {
    equipments: Equipment[];
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
    onUpdateStatus: (id: number, status: string) => void;
}

export default function EquipmentTable({
    equipments,
    onDelete,
    onEdit,
    onView,
    onUpdateStatus,
}: EquipmentTableProps) {
    // Hàm lấy URL cho thumbnail
    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    };

    if (equipments.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Chưa có thiết bị nào</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg bg-white overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead className="w-[60px]">Ảnh</TableHead>
                        <TableHead className="min-w-[200px]">
                            Thiết bị
                        </TableHead>
                        <TableHead className="w-[120px]">Mã thiết bị</TableHead>
                        <TableHead className="w-[150px]">Danh mục</TableHead>
                        <TableHead className="w-[100px]">Trạng thái</TableHead>
                        <TableHead className="w-[120px]">Vị trí</TableHead>
                        <TableHead className="w-[120px]">Giá mua</TableHead>
                        <TableHead className="w-[120px]">Ngày mua</TableHead>
                        <TableHead className="w-[120px]">Bảo hành</TableHead>
                        <TableHead className="w-[100px] text-right">
                            Thao tác
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipments.map((item, index) => (
                        <TableRow key={item.equipment_id}>
                            <TableCell className="text-center font-medium text-gray-500">
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={getImageUrl(item.image) || ""}
                                            alt={item.name}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500">
                                            <Wrench className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span
                                        className="font-medium truncate"
                                        title={item.name}
                                    >
                                        {item.name.length > 40
                                            ? `${item.name.slice(0, 40)}...`
                                            : item.name}
                                    </span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {item.description.length > 50
                                                ? `${item.description.slice(
                                                      0,
                                                      50
                                                  )}...`
                                                : item.description}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>
                                {item.category_name ||
                                    `ID: ${item.category_id}`}
                            </TableCell>
                            <TableCell>
                                <EquipmentStatusBadge status={item.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm">
                                        {item.court_name
                                            ? `${item.court_name} (${item.court_code})`
                                            : item.venue_name}
                                    </span>
                                    {item.location_detail && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.location_detail}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.purchase_price
                                    ? formatCurrency(item.purchase_price)
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {formatDate(item.purchase_date)}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm">
                                        {formatDate(item.warranty_expiry)}
                                    </span>
                                    {item.warranty_expiry && (
                                        <span
                                            className={`text-xs ${
                                                new Date(item.warranty_expiry) <
                                                new Date()
                                                    ? "text-red-500"
                                                    : "text-green-500"
                                            }`}
                                        >
                                            {new Date(item.warranty_expiry) <
                                            new Date()
                                                ? "Hết hạn"
                                                : "Còn hạn"}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onView(item.equipment_id)
                                            }
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Xem chi tiết
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onEdit(item.equipment_id)
                                            }
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>
                                            Trạng thái
                                        </DropdownMenuLabel>

                                        {item.status !== "available" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.equipment_id,
                                                        "available"
                                                    )
                                                }
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                <span>Có sẵn</span>
                                            </DropdownMenuItem>
                                        )}

                                        {item.status !== "in_use" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.equipment_id,
                                                        "in_use"
                                                    )
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                                <span>Đang sử dụng</span>
                                            </DropdownMenuItem>
                                        )}

                                        {item.status !== "maintenance" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.equipment_id,
                                                        "maintenance"
                                                    )
                                                }
                                            >
                                                <Wrench className="mr-2 h-4 w-4 text-amber-500" />
                                                <span>Bảo trì</span>
                                            </DropdownMenuItem>
                                        )}

                                        {item.status !== "unavailable" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.equipment_id,
                                                        "unavailable"
                                                    )
                                                }
                                            >
                                                <AlertOctagon className="mr-2 h-4 w-4 text-gray-500" />
                                                <span>Không khả dụng</span>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onDelete(item.equipment_id)
                                            }
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
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

function EquipmentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "available":
            return (
                <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                >
                    Có sẵn
                </Badge>
            );
        case "in_use":
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                >
                    Đang dùng
                </Badge>
            );
        case "maintenance":
            return (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                >
                    Đang bảo trì
                </Badge>
            );
        case "unavailable":
            return (
                <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-700 border-gray-300"
                >
                    Không khả dụng
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
