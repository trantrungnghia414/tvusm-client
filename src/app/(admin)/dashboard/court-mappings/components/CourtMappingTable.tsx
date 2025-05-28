import React from "react";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { CourtMapping } from "../types";

interface CourtMappingTableProps {
    mappings: CourtMapping[];
    onEdit: (mappingId: number) => void;
    onDelete: (mappingId: number) => void;
}

export default function CourtMappingTable({
    mappings,
    onEdit,
    onDelete,
}: CourtMappingTableProps) {
    if (mappings.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">
                    Không tìm thấy mối quan hệ ghép sân nào
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Sân cha (sân lớn)</TableHead>
                        <TableHead>Sân con (sân nhỏ)</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mappings.map((mapping, index) => (
                        <TableRow key={mapping.mapping_id}>
                            <TableCell className="text-center font-medium text-gray-500">
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">
                                    {mapping.parent_court_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {mapping.parent_court_code}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">
                                    {mapping.child_court_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {mapping.child_court_code}
                                </div>
                            </TableCell>
                            <TableCell>
                                {mapping.position || "Không xác định"}
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
                                                onEdit(mapping.mapping_id)
                                            }
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() =>
                                                onDelete(mapping.mapping_id)
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
    );
}
