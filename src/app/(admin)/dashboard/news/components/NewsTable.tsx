import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import {
    Eye,
    Edit2,
    Trash2,
    Clock,
    CheckCircle,
    Archive,
    FileText,
    MoreHorizontal,
    ExternalLink,
    Star,
    LockIcon,
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { News } from "../types/newsTypes";

interface NewsTableProps {
    news: News[];
    onEdit: (newsId: number) => void;
    onDelete: (newsId: number) => void;
    onUpdateStatus: (
        newsId: number,
        status: "draft" | "published" | "archived"
    ) => void;
    onView: (newsId: number) => void;
}

export default function NewsTable({
    news,
    onEdit,
    onDelete,
    onUpdateStatus,
    onView,
}: NewsTableProps) {
    // Hàm định dạng ngày tháng
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // Lấy URL hình ảnh
    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        return `http://localhost:3000${path}?t=${timestamp}`;
    };

    // Hàm lấy chữ cái đầu để hiển thị khi không có ảnh
    const getInitials = (title: string) => {
        if (!title) return "N";
        const words = title.split(" ");
        if (words.length > 1) {
            return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
        }
        return title.slice(0, 2).toUpperCase();
    };

    // Truncate text
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    // Hàm trả về badge dựa trên trạng thái
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Đã xuất bản
                    </Badge>
                );
            case "draft":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        Bản nháp
                    </Badge>
                );
            case "archived":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                        <Archive className="mr-1 h-3 w-3" />
                        Đã lưu trữ
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (news.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <FileText className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Không có tin tức nào
                </h3>
                <p className="mt-1 text-gray-500">
                    Chưa có tin tức nào được thêm vào hệ thống.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-14"></TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Lượt xem</TableHead>
                        <TableHead>Ngày xuất bản</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {news.map((item) => (
                        <TableRow key={item.news_id}>
                            <TableCell>
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 relative">
                                    {item.thumbnail ? (
                                        <Image
                                            src={
                                                getImageUrl(item.thumbnail) ||
                                                ""
                                            }
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                            <span>
                                                {getInitials(item.title)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-1">
                                        <span className="font-medium">
                                            {truncateText(item.title, 50)}
                                        </span>
                                        {item.is_featured && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Tin nổi bật</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {item.is_internal && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <LockIcon className="h-3.5 w-3.5 text-gray-500" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Tin nội bộ</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {item.author_name || "Không có tác giả"}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                    {item.category_name || "Chưa phân loại"}
                                </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{item.view_count}</TableCell>
                            <TableCell>
                                {item.published_at
                                    ? formatDate(item.published_at)
                                    : "Chưa xuất bản"}
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
                                        <DropdownMenuItem
                                            onClick={() => onView(item.news_id)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Xem chi tiết</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onEdit(item.news_id)}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {item.status !== "published" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.news_id,
                                                        "published"
                                                    )
                                                }
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                <span>Xuất bản</span>
                                            </DropdownMenuItem>
                                        )}
                                        {item.status !== "draft" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.news_id,
                                                        "draft"
                                                    )
                                                }
                                            >
                                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                <span>Đặt thành bản nháp</span>
                                            </DropdownMenuItem>
                                        )}
                                        {item.status !== "archived" && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onUpdateStatus(
                                                        item.news_id,
                                                        "archived"
                                                    )
                                                }
                                            >
                                                <Archive className="mr-2 h-4 w-4 text-gray-500" />
                                                <span>Lưu trữ</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-blue-600">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            <span>Xem trên trang web</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() =>
                                                onDelete(item.news_id)
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
